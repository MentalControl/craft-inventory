<script setup>
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useMaterialStore } from '@/store/materialStore.js'
import { useMaterialSort } from '@/composables/useMaterialSort'
import { useSearch } from '@/composables/useSearch'

import SortButton from '@/components/Materials/SortButton.vue'
import AddMaterialForm from '@/components/Forms/AddMaterialForm.vue'
import PageHeader from '@/components/pages/PageHeader.vue'
import CategoryList from '@/components/Materials/CategoryList.vue'
import SearchMaterials from '@/components/Materials/SearchMaterials.vue'
import csvImport from '@/components/csvImport.vue'

const TITLE = 'Великие Запасы Материалов'

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
  materials.value = materials.value.filter((material) => material.firestoreId !== id)
}

const updateMaterial = async ({ id, newQuantity, newUnit }) => {
  try {
    await materialStore.updateMaterial({ id, newQuantity, newUnit })
  } catch (error) {
    console.error('Error updating material:', error)
  }
}

onMounted(async () => {
  materialStore.subToMaterials()
})
</script>

<template>
  <PageHeader :title="TITLE">
    <template #btn-action>
      <button @click="openMaterialDialog">Добавить материал</button>
    </template>
  </PageHeader>
  <div class="materials">
    <div class="materials__content">
      <csvImport />
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
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(300px, 100%), 1fr));
    gap: var(--gap);

    &__item {
      height: fit-content;
      /* flex: 0 1 calc((100% / var(--columns-x-large)) - var(--gap)); */
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      gap: 20px;
      padding: 14px 10px;
      border: 1px solid var(--accent-color);
      border-radius: 5px;
      box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
      /* @media (max-width: 1135px) {
        flex: 0 1 calc((100% / var(--columns-large)) - var(--gap));
      }
      @media (max-width: 900px) {
        flex: 0 1 calc((100% / var(--columns-medium)) - var(--gap));
      }

      @media (max-width: 600px) {
        flex: 1 1 calc((100% / var(--columns-small)) - var(--gap));
      }

      @media (max-width: 400px) {
        flex: 1 1 calc(100% - var(--gap));
      } */
      &.editActive {
        height: 100%;
      }
    }
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
  display: flex;
  flex-direction: column;
  gap: 10px;
  &-item {
    border: var(--border);
    overflow: hidden;
    border-radius: 1rem;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
    transition: transform 0.2s ease;
    &:hover {
      transform: translateY(-4px);
    }
  }

  &-header {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    background-color: #e8dcc7;
    padding: 10px;
    cursor: pointer;
    select {
      width: 100%;
    }
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
