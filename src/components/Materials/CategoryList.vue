<template>
  <div class="accordion">
    <CategoryItem
      v-for="category in categories"
      :key="category"
      :category="category"
      :materials="materialsByCategory[category] || []"
      :isOpen="openedCategories.has(category)"
      :unitOptions="unitOptions"
      @toggleCategory="$emit('toggleCategory', $event)"
      @changeMaterialSort="(event) => $emit('changeMaterialSort', category, event)"
      @removeMaterial="$emit('removeMaterial', $event)"
    />
  </div>
</template>

<script setup>
import CategoryItem from './CategoryItem.vue'

defineProps({
  categories: {
    type: Array,
    required: true
  },
  materialsByCategory: {
    type: Object,
    required: true
  },
  openedCategories: {
    type: Set,
    required: true
  },
  unitOptions: {
    type: Array,
    required: true
  }
})

defineEmits(['toggleCategory', 'changeMaterialSort', 'removeMaterial'])
</script>

<style></style>
