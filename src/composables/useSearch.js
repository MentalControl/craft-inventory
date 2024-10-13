import { ref, computed } from 'vue'

export function useSearch(materials) {
  const searchQuery = ref('')

  const isSearching = computed(() => searchQuery.value.length > 0)

  const filteredMaterials = computed(() => {
    if (!isSearching.value) return materials.value
    return materials.value.filter((material) =>
      material.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  })

  function handleSearch(query) {
    searchQuery.value = query
  }

  return {
    isSearching,
    handleSearch,
    filteredMaterials
  }
}
