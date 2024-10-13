<script setup>
import { ref, computed } from 'vue'
import { useMaterialStore } from '@/store/index.js'

const materialStore = useMaterialStore()

const products = ref([])
const showNewProductForm = ref(false)
const newProduct = ref({
  name: '',
  materials: [],
  materialErrors: {} // Добавлено для хранения ошибок
})
const searchMaterial = ref('')

const filteredMaterials = computed(() => {
  return materialStore.materials.filter((material) =>
    material.name.toLowerCase().includes(searchMaterial.value.toLowerCase())
  )
})

function addMaterialToProduct(material) {
  const existingMaterial = newProduct.value.materials.find((m) => m.id === material.id)
  if (existingMaterial) {
    existingMaterial.quantity++
  } else {
    newProduct.value.materials.push({
      id: material.id,
      name: material.name,
      quantity: 1,
      unit: material.unit
    })
  }
  searchMaterial.value = ''
}

function removeMaterialFromProduct(materialId) {
  delete newProduct.value.materialErrors[materialId] // Удаляем ошибку при удалении материала
  newProduct.value.materials = newProduct.value.materials.filter((m) => m.id !== materialId)
}

function changeMaterialQuantity(materialId, quantity) {
  const material = newProduct.value.materials.find((m) => m.id === materialId)
  if (material) {
    material.quantity = quantity
    const stockMaterial = materialStore.materials.find((m) => m.id === materialId)
    if (stockMaterial && stockMaterial.quantity < quantity) {
      newProduct.value.materialErrors[materialId] =
        `Недостаточно материала "${material.name}". В наличии: ${stockMaterial.quantity} ${stockMaterial.unit}`
    } else {
      delete newProduct.value.materialErrors[materialId] // Удаляем ошибку если она устранена
    }
  }
}

function validateProduct() {
  const errors = []
  newProduct.value.materials.forEach((material) => {
    const stockMaterial = materialStore.materials.find((m) => m.id === material.id)
    if (stockMaterial.quantity < material.quantity) {
      errors.push(
        `Недостаточно материала "${material.name}". В наличии: ${stockMaterial.quantity} ${stockMaterial.unit}`
      )
    }
  })
  return errors
}

function saveProduct() {
  const errors = validateProduct()
  if (errors.length > 0) {
    alert(errors.join('\n'))
    return
  }

  products.value.push({
    id: Date.now(),
    name: newProduct.value.name,
    materials: newProduct.value.materials
  })

  newProduct.value.materials.forEach((material) => {
    materialStore.decreaseMaterialQuantity(material.id, material.quantity)
  })

  newProduct.value = { name: '', materials: [], materialErrors: {} }
  showNewProductForm.value = false
}
</script>

<template>
  <div class="products">
    <h2>Изделия</h2>
    <button @click="showNewProductForm = true">Новое изделие</button>

    <div v-if="showNewProductForm" class="new-product-form">
      <h3>Новое изделие</h3>
      <input v-model="newProduct.name" placeholder="Название изделия" required />

      <div class="material-search">
        <input v-model="searchMaterial" placeholder="Поиск материала" />
        <ul v-if="searchMaterial" class="material-list">
          <li
            v-for="material in filteredMaterials"
            :key="material.id"
            @click="addMaterialToProduct(material)"
          >
            {{ material.name }} ({{ material.quantity }} {{ material.unit }})
          </li>
        </ul>
      </div>

      <ul class="selected-materials">
        <li v-for="material in newProduct.materials" :key="material.id">
          {{ material.name }}
          <input
            type="number"
            v-model.number="material.quantity"
            min="1"
            :max="materialStore.getMaterialById(material.id).quantity"
            @input="changeMaterialQuantity(material.id, material.quantity)"
          />
          {{ material.unit }}
          <button @click="removeMaterialFromProduct(material.id)">Удалить</button>
          <span v-if="newProduct.materialErrors[material.id]" class="error">{{
            newProduct.materialErrors[material.id]
          }}</span>
          <!-- Отображение ошибки -->
        </li>
      </ul>

      <button @click="saveProduct">Сохранить изделие</button>
      <button @click="showNewProductForm = false">Отмена</button>
    </div>

    <ul class="product-list">
      <li v-for="product in products" :key="product.id">
        <h4>{{ product.name }}</h4>
        <ul>
          <li v-for="material in product.materials" :key="material.id">
            {{ material.name }}: {{ material.quantity }} {{ material.unit }}
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.products {
  max-width: 600px;
  margin: 0 auto;
}

.new-product-form {
  background-color: #f0f0f0;
  padding: 1rem;
  margin-top: 1rem;
  border-radius: 4px;
}

.material-search {
  position: relative;
  margin-bottom: 1rem;
}

.material-list {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: white;
  border: 1px solid #ccc;
  list-style-type: none;
  padding: 0;
  margin: 0;
  max-height: 200px;
  overflow-y: auto;
}

.material-list li {
  padding: 0.5rem;
  cursor: pointer;
}

.material-list li:hover {
  background-color: #f0f0f0;
}

.selected-materials {
  list-style-type: none;
  padding: 0;
}

.selected-materials li {
  margin-bottom: 0.5rem;
}

.product-list {
  list-style-type: none;
  padding: 0;
}

.product-list > li {
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  padding: 1rem;
  border-radius: 4px;
  background-image: url('../assets/product-bg.png');
}

.error {
  color: red; /* Цвет ошибки */
  font-size: 0.9rem; /* Размер шрифта для ошибки */
}
</style>
