<script setup>
import { ref, computed } from 'vue'
import MaterialItem from '@/components/Materials/MaterialItem.vue'

const props = defineProps({
  materials: {
    type: Array,
    required: true
  },
  unitOptions: {
    type: Array,
    required: true
  }
})
const emit = defineEmits(['search', 'updateMaterial', 'remove'])

const searchQuery = ref('')
const isSearching = computed(() => searchQuery.value.length > 0)

function onSearch() {
  emit('search', searchQuery.value)
}

function removeMaterial(id) {
  emit('remove', id)
}

const filteredMaterials = computed(() => {
  if (!searchQuery.value) return []
  return props.materials.filter((material) =>
    material.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

function updateMaterial({ id, newQuantity, newUnit }) {
  const material = props.materials.find((m) => m.id === id)
  if (material) {
    material.quantity = newQuantity
    material.unit = newUnit
  }
}
</script>

<template>
  <div class="materials_search">
    <div class="materials_search__input">
      <input
        type="search"
        v-model="searchQuery"
        placeholder="Поиск материалов..."
        @input="onSearch"
      />
    </div>
    <!-- Отображаем только найденные материалы -->
    <div class="search-wrapper" v-if="filteredMaterials.length">
      <h2>Результат поиска ({{ filteredMaterials.length }})</h2>
      <ul class="search-list">
        <MaterialItem
          class="search-list_item"
          v-for="material in filteredMaterials"
          :key="material.id"
          :material="material"
          :unitOptions="unitOptions"
          :isSearching="isSearching"
          @remove="removeMaterial"
          @updateMaterial="updateMaterial"
        />
      </ul>
    </div>
    <div v-else-if="searchQuery && filteredMaterials.length === 0">
      <p>Ничего не найдено</p>
    </div>
  </div>
</template>

<style scoped lang="scss">
.materials_search {
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
  &__input {
    position: relative;
    display: flex;
    width: 100%;
  }
  input {
    flex: 0 1 100%;
    margin: 0;
    margin-bottom: 2rem;
  }
}

.search-wrapper {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.search-list {
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(400px, 100%), 1fr));
  gap: var(--gap);
  row-gap: 25px;
}
</style>
