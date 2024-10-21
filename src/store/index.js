import { defineStore } from 'pinia'
import { collection, addDoc, doc, updateDoc, onSnapshot } from 'firebase/firestore'
import { db } from '@/firebase'
import { useUserStore } from './userStore'

export const useMaterialStore = defineStore('material', {
  state: () => ({
    materials: JSON.parse(localStorage.getItem('materials')) || [],
    unitOptions: [
      'шт', // Штуки
      'упк', // Упаковки
      'м', // Метры
      'бутыл', // Бутылки
      'рулон', // Рулоны
      'компл', // Комплекты
      'лист' // Листы
    ],
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
          const materialsData = snapshot.docs.map((doc) => ({
            firestoreId: doc.id,
            ...doc.data()
          }))
          this.materials = materialsData
          localStorage.setItem('materials', JSON.stringify(this.materials))
          this.loading = false
        },
        (error) => {
          this.error = 'Error fetching materials: ' + error.message
          this.loading = false
        }
      )
    },
    async addMaterial(material) {
      const userStore = useUserStore()
      try {
        const materialWithUserId = {
          ...material,
          userId: userStore.user?.uid
        }
        // Добавляем материал только в Firestore, локально не добавляем
        await addDoc(collection(db, `users/${userStore.user.uid}/materials`), materialWithUserId)
        // Локально ничего не обновляем. Подписка через onSnapshot сама сделает это.
      } catch (error) {
        console.error('Error adding document: ', error)
        throw error
      }
    },
    getMaterialById(id) {
      return this.materials.find((m) => m.id === id)
    },
    async updateMaterial({ id, newQuantity, newUnit }) {
      const userStore = useUserStore()
      try {
        const materialRef = doc(db, `users/${userStore.user.uid}/materials`, id)
        await updateDoc(materialRef, {
          quantity: newQuantity,
          unit: newUnit
        })

        // Обновление локального состояния
        const index = this.materials.findIndex((m) => m.id === id)
        if (index !== -1) {
          this.materials[index].quantity = newQuantity
          this.materials[index].unit = newUnit
          localStorage.setItem('materials', JSON.stringify(this.materials)) // Обновляем кэш
        }
      } catch (error) {
        this.error = 'Error updating material: ' + error.message
        throw error
      }
    },
    // Уменьшение количества материала
    decreaseMaterialQuantity(id, amount) {
      const material = this.materials.find((m) => m.id === id)
      if (material && material.quantity >= amount) {
        material.quantity -= amount
        localStorage.setItem('materials', JSON.stringify(this.materials)) // Обновляем кэш
      }
    },

    // Удаление материала из состояния
    deleteMaterial(id) {
      const index = this.materials.findIndex((m) => m.id === id)
      if (index !== -1) {
        this.materials.splice(index, 1)
        localStorage.setItem('materials', JSON.stringify(this.materials)) // Обновляем кэш
      }
    },

    // Добавление новых опций единиц измерения и категорий
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
    getMaterialsByCategory: (state) => (category) => {
      return state.materials.filter((material) => material.category === category)
    }
  }
})
