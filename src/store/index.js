// import { deleteMaterial } from '@/firebase'
import { defineStore } from 'pinia'
import { collection, addDoc, getDocs } from 'firebase/firestore'
import { db } from '@/firebase'

export const useMaterialStore = defineStore('material', {
  state: () => ({
    materials: [],
    unitOptions: [
      'шт', // Штуки
      'упк', // Упаковки
      'м', // Метры
      'бутыл', // Бутылки
      'рулон', // Рулоны
      'компл', // Комплекты
      'лист' // Листы
    ],
    categoryOptions: ['Прочее', 'Ткани', 'Фурнитура', 'Инструменты', 'Декор']
  }),
  actions: {
    async fetchMaterials() {
      try {
        const querySnapshot = await getDocs(collection(db, 'materials'))
        this.materials = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }))
      } catch (error) {
        console.error('Error fetching materials: ', error)
        throw error
      }
    },
    async addMaterial(material) {
      try {
        const docRef = await addDoc(collection(db, 'materials'), material)
        const newMaterial = { id: docRef.id, ...material }
        this.materials.push(newMaterial)
        return docRef.id
      } catch (error) {
        console.error('Error adding document: ', error)
        throw error
      }
    },
    decreaseMaterialQuantity(id, amount) {
      const material = this.materials.find((m) => m.id === id)
      if (material && material.quantity >= amount) {
        material.quantity -= amount
      }
    },
    getMaterialById(id) {
      return this.materials.find((m) => m.id === id)
    },
    updateMaterial(updatedMaterial) {
      const index = this.materials.findIndex((m) => m.id === updatedMaterial.id)
      if (index !== -1) {
        this.materials[index] = { ...this.materials[index], ...updatedMaterial }
      }
    },
    deleteMaterial(id) {
      const index = this.materials.findIndex((m) => m.id === id)
      if (index !== -1) {
        this.materials.splice(index, 1)
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
    getCategoryOptions: (state) => state.categoryOptions
  }
})
