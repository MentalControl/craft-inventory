// import { deleteMaterial } from '@/firebase'
import { defineStore } from 'pinia'

export const useMaterialStore = defineStore('material', {
  state: () => ({
    materials: [
      { id: 1, name: 'Нитки', quantity: 10, unit: 'шт', category: 'Ткани' },
      { id: 2, name: 'Бусины', quantity: 50, unit: 'шт', category: 'Декор' },
      { id: 3, name: 'Картон красный', quantity: 15, unit: 'упк', category: 'Прочее' },
      { id: 4, name: 'Ткань льняная', quantity: 8, unit: 'м', category: 'Фурнитура' },
      { id: 5, name: 'Клей', quantity: 5, unit: 'бутыл', category: 'Канцелярия' },
      { id: 6, name: 'Иголки', quantity: 100, unit: 'шт', category: 'Инструменты' },
      { id: 7, name: 'Бусины зеленые', quantity: 75, unit: 'шт', category: 'Декор' },
      { id: 8, name: 'Картон зеленый', quantity: 20, unit: 'упк', category: 'Прочее' },
      { id: 9, name: 'Пуговицы', quantity: 60, unit: 'шт', category: 'Фурнитура' },
      { id: 10, name: 'Маркеры', quantity: 30, unit: 'шт', category: 'Канцелярия' },
      { id: 11, name: 'Ткань шелковая', quantity: 7, unit: 'м', category: 'Ткани' },
      { id: 12, name: 'Ленты атласные', quantity: 20, unit: 'рулон', category: 'Декор' },
      { id: 13, name: 'Кисти', quantity: 15, unit: 'шт', category: 'Инструменты' },
      { id: 14, name: 'Краска акриловая', quantity: 10, unit: 'бутыл', category: 'Канцелярия' },
      { id: 15, name: 'Картон черный', quantity: 40, unit: 'упк', category: 'Прочее' },
      { id: 16, name: 'Лак', quantity: 6, unit: 'бутыл', category: 'Инструменты' },
      { id: 17, name: 'Бумага цветная', quantity: 25, unit: 'упк', category: 'Канцелярия' },
      { id: 18, name: 'Ткань хлопковая', quantity: 12, unit: 'м', category: 'Ткани' },
      { id: 19, name: 'Пленка', quantity: 50, unit: 'м', category: 'Фурнитура' },
      { id: 20, name: 'Кисти для краски', quantity: 30, unit: 'шт', category: 'Инструменты' },
      { id: 21, name: 'Ленты декоративные', quantity: 25, unit: 'рулон', category: 'Декор' },
      { id: 22, name: 'Картон голубой', quantity: 12, unit: 'упк', category: 'Прочее' },
      { id: 23, name: 'Ножницы', quantity: 10, unit: 'шт', category: 'Инструменты' },
      { id: 24, name: 'Клейкая лента', quantity: 40, unit: 'рулон', category: 'Канцелярия' },
      { id: 25, name: 'Фетр', quantity: 6, unit: 'м', category: 'Ткани' },
      { id: 26, name: 'Бусины разноцветные', quantity: 70, unit: 'шт', category: 'Декор' },
      { id: 27, name: 'Картон серый', quantity: 15, unit: 'упк', category: 'Прочее' },
      { id: 28, name: 'Краски гуашь', quantity: 25, unit: 'упк', category: 'Канцелярия' },
      { id: 29, name: 'Ткань синтетическая', quantity: 9, unit: 'м', category: 'Фурнитура' },
      { id: 30, name: 'Иголки для шитья', quantity: 200, unit: 'шт', category: 'Инструменты' },
      { id: 31, name: 'Лента резинка', quantity: 50, unit: 'м', category: 'Фурнитура' },
      { id: 32, name: 'Картон желтый', quantity: 18, unit: 'упк', category: 'Прочее' },
      { id: 33, name: 'Набор для шитья', quantity: 5, unit: 'компл', category: 'Инструменты' },
      { id: 34, name: 'Клей ПВА', quantity: 20, unit: 'бутыл', category: 'Канцелярия' },
      { id: 35, name: 'Кисти художественные', quantity: 12, unit: 'шт', category: 'Инструменты' },
      { id: 36, name: 'Картон белый', quantity: 10, unit: 'упк', category: 'Прочее' },
      { id: 37, name: 'Бусины пластиковые', quantity: 90, unit: 'шт', category: 'Декор' },
      { id: 38, name: 'Фломастеры', quantity: 35, unit: 'упк', category: 'Канцелярия' },
      { id: 39, name: 'Краски акварель', quantity: 15, unit: 'упк', category: 'Канцелярия' },
      { id: 40, name: 'Ткань джинсовая', quantity: 6, unit: 'м', category: 'Ткани' },
      { id: 41, name: 'Палитры для красок', quantity: 10, unit: 'шт', category: 'Инструменты' },
      { id: 42, name: 'Картон фиолетовый', quantity: 20, unit: 'упк', category: 'Прочее' },
      { id: 43, name: 'Ленты хлопковые', quantity: 30, unit: 'рулон', category: 'Фурнитура' },
      {
        id: 44,
        name: 'Фурнитура металлическая',
        quantity: 5,
        unit: 'компл',
        category: 'Фурнитура'
      },
      { id: 45, name: 'Резинка широкая', quantity: 15, unit: 'м', category: 'Фурнитура' },
      {
        id: 46,
        name: 'Бумага для скрапбукинга',
        quantity: 50,
        unit: 'лист',
        category: 'Канцелярия'
      },
      { id: 47, name: 'Ткань бархат', quantity: 5, unit: 'м', category: 'Ткани' },
      { id: 48, name: 'Картон бежевый', quantity: 22, unit: 'упк', category: 'Прочее' },
      { id: 49, name: 'Ленты с узорами', quantity: 15, unit: 'рулон', category: 'Декор' },
      { id: 50, name: 'Клей универсальный', quantity: 18, unit: 'бутыл', category: 'Канцелярия' },
      { id: 51, name: 'Кисти для декора', quantity: 8, unit: 'шт', category: 'Инструменты' },
      { id: 52, name: 'Пуговицы деревянные', quantity: 60, unit: 'шт', category: 'Фурнитура' },
      { id: 53, name: 'Бусины металлические', quantity: 120, unit: 'шт', category: 'Декор' },
      { id: 54, name: 'Ткань синтепон', quantity: 10, unit: 'м', category: 'Ткани' },
      { id: 55, name: 'Картон коричневый', quantity: 14, unit: 'упк', category: 'Прочее' },
      { id: 56, name: 'Краски масляные', quantity: 8, unit: 'упк', category: 'Канцелярия' },
      { id: 57, name: 'Ножницы маленькие', quantity: 25, unit: 'шт', category: 'Инструменты' },
      {
        id: 58,
        name: 'Фломастеры двусторонние',
        quantity: 12,
        unit: 'упк',
        category: 'Канцелярия'
      },
      { id: 59, name: 'Картон розовый', quantity: 19, unit: 'упк', category: 'Прочее' },
      {
        id: 60,
        name: 'Ленты декоративные с рисунком',
        quantity: 20,
        unit: 'рулон',
        category: 'Декор'
      },
      { id: 61, name: 'Ткань шерстяная', quantity: 7, unit: 'м', category: 'Ткани' },
      { id: 62, name: 'Палитры пластиковые', quantity: 15, unit: 'шт', category: 'Инструменты' },
      { id: 63, name: 'Клей момент', quantity: 10, unit: 'бутыл', category: 'Канцелярия' },
      { id: 64, name: 'Картон светло-зеленый', quantity: 11, unit: 'упк', category: 'Прочее' },
      { id: 65, name: 'Ленты тонкие', quantity: 40, unit: 'рулон', category: 'Декор' },
      { id: 66, name: 'Краски для тканей', quantity: 10, unit: 'бутыл', category: 'Канцелярия' },
      { id: 67, name: 'Ткань парча', quantity: 5, unit: 'м', category: 'Ткани' },
      { id: 68, name: 'Иголки для вышивания', quantity: 150, unit: 'шт', category: 'Инструменты' },
      { id: 69, name: 'Картон оранжевый', quantity: 10, unit: 'упк', category: 'Прочее' },
      { id: 70, name: 'Бусины круглые', quantity: 70, unit: 'шт', category: 'Декор' },
      { id: 71, name: 'Фетр цветной', quantity: 25, unit: 'м', category: 'Ткани' },
      { id: 72, name: 'Картон серебристый', quantity: 30, unit: 'упк', category: 'Прочее' },
      {
        id: 73,
        name: 'Ленты атласные широкие',
        quantity: 25,
        unit: 'рулон',
        category: 'Фурнитура'
      },
      { id: 74, name: 'Ткань вискоза', quantity: 8, unit: 'м', category: 'Ткани' },
      { id: 75, name: 'Палитры деревянные', quantity: 10, unit: 'шт', category: 'Инструменты' },
      { id: 76, name: 'Картон золотистый', quantity: 18, unit: 'упк', category: 'Прочее' },
      { id: 77, name: 'Ленты фетр', quantity: 12, unit: 'рулон', category: 'Декор' },
      { id: 78, name: 'Иголки для бисера', quantity: 130, unit: 'шт', category: 'Инструменты' },
      { id: 79, name: 'Ткань нейлон', quantity: 6, unit: 'м', category: 'Фурнитура' },
      { id: 80, name: 'Картон матовый', quantity: 15, unit: 'упк', category: 'Прочее' },
      { id: 81, name: 'Клей карандаш', quantity: 35, unit: 'шт', category: 'Канцелярия' },
      { id: 82, name: 'Бумага акварельная', quantity: 10, unit: 'упк', category: 'Канцелярия' },
      { id: 83, name: 'Ножницы большие', quantity: 8, unit: 'шт', category: 'Инструменты' },
      { id: 84, name: 'Ткань батик', quantity: 7, unit: 'м', category: 'Ткани' },
      { id: 85, name: 'Кисти для акварели', quantity: 14, unit: 'шт', category: 'Инструменты' },
      { id: 86, name: 'Клей двухсторонний', quantity: 20, unit: 'рулон', category: 'Канцелярия' },
      { id: 87, name: 'Картон блестящий', quantity: 22, unit: 'упк', category: 'Прочее' },
      { id: 88, name: 'Ткань жаккард', quantity: 9, unit: 'м', category: 'Ткани' },
      { id: 89, name: 'Фломастеры перманентные', quantity: 15, unit: 'шт', category: 'Канцелярия' },
      { id: 90, name: 'Картон темно-синий', quantity: 17, unit: 'упк', category: 'Прочее' },
      { id: 91, name: 'Палитры одноразовые', quantity: 40, unit: 'шт', category: 'Инструменты' },
      { id: 92, name: 'Картон прозрачный', quantity: 20, unit: 'упк', category: 'Прочее' },
      { id: 93, name: 'Фетр белый', quantity: 30, unit: 'м', category: 'Ткани' },
      { id: 94, name: 'Ткань флис', quantity: 6, unit: 'м', category: 'Фурнитура' },
      { id: 95, name: 'Кисти для масла', quantity: 10, unit: 'шт', category: 'Инструменты' },
      { id: 96, name: 'Ленты парчовые', quantity: 18, unit: 'рулон', category: 'Декор' },
      { id: 97, name: 'Картон бордовый', quantity: 12, unit: 'упк', category: 'Прочее' },
      { id: 98, name: 'Иголки острые', quantity: 160, unit: 'шт', category: 'Инструменты' },
      { id: 99, name: 'Картон текстурный', quantity: 10, unit: 'упк', category: 'Прочее' },
      { id: 100, name: 'Ткань хлопковая цветная', quantity: 10, unit: 'м', category: 'Ткани' }
    ],
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
