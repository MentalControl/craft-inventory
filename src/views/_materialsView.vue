<script setup>
import { ref, computed } from 'vue'
import { useMaterialStore } from '@/store/materialStore.js'
import { storeToRefs } from 'pinia'

// Получаемый список материалов из стора
const materialStore = useMaterialStore()
const { materials, unitOptions, categoryOptions } = storeToRefs(materialStore)

// Новый Материал для добавления
const newMaterial = ref({
  name: '',
  quantity: 0,
  unit: unitOptions[0],
  category: categoryOptions[0]
})

// Объект открытых категорий
const openedCategories = ref(new Set())

// Настройка сортировки категорий
const categorySortOrder = ref('asc') // 'asc' или 'desc'

// Настройки сортировки для каждой категории
const categorySortSettings = ref(
  Object.fromEntries(categoryOptions.map((category) => [category, { field: 'name', order: 'asc' }]))
)

// Группировка материалов по категориям
const materialsByCategory = computed(() => {
  const grouped = {}
  categoryOptions.forEach((category) => {
    grouped[category] = materials.value.filter((material) => material.category === category)
  })
  return grouped
})

// Отсортированные категории
const sortedCategories = computed(() => {
  return [...categoryOptions].sort((a, b) => {
    const aCount = materialsByCategory.value[a].length
    const bCount = materialsByCategory.value[b].length
    return categorySortOrder.value === 'asc' ? aCount - bCount : bCount - aCount
  })
})

// Получение отсортированных материалов для категории
function getSortedMaterialsForCategory(category) {
  const { order } = categorySortSettings.value[category]
  return [...materialsByCategory.value[category]].sort((a, b) => {
    return order === 'asc' ? a.quantity - b.quantity : b.quantity - a.quantity
  })
}

function toggleCategory(category, event = null) {
  // Если передано событие и целевой элемент (или его родитель) является select, ничего не делаем
  if (event && event.target.closest('select')) {
    return
  }

  if (openedCategories.value.has(category)) {
    openedCategories.value.delete(category)
  } else {
    openedCategories.value.add(category)
  }
}

// Добавление нового материала
function addMaterial() {
  const newId = Math.max(...materials.value.map((m) => m.id), 0) + 1
  materials.value.push({
    id: newId,
    name: newMaterial.value.name,
    quantity: newMaterial.value.quantity,
    unit: newMaterial.value.unit,
    category: newMaterial.value.category
  })
  newMaterial.value = { name: '', quantity: 0, unit: unitOptions[0], category: categoryOptions[0] }
}

function removeMaterial(id) {
  materials.value = materials.value.filter((material) => material.id !== id)
}

function toggleCategorySortOrder() {
  categorySortOrder.value = categorySortOrder.value === 'asc' ? 'desc' : 'asc'
}

function changeMaterialSort(category, event) {
  const [field, order] = event.target.value.split('-')
  categorySortSettings.value[category] = { field, order }
}
</script>

<template>
  <div class="materials">
    <div class="content">
      <header class="content-title">
        <h2>Материалы</h2>
        <button @click="toggleCategorySortOrder">
          Сортировать категории по количеству {{ categorySortOrder === 'asc' ? '▲' : '▼' }}
        </button>
      </header>
      <div class="accordion">
        <div v-for="category in sortedCategories" :key="category" class="accordion-item">
          <div class="accordion-header" @click="toggleCategory(category)">
            <h3>{{ category }} ({{ materialsByCategory[category].length }})</h3>
            <select @change="(event) => changeMaterialSort(category, event)" @click.stop>
              <option value="quantity-asc">По количеству (возр.)</option>
              <option value="quantity-desc">По количеству (убыв.)</option>
            </select>
            <span class="accordion-icon" :class="{ opened: openedCategories.has(category) }">
              🠟
            </span>
          </div>
          <transition name="accordion">
            <div v-if="openedCategories.has(category)" class="accordion-content">
              <ul class="materials-list">
                <li
                  class="materials-list__item"
                  v-for="material in getSortedMaterialsForCategory(category)"
                  :key="material.id"
                >
                  {{ material.name }}: {{ material.quantity }} {{ material.unit }}
                  <button @click="removeMaterial(material.id)">Удалить</button>
                </li>
              </ul>
            </div>
          </transition>
        </div>
      </div>
    </div>
    <aside>
      <h2>Добавление материалов</h2>
      <form @submit.prevent="addMaterial">
        <input v-model="newMaterial.name" placeholder="Название" required />
        <input
          v-model.number="newMaterial.quantity"
          type="number"
          placeholder="Количество"
          required
        />
        <select v-model="newMaterial.unit">
          <option v-for="unit in unitOptions" :key="unit" :value="unit">{{ unit }}</option>
        </select>
        <select v-model="newMaterial.category">
          <option v-for="category in categoryOptions" :key="category" :value="category">
            {{ category }}
          </option>
        </select>
        <button type="submit">Добавить материал</button>
      </form>
    </aside>
  </div>
</template>

<style scoped lang="scss">
.materials {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  h2 {
    text-align: start;
  }
  &-list {
    list-style-type: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    gap: var(--gap);
    &__item {
      flex: 0 1 calc((100% / var(--columns-large)) - var(--gap));
      display: flex;
      flex-direction: column;
      gap: 15px;
    }
  }
}
.content {
  display: flex;
  flex-direction: column;
  gap: 15px;
  flex: 0 1 70%;
  @media (max-width: 767.98px) {
    flex: 1 1 100%;
  }
  &-title {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    flex-wrap: wrap;
  }
}

aside {
  display: flex;
  flex-direction: column;
  flex: 0 1 25%;
  gap: 15px;
  @media (max-width: 767.98px) {
    flex: 1 1 100%;
  }
}

form {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 15px;
  margin: 0 auto;
}

input,
select {
  padding: 5px;
}

button {
  padding: 5px 10px;
  background-color: #42b983;
  color: white;
  border: none;
  cursor: pointer;
}

@media (max-width: 900px) {
  .materials-list__item {
    flex: 0 1 calc((100% / var(--columns-medium)) - var(--gap));
  }
}

@media (max-width: 600px) {
  .materials-list__item {
    flex: 0 1 calc((100% / var(--columns-small)) - var(--gap));
  }
}

@media (max-width: 400px) {
  .materials-list__item {
    flex: 0 1 calc(100% - var(--gap));
  }
}

.accordion-item {
  border: 1px solid #ddd;
  margin-bottom: 5px;
}

.accordion-header {
  background-color: #f5f5f5;
  padding: 10px;
  cursor: pointer;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  h3 {
    max-width: 13rem;
    width: 100%;
    @media (max-width: 767.98px) {
      max-width: 10rem;
      width: 100%;
      font-size: 18px;
    }
  }
}
@media (max-width: 991.98px) {
}

.accordion-content {
  padding: 10px;
}

.accordion-enter-active,
.accordion-leave-active {
  transition:
    max-height 0.3s ease-out,
    opacity 0.3s ease-out;
  max-height: 1000px;
  overflow: hidden;
}

.accordion-enter-from,
.accordion-leave-to {
  max-height: 0;
  opacity: 0;
}

.accordion-icon {
  font-size: 1rem;
  transition: transform 0.3s ease-out;
}
.accordion-icon.opened {
  transform: rotate(180deg);
}
</style>
