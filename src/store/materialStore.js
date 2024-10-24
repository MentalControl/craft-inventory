import { defineStore } from 'pinia'
import { collection, addDoc, doc, updateDoc, onSnapshot } from 'firebase/firestore'
import { db } from '@/firebase'
import { useUserStore } from './userStore'

export const useMaterialStore = defineStore('material', {
  state: () => ({
    materials: JSON.parse(localStorage.getItem('materials')) || [],
    unitOptions: ['шт', 'упк', 'м', 'бутыл', 'рулон', 'компл', 'лист'],
    categoryOptions: ['Прочее', 'Ткани', 'Фурнитура', 'Инструменты', 'Декор'],
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
          this.error = 'Error fetching materials: ' + error.message
          this.loading = false
        }
      )
    },

    setMaterialQuantity(id, newQuantity) {
      const material = this.materials.find((m) => m.firestoreId === id)
      if (material) {
        material.quantity = newQuantity
        localStorage.setItem('materials', JSON.stringify(this.materials))
      }
    },

    async addMaterial(material) {
      const userStore = useUserStore()
      try {
        const materialWithUserId = {
          ...material,
          userId: userStore.user?.uid
        }
        await addDoc(collection(db, `users/${userStore.user.uid}/materials`), materialWithUserId)
      } catch (error) {
        console.error('Error adding document: ', error)
        throw error
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
        this.error = 'Error updating material: ' + error.message
        throw error
      }
    },
    async increaseMaterialQuantity(id, amount) {
      const material = this.materials.find((m) => m.firestoreId === id)
      if (material) {
        const newQuantity = material.quantity + amount
        const userStore = useUserStore()
        try {
          const materialRef = doc(db, `users/${userStore.user.uid}/materials`, id)
          await updateDoc(materialRef, { quantity: newQuantity })

          // Update local state
          material.quantity = newQuantity
          localStorage.setItem('materials', JSON.stringify(this.materials))
        } catch (error) {
          console.error('Error increasing material quantity:', error)
          this.error = 'Error increasing material quantity: ' + error.message
          throw error
        }
      }
    },
    decreaseMaterialQuantity(id, amount) {
      const material = this.materials.find((m) => m.firestoreId === id)
      if (material && material.quantity >= amount) {
        material.quantity -= amount
        localStorage.setItem('materials', JSON.stringify(this.materials))
      }
    },

    deleteMaterial(id) {
      const index = this.materials.findIndex((m) => m.firestoreId === id)
      if (index !== -1) {
        this.materials.splice(index, 1)
        localStorage.setItem('materials', JSON.stringify(this.materials))
      }
    },

    addUnitOption(unit) {
      if (!this.unitOptions.includes(unit)) {
        this.unitOptions.push(unit)
      }
    },

    addCategoryOption(category) {
      if (!this.categoryOptions.includes(category)) {
        this.categoryOptions.push(category)
      }
    }
  },

  getters: {
    getUnitOptions: (state) => state.unitOptions,
    getCategoryOptions: (state) => state.categoryOptions,
    getMaterialsByCategory: (state) => (category) =>
      state.materials.filter((material) => material.category === category)
  }
})
