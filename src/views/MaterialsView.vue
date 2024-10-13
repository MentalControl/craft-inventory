<script setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useMaterialStore } from '@/store/index.js'
import { useMaterialSort } from '@/composables/useMaterialSort'
import { useSearch } from '@/composables/useSearch'

import SortButton from '@/components/Materials/SortButton.vue'
import AddMaterialForm from '@/components/Forms/AddMaterialForm.vue'
import PageHeader from '@/components/pages/PageHeader.vue'
import CategoryList from '@/components/Materials/CategoryList.vue'
import SearchMaterials from '@/components/Materials/SearchMaterials.vue'

const TITLE = 'Великие Запасы Материалов'
const DESCRIPTION = `Материалы — кровь и камень нашего братства! Добавляйте новые материалы, выбирайте нужные из наших несметных запасов и сортируйте по категориям.

Никто не уйдёт без нужных ресурсов, ведь каждый гвоздь и каждая капля масла на вес золота! Знай своё ремесло и держи инструменты наготове!`

const materialStore = useMaterialStore()
const { materials, unitOptions, categoryOptions } = storeToRefs(materialStore)

const {
  categorySortOrder,
  toggleCategorySortOrder,
  changeMaterialSort,
  sortedCategories,
  materialsByCategory
} = useMaterialSort(categoryOptions, materials)

const { isSearching, handleSearch, filteredMaterials } = useSearch(materials)

const materialDialogRef = ref(null)
const openedCategories = ref(new Set())

function openMaterialDialog() {
  materialDialogRef.value?.openDialog()
}

function toggleCategory(category) {
  openedCategories.value.has(category)
    ? openedCategories.value.delete(category)
    : openedCategories.value.add(category)
}

const removeMaterial = (id) => {
  materials.value = materials.value.filter((material) => material.id !== id)
}

const updateMaterial = ({ id, newQuantity, newUnit }) => {
  const material = materials.value.find((mat) => mat.id === id)
  if (material) Object.assign(material, { quantity: newQuantity, unit: newUnit })
}
</script>

<template>
  <PageHeader
    :title="TITLE"
    :description="DESCRIPTION"
    buttonText="Добавить материал"
    @openDialog="openMaterialDialog"
  />
  <div class="materials">
    <div class="materials__content">
      <SearchMaterials
        :materials="filteredMaterials"
        :unitOptions="unitOptions"
        @search="handleSearch"
        @remove="removeMaterial"
        @update-material="updateMaterial"
      />
      <div v-if="!isSearching" class="materials__wrapper">
        <SortButton :sortOrder="categorySortOrder" @toggleSortOrder="toggleCategorySortOrder" />
        <CategoryList
          :categories="sortedCategories"
          :materialsByCategory="materialsByCategory"
          :openedCategories="openedCategories"
          :unitOptions="unitOptions"
          @toggleCategory="toggleCategory"
          @changeMaterialSort="changeMaterialSort"
          @removeMaterial="removeMaterial"
          @material-update="updateMaterial"
        />
      </div>
      <p v-else-if="isSearching && filteredMaterials.length === 0" class="materials__no-results">
        Нет материалов, соответствующих запросу.
      </p>
    </div>
    <AddMaterialForm
      title="Принести волшебные сокровища!"
      :unit-options="unitOptions"
      :category-options="categoryOptions"
      ref="materialDialogRef"
    />
  </div>
</template>
<style lang="scss">
.materials {
  display: flex;
  flex-direction: column;
  row-gap: 15px;

  h2 {
    text-align: start;
  }

  &__wrapper {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 15px;
    flex: 1;

    @media (max-width: 767.98px) {
      flex: 1 1 100%;
    }
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
      gap: 10px;
      padding: 10px;
      border: 1px solid var(--accent-color);
      border-radius: 5px;
      box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);

      @media (max-width: 900px) {
        flex: 0 1 calc((100% / var(--columns-medium)) - var(--gap));
      }

      @media (max-width: 600px) {
        flex: 0 1 calc((100% / var(--columns-small)) - var(--gap));
      }

      @media (max-width: 400px) {
        flex: 0 1 calc(100% - var(--gap));
      }
    }
  }
}

aside {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 15px;

  @media (max-width: 767.98px) {
    flex: 1 1 100%;
  }

  input,
  select {
    padding: 10px;
    border: 1px solid #8c7a64;
    border-radius: 5px;
    background-color: #e8dcc7;
    color: #4a3c31;
    margin-bottom: 10px;
  }
}

form {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 15px;
  margin: 0 auto;
}

.accordion {
  &-item {
    border: var(--border);
    margin-bottom: 5px;
  }

  &-header {
    background-color: #e8dcc7;
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
        font-size: 18px;
      }
    }
  }

  &-content {
    padding: 10px;
  }

  &-enter-active,
  &-leave-active {
    transition:
      max-height 0.3s ease-out,
      opacity 0.3s ease-out;
    max-height: 1000px;
    overflow: hidden;
  }

  &-enter-from,
  &-leave-to {
    max-height: 0;
    opacity: 0;
  }

  &-icon {
    font-size: 1rem;
    transition: transform 0.3s ease-out;

    &.opened {
      transform: rotate(180deg);
    }
  }
}
</style>
