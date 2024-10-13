<template>
  <button @click="toggleSortOrder">
    {{
      props.sortOrder === 'asc'
        ? 'Постепенно возводим горы сокровищ!'
        : 'Скатываемся вниз с вершины сокровищ!'
    }}
  </button>
</template>

<script setup>
const props = defineProps({
  sortOrder: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['toggleSortOrder'])

function toggleSortOrder() {
  emit('toggleSortOrder')
}
</script>

<style></style>
