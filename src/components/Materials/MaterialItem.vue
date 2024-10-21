<template>
  <li class="materials-list__item">
    <span class="material_item" v-if="!isEditing">
      {{ material.name }}:
      <span class="material_quantity" @click="enableEditing">
        {{ material.quantity }} {{ material.unit }}
      </span>
    </span>
    <!-- Двойной клик для редактирования количества -->

    <!-- Если редактируем, то рисуем input -->
    <div v-else class="material_edit">
      <input type="number" v-model.number="newQuantity" @keyup.enter="updateMaterial" />
      <select v-model="newUnit">
        <option v-for="unit in unitOptions" :key="unit" :value="unit">{{ unit }}</option>
      </select>
      <div class="material_buttons">
        <div class="material_buttons-quantity">
          <button @click="increaseQuantity">+</button>
          <button @click="decreaseQuantity">-</button>
        </div>
        <div class="material_buttons-control">
          <button v-if="isEditing" @click="updateMaterial">Применить</button>
          <button v-if="isEditing" @click="cancelEditing">Отменить</button>
        </div>
      </div>
    </div>
    <button v-if="!isEditing" @click="removeMaterial(material.id)">Удалить</button>
  </li>
</template>

<script setup>
import { ref, watch } from 'vue'

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

watch(
  () => props.material.quantity,
  (newVal) => {
    newQuantity.value = newVal
  }
)

function enableEditing() {
  isEditing.value = true
}

function updateMaterial() {
  emit('updateMaterial', {
    id: props.material.id,
    newQuantity: newQuantity.value,
    newUnit: newUnit.value
  })
  isEditing.value = false
}

function cancelEditing() {
  isEditing.value = false
}

function increaseQuantity() {
  newQuantity.value++
}

function decreaseQuantity() {
  if (newQuantity.value > 0) {
    newQuantity.value--
  }
}

function removeMaterial(id) {
  emit('remove', id)
}
</script>

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
    width: 100%;
    input {
      padding: 12px 10px;
    }
  }
  &_buttons {
    display: flex;
    flex-direction: column;
    gap: 15px;
    &-quantity {
      display: flex;
      flex-direction: row;
      gap: 5px;
    }
    &-control {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
  }
}
</style>
