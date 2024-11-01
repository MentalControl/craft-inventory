import { defineStore, storeToRefs } from 'pinia'
import { collection, addDoc, doc, updateDoc, onSnapshot } from 'firebase/firestore'
import { db } from '@/firebase'
import { useUserStore } from './userStore'
import { useSettingsStore } from './settingsStore'

export const useMaterialStore = defineStore('material', {
  state: () => ({
    materials: JSON.parse(localStorage.getItem('materials')) || [],
    loading: false,
    error: null
  }),

  actions: {
    subToMaterials() {
      const userStore = useUserStore()
      const materialsRef = collection(db, `users/${userStore.user.uid}/materials`)

      this.loading = true
      onSnapshot(
        materialsRef,
        (snapshot) => {
          this.materials = snapshot.docs.map((doc) => ({
            firestoreId: doc.id,
            ...doc.data()
          }))
          localStorage.setItem('materials', JSON.stringify(this.materials))
          this.loading = false
        },
        (error) => {
          this.setError(`Error fetching materials: ${error.message}`)
        }
      )
    },

    setMaterialQuantity(id, newQuantity) {
      const material = this.materials.find((m) => m.firestoreId === id)
      if (material) {
        material.quantity = newQuantity
        this.updateLocalStorage()
      }
    },

    async addMaterial(material) {
      const userStore = useUserStore()
      const materialWithUserId = { ...material, userId: userStore.user?.uid }
      try {
        await addDoc(collection(db, `users/${userStore.user.uid}/materials`), materialWithUserId)
      } catch (error) {
        this.setError(`Error adding material: ${error.message}`)
      }
    },

    getMaterialById(id) {
      return this.materials.find((m) => m.firestoreId === id)
    },

    async updateMaterial({ id, newQuantity, newUnit }) {
      const userStore = useUserStore()
      try {
        const materialRef = doc(db, `users/${userStore.user.uid}/materials`, id)
        await updateDoc(materialRef, { quantity: newQuantity, unit: newUnit })
        this.setMaterialQuantity(id, newQuantity)
      } catch (error) {
        this.setError(`Error updating material: ${error.message}`)
      }
    },

    async increaseMaterialQuantity(id, amount) {
      const material = this.materials.find((m) => m.firestoreId === id)
      if (material) {
        const newQuantity = material.quantity + amount
        await this.updateMaterialQuantity(id, newQuantity)
      }
    },

    decreaseMaterialQuantity(id, amount) {
      const material = this.materials.find((m) => m.firestoreId === id)
      if (material && material.quantity >= amount) {
        material.quantity -= amount
        this.updateLocalStorage()
      }
    },

    deleteMaterial(id) {
      const index = this.materials.findIndex((m) => m.firestoreId === id)
      if (index !== -1) {
        this.materials.splice(index, 1)
        this.updateLocalStorage()
      }
    },

    async updateMaterialQuantity(id, quantity) {
      const userStore = useUserStore()
      const materialRef = doc(db, `users/${userStore.user.uid}/materials`, id)
      try {
        await updateDoc(materialRef, { quantity })
        this.setMaterialQuantity(id, quantity)
      } catch (error) {
        this.setError(`Error updating quantity: ${error.message}`)
      }
    },

    updateLocalStorage() {
      localStorage.setItem('materials', JSON.stringify(this.materials))
    },

    setError(message) {
      this.error = message
      console.error(message)
      this.loading = false
    }
  },

  getters: {
    unitOptions() {
      const settingsStore = useSettingsStore()
      const { unitOptions } = storeToRefs(settingsStore)
      return unitOptions
    },
    categoryOptions() {
      const settingsStore = useSettingsStore()
      const { categoryOptions } = storeToRefs(settingsStore)
      return categoryOptions
    }
  }
})
