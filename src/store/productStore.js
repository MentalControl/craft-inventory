import { defineStore } from 'pinia'
import {
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  onSnapshot,
  deleteDoc,
  query,
  orderBy
} from 'firebase/firestore'
import { db } from '@/firebase'
import { useMaterialStore } from './materialStore'
import { useUserStore } from './userStore'
import { useActivityStore } from './activityStore'

export const useProductStore = defineStore('product', {
  state: () => ({
    products: JSON.parse(localStorage.getItem('products')) || [],
    newProduct: { name: '', materials: [], materialErrors: {} },
    notify: null,
    loading: false,
    error: null,
    showNewProductForm: false
    // userStore: useUserStore(),
    // activityStore: useActivityStore()
  }),
  actions: {
    showNewProductForm(callback) {
      this.showNewProductForm = callback
    },
    setNotificationFunction(fn) {
      this.notify = fn
    },
    subToProducts() {
      const userStore = useUserStore()
      const productsRef = collection(db, `users/${userStore.user.uid}/products`)

      this.loading = true
      const productsQuery = query(productsRef, orderBy('createdAt', 'desc'))
      onSnapshot(
        productsRef,
        (snapshot) => {
          const productsData = snapshot.docs.map((doc) => ({
            firestoreId: doc.id,
            ...doc.data()
          }))
          this.products = productsData
          localStorage.setItem('products', JSON.stringify(this.products))
          this.loading = false
        },
        (error) => {
          this.error = 'Error fetching products: ' + error.message
          this.loading = false
        }
      )
    },
    async addMaterialToProduct(material) {
      const materialStore = useMaterialStore()
      const existingMaterial = this.newProduct.materials.find(
        (m) => m.firestoreId === material.firestoreId
      )
      if (existingMaterial) {
        this.notify && this.notify(`Материал "${material.name}" уже добавлен`, 'error')
        return
      }

      // Логируем добавление материала
      console.log('Добавляем материал:', material)

      this.newProduct.materials.push({
        firestoreId: material.firestoreId,
        name: material.name,
        quantity: 1,
        unit: material.unit
      })
      materialStore.searchMaterial = ''
    },
    async changeMaterialQuantity(materialId, quantity) {
      const materialStore = useMaterialStore()
      const material = this.newProduct.materials.find((m) => m.firestoreId === materialId)
      if (material) {
        material.quantity = quantity
        const stockMaterial = materialStore.getMaterialById(materialId)
        if (stockMaterial && stockMaterial.quantity < quantity) {
          this.newProduct.materialErrors[materialId] =
            `Недостаточно материала "${material.name}". Доступно: ${stockMaterial.quantity} ${stockMaterial.unit}`
        } else {
          delete this.newProduct.materialErrors[materialId]
        }
      }
    },
    async saveProduct() {
      const materialStore = useMaterialStore()

      if (!this.newProduct || !this.newProduct.materials.length) {
        this.notify && this.notify('Добавьте материалы к продукту', 'error')
        return
      }

      const errors = await this.validateProductMaterials(this.newProduct)
      if (errors) {
        return
      }

      const productData = {
        name: this.newProduct.name,
        materials: this.newProduct.materials,
        repeatCount: 1,
        createdAt: new Date()
      }

      await this.addProduct(productData)

      for (const material of this.newProduct.materials) {
        const stockMaterial = materialStore.getMaterialById(material.firestoreId)
        if (stockMaterial) {
          const newQuantity = stockMaterial.quantity - material.quantity
          await this.updateMaterialQuantity(material.firestoreId, newQuantity)
          materialStore.setMaterialQuantity(material.firestoreId, newQuantity)
        } else {
          this.notify &&
            this.notify(`Материал с ID ${material.firestoreId} не найден в базе данных.`, 'error')
        }
      }

      this.notify && this.notify(`Продукт ${productData.name} успешно создан!`, 'success')
      this.resetNewProductForm()
    },
    async addProduct(product) {
      const userStore = useUserStore()
      const activityStore = useActivityStore()
      try {
        const materialsUsed = product.materials.map((material) => ({
          materialId: material.firestoreId,
          name: material.name,
          quantityUsed: material.quantity,
          materialUnit: material.unit
        }))
        const productWithUserId = {
          ...product,
          userId: userStore.user?.uid
        }
        await addDoc(collection(db, `users/${userStore.user.uid}/products`), productWithUserId)
        const materialsInfo = materialsUsed
          .map((m) => `${m.name}: ${m.quantityUsed} ${m.materialUnit}`)
          .join(', ')
        activityStore.addActivity(
          `<strong style="color:green">Создан продукт: "${product.name}"</strong>`,
          `<span style="color:red">Материалы потрачены: ${materialsInfo}</span>`
        )
      } catch (error) {
        console.error('Error adding product: ', error)
        throw error
      }
    },
    async cancelProduct(product) {
      const materialStore = useMaterialStore()
      const activityStore = useActivityStore()

      let hasErrors = false

      // Проверяем, можно ли отменить продукт
      if (product.repeatCount <= 0) {
        this.notify && this.notify('Нельзя отменить продукт, который не был повторен', 'error')
        hasErrors = true
        return hasErrors
      }

      try {
        const returnedMaterialsInfo = []

        // Возвращаем материалы
        await Promise.all(
          product.materials.map(async (material) => {
            try {
              const currentMaterial = materialStore.getMaterialById(material.firestoreId)
              if (currentMaterial) {
                const newQuantity = currentMaterial.quantity + material.quantity
                await this.updateMaterialQuantity(material.firestoreId, newQuantity)
                materialStore.setMaterialQuantity(material.firestoreId, newQuantity)

                // Добавляем информацию о возвращённом материале
                returnedMaterialsInfo.push(
                  `${material.name}: ${material.quantity} ${material.unit}`
                )
              }
            } catch (materialError) {
              console.error('Ошибка при обработке материала:', materialError)
              this.notify &&
                this.notify('Ошибка при обработке материала: ' + materialError.message, 'error')
              hasErrors = true
            }
          })
        )
        // Формируем строку с возвращенными материалами
        const returnedMaterialsText = returnedMaterialsInfo.join(', ')

        // Добавляем запись в активности
        activityStore.addActivity(
          `<strong style="color: red">Отмена изделия: "${product.name}"</strong>`,
          `<span style="color: green">Материалы возвращены: ${returnedMaterialsText}</span>`
        )

        // Обновляем количество повторений
        product.repeatCount--

        if (product.repeatCount === 0) {
          // Если повторений больше нет, удаляем продукт
          await this.deleteProductFromDB(product)
          this.removeProduct(product.firestoreId)
          activityStore.addActivity(
            `<strong style="color: red">Изделие "${product.name} испарилось"</strong>`
          )
          this.notify && this.notify(`Продукт ${product.name} успешно удален!`, 'success')
        } else {
          // Если повторения остались, обновляем продукт
          await this.updateProductInDB(product)
          this.notify &&
            this.notify(
              `Материалы возвращены. Осталось повторений: ${product.repeatCount}`,
              'success'
            )
        }
      } catch (error) {
        // Обработка ошибок
        console.error('Ошибка при отмене продукта:', error)
        notify && notify('Ошибка при отмене продукта: ' + error.message, 'error')
        hasErrors = true
      }

      return hasErrors
    },
    async updateProduct({ id, updatedData }) {
      const userStore = useUserStore()
      const activityStore = useActivityStore()
      console.log('Updating product with ID:', id) // Добавьте этот лог
      try {
        const productRef = doc(db, `users/${userStore.user.uid}/products`, id)
        await updateDoc(productRef, updatedData)

        const index = this.products.findIndex((p) => p.firestoreId === id)
        if (index !== -1) {
          this.products[index] = { ...this.products[index], ...updatedData }
          localStorage.setItem('products', JSON.stringify(this.products)) // Обновляем кэш
        }
        activityStore.addActivity(
          `Изделие обновлено: <strong>"${product.name}"</strong>`,
          `Материалы потрачены: ${materialsInfo}`
        )
        console.log('ЭТО произошло')
      } catch (error) {
        this.error = 'Error updating product: ' + error.message
        throw error
      }
    },
    async removeProduct(productId) {
      const userStore = useUserStore()
      try {
        const productRef = doc(db, `users/${userStore.user.uid}/products`, productId)
        await deleteDoc(productRef)

        // Update local state
        this.products = this.products.filter((product) => product.id !== productId)
        localStorage.setItem('products', JSON.stringify(this.products))
      } catch (error) {
        console.error('Error removing product:', error)
        this.error = 'Error removing product: ' + error.message
        throw error
      }
    },
    async repeatProduct(product) {
      let hasErrors = false
      const materialStore = useMaterialStore()
      const userStore = useUserStore()
      const activityStore = useActivityStore()

      if (await this.validateProductMaterials(product)) {
        return // Есть ошибки, уведомления уже показаны
      }

      try {
        const materialsInfo = []

        await Promise.all(
          product.materials.map(async (material) => {
            const currentMaterial = await getDoc(
              doc(db, `users/${userStore.user.uid}/materials`, material.firestoreId)
            )
            if (currentMaterial.exists()) {
              const newQuantity = currentMaterial.data().quantity - material.quantity
              await this.updateMaterialQuantity(material.firestoreId, newQuantity)
              materialStore.decreaseMaterialQuantity(material.firestoreId, material.quantity)

              materialsInfo.push(`${material.name}: ${material.quantity} ${material.unit}`)
            }
          })
        )

        product.repeatCount++
        await this.updateProductInDB(product)

        const materialsUsedText = materialsInfo.join(', ')

        activityStore.addActivity(
          `<strong style="color: green">Изделие повторено: "${product.name}"</strong>`,
          `<span style="color: red">Материалы потрачены: ${materialsUsedText}</span>`
        )
        this.notify && this.notify(`Продукт ${product.name} успешно повторен!`, 'success')
        hasErrors = true
      } catch (error) {
        console.error('Error in repeatProduct:', error)
        this.notify && this.notify('Произошла ошибка при повторении продукта', 'error')

        hasErrors = true
      }
      return hasErrors
    },
    async updateProductInDB(product) {
      const userStore = useUserStore()

      const productRef = doc(db, `users/${userStore.user.uid}/products`, product.firestoreId)
      await updateDoc(productRef, { repeatCount: product.repeatCount })
    },
    async deleteProductFromDB(product) {
      const userStore = useUserStore()

      const productRef = doc(db, `users/${userStore.user.uid}/products`, product.firestoreId)
      await deleteDoc(productRef)
    },
    async validateProductMaterials(product) {
      if (!product || !product.materials) {
        console.error('Ошибка: продукт или материалы не найдены')
        this.notify && this.notify('Ошибка: продукт или материалы не найдены', 'error')
        return true
      }

      let hasErrors = false
      const materialStore = useMaterialStore()

      for (const material of product.materials) {
        const stockMaterial = materialStore.getMaterialById(material.firestoreId)
        if (!stockMaterial) {
          this.notify && this.notify(`Материал "${material.name}" не найден в кладовке.`, 'error')
          hasErrors = true
        } else if (stockMaterial.quantity < material.quantity) {
          this.notify &&
            this.notify(
              `Недостаточно материала "${material.name}". Доступно: ${stockMaterial.quantity} ${stockMaterial.unit}`,
              'error'
            )
          hasErrors = true
        }
      }

      return hasErrors
    },
    async updateMaterialQuantity(materialId, newQuantity) {
      const userStore = useUserStore()

      const materialRef = doc(db, `users/${userStore.user.uid}/materials`, materialId)
      await updateDoc(materialRef, { quantity: newQuantity })
    },
    resetNewProductForm() {
      this.newProduct = { name: '', materials: [], materialErrors: {} }
      this.showNewProductForm = false
    }
  }
})
