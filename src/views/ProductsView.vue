<script setup>
import { ref, computed, onMounted } from 'vue'
import { useMaterialStore } from '@/store/materialStore.js'
import { useProductStore } from '@/store/productStore.js'
import { useUserStore } from '@/store/userStore'
import { db } from '@/firebase'
import { doc, updateDoc, getDoc, deleteDoc } from 'firebase/firestore'

const materialStore = useMaterialStore()
const productStore = useProductStore()
const userStore = useUserStore()

const showNewProductForm = ref(false)
const newProduct = ref({ name: '', materials: [], materialErrors: {} })
const searchMaterial = ref('')

const filteredMaterials = computed(() =>
  materialStore.materials.filter((material) =>
    material.name.toLowerCase().includes(searchMaterial.value.toLowerCase())
  )
)

function addMaterialToProduct(material) {
  const existingMaterial = materialStore.getMaterialById(material.firestoreId)
  if (!existingMaterial) {
    console.error(`Материал с ID ${material.firestoreId} не найден.`)
    return
  }

  newProduct.value.materials.push({
    firestoreId: material.firestoreId,
    name: material.name,
    quantity: 1,
    unit: material.unit
  })
  searchMaterial.value = ''
}

function removeMaterialFromProduct(materialId) {
  delete newProduct.value.materialErrors[materialId]
  newProduct.value.materials = newProduct.value.materials.filter(
    (m) => m.firestoreId !== materialId
  )
}

function changeMaterialQuantity(materialId, quantity) {
  const material = newProduct.value.materials.find((m) => m.firestoreId === materialId)
  if (material) {
    material.quantity = quantity
    const stockMaterial = materialStore.getMaterialById(materialId)
    if (stockMaterial && stockMaterial.quantity < quantity) {
      newProduct.value.materialErrors[materialId] =
        `Недостаточно материала "${material.name}". Доступно: ${stockMaterial.quantity} ${stockMaterial.unit}`
    } else {
      delete newProduct.value.materialErrors[materialId]
    }
  }
}

function validateProductMaterials(product) {
  return product.materials.reduce((errors, material) => {
    const stockMaterial = materialStore.getMaterialById(material.firestoreId)
    if (!stockMaterial) {
      errors.push(`Материал "${material.name}" не найден в кладовке.`)
    } else if (stockMaterial.quantity < material.quantity) {
      errors.push(
        `Недостаточно материала "${material.name}". Доступно: ${stockMaterial.quantity} ${stockMaterial.unit}`
      )
    }
    return errors
  }, [])
}

async function saveProduct() {
  const errors = validateProductMaterials(newProduct.value)
  if (errors.length > 0) {
    alert(errors.join('\n'))
    return
  }

  const productData = {
    name: newProduct.value.name,
    materials: newProduct.value.materials,
    repeatCount: 1
  }

  await productStore.addProduct(productData)

  for (const material of newProduct.value.materials) {
    const stockMaterial = materialStore.getMaterialById(material.firestoreId)
    if (stockMaterial) {
      const newQuantity = stockMaterial.quantity - material.quantity
      await updateMaterialQuantity(material.firestoreId, newQuantity)
      materialStore.setMaterialQuantity(material.firestoreId, newQuantity)
    } else {
      console.error(`Материал с ID ${material.firestoreId} не найден в базе данных.`)
    }
  }

  resetNewProductForm()
}

async function updateMaterialQuantity(materialId, newQuantity) {
  const materialRef = doc(db, `users/${userStore.user.uid}/materials`, materialId)
  await updateDoc(materialRef, { quantity: newQuantity })
}

async function repeatProduct(product) {
  const errors = validateProductMaterials(product)
  if (errors.length > 0) {
    alert(errors.join('\n'))
    return
  }

  await Promise.all(
    product.materials.map(async (material) => {
      const currentMaterial = await getDoc(
        doc(db, `users/${userStore.user.uid}/materials`, material.firestoreId)
      )
      if (currentMaterial.exists()) {
        const newQuantity = currentMaterial.data().quantity - material.quantity
        await updateMaterialQuantity(material.firestoreId, newQuantity)
        materialStore.decreaseMaterialQuantity(material.firestoreId, material.quantity)
      }
    })
  )

  product.repeatCount++
  await updateProductInDB(product)
  alert('Продукт успешно повторен!')
}

async function cancelProduct(product) {
  if (product.repeatCount <= 0) {
    alert('Нельзя отменить продукт, который не был повторен')
    return
  }

  await Promise.all(
    product.materials.map(async (material) => {
      const currentMaterial = materialStore.getMaterialById(material.firestoreId)
      if (currentMaterial) {
        const newQuantity = currentMaterial.quantity + material.quantity
        await updateMaterialQuantity(material.firestoreId, newQuantity)
        materialStore.setMaterialQuantity(material.firestoreId, newQuantity)
      }
    })
  )

  product.repeatCount--
  if (product.repeatCount === 0) {
    await deleteProductFromDB(product)
    productStore.removeProduct(product.firestoreId)
  } else {
    await updateProductInDB(product)
  }

  alert(`Материалы возвращены. Осталось повторений: ${product.repeatCount}`)
}

async function updateProductInDB(product) {
  const productRef = doc(db, `users/${userStore.user.uid}/products`, product.firestoreId)
  await updateDoc(productRef, { repeatCount: product.repeatCount })
}

async function deleteProductFromDB(product) {
  const productRef = doc(db, `users/${userStore.user.uid}/products`, product.firestoreId)
  await deleteDoc(productRef)
}

function resetNewProductForm() {
  newProduct.value = { name: '', materials: [], materialErrors: {} }
  showNewProductForm.value = false
}

function getMaxQuantity(materialId) {
  const material = materialStore.getMaterialById(materialId)
  return material ? material.quantity : 0
}

onMounted(async () => {
  try {
    await Promise.all([productStore.subToProducts(), materialStore.subToMaterials()])
  } catch (error) {
    console.error('Error in onMounted:', error)
    // Добавьте здесь обработку ошибок, например, показ сообщения пользователю
  }
})
</script>

<template>
  <div class="products">
    <h2>Products</h2>
    <button @click="showNewProductForm = true" class="btn btn-primary">New Product</button>

    <div v-if="showNewProductForm" class="new-product-form">
      <h3>New Product</h3>
      <input v-model="newProduct.name" placeholder="Product Name" required class="form-input" />
      <div class="material-search">
        <input v-model="searchMaterial" placeholder="Search Material" class="form-input" />
        <ul v-if="searchMaterial" class="material-list">
          <li
            v-for="material in filteredMaterials"
            :key="material.firestoreId"
            @click="addMaterialToProduct(material)"
            @keydown.esc="closeDropdown"
          >
            {{ material.name }} ({{ material.quantity }} {{ material.unit }})
          </li>
        </ul>
      </div>

      <ul class="selected-materials">
        <li
          v-for="material in newProduct.materials"
          :key="material.firestoreId"
          class="material-item"
        >
          {{ material.name }}
          <input
            type="number"
            v-model.number="material.quantity"
            min="1"
            :max="getMaxQuantity(material.firestoreId)"
            @input="changeMaterialQuantity(material.firestoreId, material.quantity)"
            class="form-input quantity-input"
          />
          {{ material.unit }}
          <button @click="removeMaterialFromProduct(material.firestoreId)" class="btn btn-danger">
            Remove
          </button>
          <span v-if="newProduct.materialErrors[material.firestoreId]" class="error">
            {{ newProduct.materialErrors[material.firestoreId] }}
          </span>
        </li>
      </ul>

      <button @click="saveProduct" class="btn btn-success">Save Product</button>
      <button @click="showNewProductForm = false" class="btn btn-secondary">Cancel</button>
    </div>

    <ul class="product-list">
      <li v-for="product in productStore.products" :key="product.firestoreId" class="product-item">
        <h4>{{ product.name }} (Повторений: {{ product.repeatCount || 0 }})</h4>
        <ul class="product-list__materials">
          <li v-for="material in product.materials" :key="material.firestoreId">
            {{ material.name }}: {{ material.quantity }} {{ material.unit }}
          </li>
        </ul>
        <div class="product-list__buttons">
          <button @click="repeatProduct(product)" class="btn btn-primary">Повторить</button>
          <button
            @click="cancelProduct(product)"
            :disabled="!product.repeatCount"
            class="btn btn-warning"
          >
            Отменить
          </button>
        </div>
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
}

.error {
  color: red;
  font-size: 0.9rem;
}
</style>
