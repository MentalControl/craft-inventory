import { ref, computed } from 'vue'

export function useMaterialSort(categoryOptions, materials) {
  const categorySortOrder = ref('asc')
  const categorySortSettings = ref(
    Object.fromEntries(
      categoryOptions.value.map((category) => [category, { field: 'name', order: 'asc' }])
    )
  )

  const materialsByCategory = computed(() => {
    const grouped = {}
    categoryOptions.value.forEach((category) => {
      let categoryMaterials = materials.value.filter((material) => material.category === category)

      const sortSettings = categorySortSettings.value[category]
      if (sortSettings) {
        categoryMaterials.sort((a, b) => {
          if (sortSettings.field === 'quantity') {
            return sortSettings.order === 'asc' ? a.quantity - b.quantity : b.quantity - a.quantity
          }
          return 0
        })
      }

      grouped[category] = categoryMaterials
    })
    return grouped
  })

  const sortedCategories = computed(() => {
    return [...categoryOptions.value].sort((a, b) => {
      const aCount = materialsByCategory.value[a].length
      const bCount = materialsByCategory.value[b].length
      return categorySortOrder.value === 'asc' ? aCount - bCount : bCount - aCount
    })
  })

  function toggleCategorySortOrder() {
    categorySortOrder.value = categorySortOrder.value === 'asc' ? 'desc' : 'asc'
  }

  function changeMaterialSort(category, event) {
    const [field, order] = event.target.value.split('-')
    categorySortSettings.value = {
      ...categorySortSettings.value,
      [category]: { field, order }
    }
  }

  return {
    categorySortOrder,
    toggleCategorySortOrder,
    changeMaterialSort,
    sortedCategories,
    materialsByCategory
  }
}
