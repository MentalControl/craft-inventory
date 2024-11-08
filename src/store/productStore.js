import { defineStore } from 'pinia'
import { collection, addDoc, doc, updateDoc, onSnapshot, deleteDoc } from 'firebase/firestore'
import { db } from '@/firebase'
import { useUserStore } from './userStore'
import { useActivityStore } from './activityStore'

export const useProductStore = defineStore('product', {
  state: () => ({
    products: JSON.parse(localStorage.getItem('products')) || [],
    loading: false,
    error: null
  }),
  actions: {
    subToProducts() {
      const userStore = useUserStore()
      const productsRef = collection(db, `users/${userStore.user.uid}/products`)

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
    async addProduct(product) {
      const activityStore = useActivityStore()
      const userStore = useUserStore()
      try {
        const materialsUsed = product.materials.map((material) => ({
          materialId: material.firestoreId,
          name: material.name,
          quantityUsed: material.quantity
        }))
        const productWithUserId = {
          ...product,
          userId: userStore.user?.uid
        }
        await addDoc(collection(db, `users/${userStore.user.uid}/products`), productWithUserId)
        const materialsInfo = materialsUsed.map((m) => `${m.name}: ${m.quantityUsed}`).join(', ')
        activityStore.addActivity(`Создан продукт "${product.name}"`, materialsInfo)
      } catch (error) {
        console.error('Error adding product: ', error)
        throw error
      }
    },
    async updateProduct({ id, updatedData }) {
      const userStore = useUserStore()
      try {
        const productRef = doc(db, `users/${userStore.user.uid}/products`, id)
        await updateDoc(productRef, updatedData)

        const index = this.products.findIndex((p) => p.firestoreId === id)
        if (index !== -1) {
          this.products[index] = { ...this.products[index], ...updatedData }
          localStorage.setItem('products', JSON.stringify(this.products)) // Обновляем кэш
        }
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
    }
  },
  getters: {
    getProducts: (state) => state.products
  }
})
