import { defineStore, storeToRefs } from 'pinia'
import { ref } from 'vue'
import { collection, addDoc, doc, updateDoc, onSnapshot } from 'firebase/firestore'
import { db } from '@/firebase'
import { useUserStore } from './userStore'
import { useSettingsStore } from './settingsStore'
import { useActivityStore } from './activityStore'

export const useMaterialStore = defineStore('material', {
  state: () => ({
    materials: JSON.parse(localStorage.getItem('materials')) || [],
    searchMaterial: ref(''),
    loading: false,
    error: null
  }),

  actions: {
    getFilteredMaterials(searchQuery) {
      return this.materials.filter((material) =>
        material.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    },
    subToMaterials() {
      const userStore = useUserStore()
      if (!userStore.user || !userStore.user.uid) {
        return // Если пользователь не авторизован, прерываем выполнение
      }
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
      const activityStore = useActivityStore()
      const materialWithUserId = { ...material, userId: userStore.user?.uid }

      try {
        const unit = material.unit || 'Не указана' // Если unit отсутствует, используем значение по умолчанию

        await addDoc(collection(db, `users/${userStore.user.uid}/materials`), materialWithUserId)
        activityStore.addActivity(
          'Добавлен новый материал',
          `Материал: <strong>${material.name}</strong>, Количество: ${material.quantity} ${unit}`
        )
      } catch (error) {
        this.setError(`Error adding material: ${error.message}`)
      }
    },

    async getMaterialById(id) {
      return this.materials.find((m) => m.firestoreId === id)
    },

    async updateMaterial({ id, newQuantity, newUnit }) {
      const userStore = useUserStore()
      const activityStore = useActivityStore()

      try {
        const material = this.materials.find((m) => m.firestoreId === id)
        if (!material) throw new Error('Material not found')

        const updates = {}
        const activityDetails = []

        // Сопоставление полей и их названий с окончаниями
        const fieldNames = {
          quantity: { name: 'Количество', ending: 'изменено' },
          unit: { name: 'Единица измерения', ending: 'изменена' }
        }

        const checkAndUpdate = (field, newValue, oldValue) => {
          if (newValue !== oldValue) {
            updates[field] = newValue
            activityDetails.push(
              `${fieldNames[field].name} ${fieldNames[field].ending} с ${oldValue} на ${newValue}`
            )
          }
        }

        checkAndUpdate('quantity', newQuantity, material.quantity)
        checkAndUpdate('unit', newUnit, material.unit)

        // Если изменений нет, выходим из функции
        if (Object.keys(updates).length === 0) {
          console.log('No changes detected, skipping update.')
          return
        }

        const materialRef = doc(db, `users/${userStore.user.uid}/materials`, id)
        await updateDoc(materialRef, updates)

        // Добавляем активность, если были изменения
        if (activityDetails.length > 0) {
          activityStore.addActivity(
            'Материал обновлен',
            `Материал: <strong>${material.name}</strong>, ${activityDetails.join(', ')}`
          )
        }

        this.setMaterialQuantity(id, newQuantity)
      } catch (error) {
        console.error('Error in updateMaterial:', error)
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
    filteredMaterials(state) {
      return state.materials.filter(
        (material) =>
          material.quantity > 0 && // Исключаем материалы с количеством 0
          material.name.toLowerCase().includes(state.searchMaterial.toLowerCase())
      )
    },
    lowStockMaterials(state) {
      return state.materials.filter((material) => material.quantity < 10)
    },
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
