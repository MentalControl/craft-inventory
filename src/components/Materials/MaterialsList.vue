<template>
  <ul class="materials-list">
    <MaterialItem
      v-for="material in materials"
      :key="material.firestoreId"
      :material="material"
      :unitOptions="unitOptions"
      @remove="removeMaterial"
      @updateMaterial="updateMaterial"
    />
  </ul>
</template>

<script setup>
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

const emit = defineEmits(['remove', 'updateMaterial'])

function removeMaterial(id) {
  emit('remove', id) // передаем событие удаления наверх
}

function updateMaterial({ id, newQuantity, newUnit }) {
  const material = props.materials.find((m) => m.id === id)
  if (material) {
    material.quantity = newQuantity
    material.unit = newUnit
  }
}
</script>

<style></style>
