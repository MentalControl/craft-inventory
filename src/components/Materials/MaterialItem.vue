<script setup>
import { ref, watch } from 'vue'
import { doc, updateDoc, deleteDoc } from 'firebase/firestore'
import { db } from '@/firebase'
import { useUserStore } from '@/store/userStore'

const userStore = useUserStore()

const props = defineProps({
  material: {
    type: Object,
    required: true
  },
  unitOptions: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['updateMaterial', 'remove'])

const isEditing = ref(false)
const newQuantity = ref(props.material.quantity)
const newUnit = ref(props.material.unit)
const errorMessage = ref('')

watch(
  () => props.material.quantity,
  (newVal) => {
    newQuantity.value = newVal
  }
)

function enableEditing() {
  isEditing.value = true
  errorMessage.value = ''
}

async function updateMaterial() {
  if (!userStore.user?.uid) {
    errorMessage.value = 'User ID not available'
    return
  }
  if (!isValidQuantity(newQuantity.value)) {
    errorMessage.value = 'Quantity must be a non-negative number'
    return
  }
  if (!isValidUnit(newUnit.value)) {
    errorMessage.value = 'Invalid unit selected'
    return
  }

  try {
    const materialRef = doc(db, `users/${userStore.user.uid}/materials`, props.material.firestoreId)
    await updateDoc(materialRef, { quantity: newQuantity.value, unit: newUnit.value })

    emit('updateMaterial', {
      id: props.material.firestoreId,
      newQuantity: newQuantity.value,
      newUnit: newUnit.value
    })
    isEditing.value = false
  } catch (error) {
    console.error('Error updating material: ', error)
    errorMessage.value = 'Failed to update material. Please try again.'
  }
}

function isValidQuantity(quantity) {
  return !isNaN(quantity) && quantity >= 0
}

function isValidUnit(unit) {
  return props.unitOptions.includes(unit)
}

function cancelEditing() {
  isEditing.value = false
  newQuantity.value = props.material.quantity
  newUnit.value = props.material.unit
  errorMessage.value = ''
}

function adjustQuantity(amount) {
  newQuantity.value = Math.max(0, newQuantity.value + amount)
}

async function removeMaterial() {
  try {
    const materialRef = doc(db, `users/${userStore.user.uid}/materials`, props.material.firestoreId)
    await deleteDoc(materialRef)
    emit('remove', props.material.firestoreId)
  } catch (error) {
    console.error('Error deleting material: ', error)
    errorMessage.value = 'Failed to delete material. Please try again.'
  }
}
</script>

<template>
  <li class="materials-list__item" :class="{ editActive: isEditing }">
    <span v-if="!isEditing" class="material_item" @click="enableEditing">
      {{ material.name }}:
      <span class="material_quantity">{{ material.quantity }} {{ material.unit }}</span>
    </span>

    <div v-else class="material_edit">
      <input type="number" v-model.number="newQuantity" @keyup.enter="updateMaterial" />
      <select v-model="newUnit">
        <option v-for="unit in unitOptions" :key="unit" :value="unit">{{ unit }}</option>
      </select>
      <div class="material_buttons">
        <div class="material_buttons-quantity">
          <button @click="adjustQuantity(1)">+</button>
          <button @click="adjustQuantity(-1)">-</button>
        </div>
        <div class="material_buttons-control">
          <button @click="updateMaterial">Применить</button>
          <button @click="cancelEditing">Отменить</button>
        </div>
      </div>
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    </div>

    <button v-if="!isEditing" @click="removeMaterial">Удалить</button>
  </li>
</template>

<style lang="scss">
li {
  display: flex;
  align-items: center;
  padding: 5px 0;
}
.material {
  &_quantity {
    cursor: pointer;
  }
  &_edit {
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;
    input {
      padding: 12px 10px;
    }
  }
  &_buttons {
    display: flex;
    flex-direction: column;
    gap: 15px;
    &-quantity,
    &-control {
      display: flex;
      gap: 5px;
    }
  }
  .error-message {
    color: red;
    font-size: 0.875em;
  }
}
</style>
