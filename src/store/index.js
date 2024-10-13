// import { deleteMaterial } from '@/firebase'
import { defineStore } from 'pinia'

export const useMaterialStore = defineStore('material', {
  state: () => ({
    materials: [
      { id: 1, name: 'Нитки', quantity: 10, unit: 'шт', category: 'Ткани' },
      { id: 2, name: 'Бусины', quantity: 50, unit: 'шт', category: 'Декор' },
      { id: 3, name: 'Бусины 3', quantity: 150, unit: 'шт', category: 'Декор' },
      { id: 4, name: 'Бусины 12', quantity: 350, unit: 'шт', category: 'Декор' },
      { id: 5, name: 'Бусины 22', quantity: 10, unit: 'шт', category: 'Декор' },
      { id: 6, name: 'Перья', quantity: 20, unit: 'шт', category: 'Прочее' },
      { id: 7, name: 'Ткань', quantity: 5, unit: 'м', category: 'Фурнитура' },
      { id: 8, name: 'Иголки', quantity: 100, unit: 'шт', category: 'Инструменты' },
      { id: 9, name: 'Картон красный', quantity: 15, unit: 'упк', category: 'Прочее' },
      { id: 10, name: 'Картон зеленый', quantity: 5, unit: 'упк', category: 'Прочее' },
      { id: 11, name: 'Картон синий', quantity: 35, unit: 'упк', category: 'Прочее' },
      { id: 12, name: 'Картон фиолетовый', quantity: 22, unit: 'упк', category: 'Прочее' }
    ],
    unitOptions: ['шт', 'м', 'кг', 'упк', 'компл'],
    categoryOptions: ['Прочее', 'Ткани', 'Фурнитура', 'Инструменты', 'Декор']
  }),
  actions: {
    addMaterial(material) {
      const newId = Math.max(...this.materials.map((m) => m.id), 0) + 1
      this.materials.push({ ...material, id: newId })
      return newId
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
