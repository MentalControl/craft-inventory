import { defineStore } from 'pinia'
import { ref } from 'vue'
import { collection, addDoc, doc, updateDoc, onSnapshot, deleteDoc } from 'firebase/firestore'
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
    userStore: useUserStore(),
    activityStore: useActivityStore()
  }),
  actions: {
    setNotificationFunction(fn) {
      this.notify = fn
    },
    subToProducts() {
      const productsRef = collection(db, `users/${this.userStore.user.uid}/products`)

      this.loading = true
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
    async saveProduct() {
      const materialStore = useMaterialStore()

      const errors = await this.validateProductMaterials(this.newProduct.value)
      if (errors.length > 0) {
        errors.forEach((error) => {
          notificationRef.value.addNotification(error, 'error')
        })
        return
      }

      const productData = {
        name: newProduct.value.name,
        materials: newProduct.value.materials,
        repeatCount: 1
      }

      await this.addProduct(productData)

      for (const material of newProduct.value.materials) {
        const stockMaterial = materialStore.getMaterialById(material.firestoreId)
        if (stockMaterial) {
          const newQuantity = stockMaterial.quantity - material.quantity
          await this.updateMaterialQuantity(material.firestoreId, newQuantity)
          materialStore.setMaterialQuantity(material.firestoreId, newQuantity)
        } else {
          notificationRef.value.addNotification(
            `Материал с ID ${material.firestoreId} не найден в базе данных.`,
            'error'
          )
        }
      }

      notificationRef.value.addNotification(
        `Продукт ${productData.name} успешно создан!`,
        'success'
      )
      this.resetNewProductForm()
    },
    async addProduct(product) {
      try {
        const materialsUsed = product.materials.map((material) => ({
          materialId: material.firestoreId,
          name: material.name,
          quantityUsed: material.quantity,
          materialUnit: material.unit
        }))
        const productWithUserId = {
          ...product,
          userId: this.userStore.user?.uid
        }
        await addDoc(collection(db, `users/${this.userStore.user.uid}/products`), productWithUserId)
        const materialsInfo = materialsUsed
          .map((m) => `${m.name}: ${m.quantityUsed} ${m.materialUnit}`)
          .join(', ')
        this.activityStore.addActivity(
          `Создан продукт: <strong>"${product.name}"</strong>`,
          `Материалы потрачены: ${materialsInfo}`
        )
      } catch (error) {
        console.error('Error adding product: ', error)
        throw error
      }
    },
    async cancelProduct(product) {
      let hasErrors = false
      const materialStore = useMaterialStore()
      const notify = this.notify || useNotify() // если notify не задано в контексте компонента, используем глобальное уведомление

      // Проверяем, можно ли отменить продукт
      if (product.repeatCount <= 0) {
        notify && notify('Нельзя отменить продукт, который не был повторен', 'error')
        hasErrors = true
        return hasErrors
      }

      try {
        // Возвращаем материалы
        await Promise.all(
          product.materials.map(async (material) => {
            try {
              const currentMaterial = materialStore.getMaterialById(material.firestoreId)
              if (currentMaterial) {
                const newQuantity = currentMaterial.quantity + material.quantity
                await this.updateMaterialQuantity(material.firestoreId, newQuantity)
                materialStore.setMaterialQuantity(material.firestoreId, newQuantity)
              }
            } catch (materialError) {
              console.error('Ошибка при обработке материала:', materialError)
              notify && notify('Ошибка при обработке материала: ' + materialError.message, 'error')
              hasErrors = true
            }
          })
        )
        // Обновляем количество повторений
        product.repeatCount--

        if (product.repeatCount === 0) {
          // Если повторений больше нет, удаляем продукт
          await this.deleteProductFromDB(product)
          this.removeProduct(product.firestoreId)
          notify && notify(`Продукт ${product.name} успешно удален!`, 'success')
        } else {
          // Если повторения остались, обновляем продукт
          await this.updateProductInDB(product)
          notify &&
            notify(`Материалы возвращены. Осталось повторений: ${product.repeatCount}`, 'success')
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
      console.log('Updating product with ID:', id) // Добавьте этот лог
      try {
        const productRef = doc(db, `users/${this.userStore.user.uid}/products`, id)
        await updateDoc(productRef, updatedData)

        const index = this.products.findIndex((p) => p.firestoreId === id)
        if (index !== -1) {
          this.products[index] = { ...this.products[index], ...updatedData }
          localStorage.setItem('products', JSON.stringify(this.products)) // Обновляем кэш
        }
        this.activityStore.addActivity(
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
      try {
        const productRef = doc(db, `users/${this.userStore.user.uid}/products`, productId)
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

    async validateProductMaterials(product) {
      console.log('Переданный продукт:', product) // Логируем сам объект продукта
      console.log('Проверяем материалы продукта:', product.materials) // Логируем массив материалов

      if (!product || !product.materials) {
        console.error('Ошибка: продукт или материалы не найдены')
        return false // Возвращаем false, если продукт или его материалы не определены
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
    async repeatProduct(product) {
      let hasErrors = false
      const materialStore = useMaterialStore()
      const userStore = useUserStore()

      if (this.validateProductMaterials(product)) {
        return // Есть ошибки, уведомления уже показаны
      }

      try {
        console.log('Что то пошло')
        await Promise.all(
          product.materials.map(async (material) => {
            const currentMaterial = await getDoc(
              doc(db, `users/${userStore.user.uid}/materials`, material.firestoreId)
            )
            if (currentMaterial.exists()) {
              const newQuantity = currentMaterial.data().quantity - material.quantity
              await this.updateMaterialQuantity(material.firestoreId, newQuantity)
              materialStore.decreaseMaterialQuantity(material.firestoreId, material.quantity)
            }
          })
        )

        product.repeatCount++
        await this.updateProductInDB(product)
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
    async updateMaterialQuantity(materialId, newQuantity) {
      const userStore = useUserStore()

      const materialRef = doc(db, `users/${userStore.user.uid}/materials`, materialId)
      await updateDoc(materialRef, { quantity: newQuantity })
    },
    async resetNewProductForm() {
      newProduct.value = { name: '', materials: [], materialErrors: {} }
      showNewProductForm.value = false
    }
  },
  resetNewProductForm() {
    this.newProduct = { name: '', materials: [], materialErrors: {} }
  }
})
