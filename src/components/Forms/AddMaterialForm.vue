<script setup>
import { ref } from 'vue'
import { useMaterialStore } from '@/store/index.js'

const props = defineProps({
  title: {
    type: String,
    default: 'Добавление материалов'
  },
  unitOptions: {
    type: Array,
    required: true
  },
  categoryOptions: {
    type: Array,
    required: true
  },
  addButton: {
    type: String,
    default: 'Внести драгоценный вклад!'
  }
})

const emit = defineEmits(['materialAdded'])

const materialStore = useMaterialStore()

// Новый Материал для добавления
const newMaterial = ref({
  name: '',
  quantity: 0,
  unit: props.unitOptions[0],
  category: props.categoryOptions[0]
})

const dialogRef = ref(null)
function openDialog() {
  dialogRef.value.showModal() // Открыть диалог
}
function closeDialog() {
  dialogRef.value.close()
}

// Добавление нового материала
function addMaterial() {
  const newId = Math.max(...materialStore.materials.map((m) => m.id), 0) + 1
  const materialToAdd = {
    id: newId,
    name: newMaterial.value.name,
    quantity: newMaterial.value.quantity,
    unit: newMaterial.value.unit,
    category: newMaterial.value.category
  }
  materialStore.addMaterial(materialToAdd)
  emit('materialAdded', materialToAdd)

  newMaterial.value = {
    name: '',
    quantity: 0,
    unit: props.unitOptions[1],
    category: props.categoryOptions[0]
  }
}
defineExpose({ openDialog })
</script>

<template>
  <dialog ref="dialogRef" class="material-dialog">
    <h2>{{ title }}</h2>
    <form @submit.prevent="addMaterial">
      <input v-model="newMaterial.name" placeholder="Название" required />
      <input
        v-model.number="newMaterial.quantity"
        type="number"
        placeholder="Количество"
        required
      />
      <select v-model="newMaterial.unit">
        <option v-for="unit in unitOptions" :key="unit" :value="unit">{{ unit }}</option>
      </select>
      <select v-model="newMaterial.category">
        <option v-for="category in categoryOptions" :key="category" :value="category">
          {{ category }}
        </option>
      </select>
      <button type="submit">{{ addButton }}</button>
    </form>
    <button @click="closeDialog">Передюмаля</button>
  </dialog>
</template>

<style scoped>
.material-dialog {
  border: none;
  border-radius: 10px;
  padding: 20px;
  width: 100%;
  max-width: 80%;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  background-color: white;
  margin: auto;
}

.material-dialog::backdrop {
  background-color: rgba(0, 0, 0, 0.5);
}

form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-block: 2rem;
}
</style>
