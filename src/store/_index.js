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
      { id: 9, name: 'Картон красный', quantity: 15, unit: 'упк', category: 'Прочее' }
    ]
  }),
  actions: {
    decreaseMaterialQuantity(id, amount) {
      const material = this.materials.find((m) => m.id === id)
      if (material && material.quantity >= amount) {
        material.quantity -= amount
      }
    },
    getMaterialById(id) {
      return this.materials.find((m) => m.id === id)
    }
  }
})
