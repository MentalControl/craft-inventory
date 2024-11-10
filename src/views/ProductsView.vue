<script setup>
import { ref, computed, onMounted } from 'vue'
import Notification from '@/components/Notification.vue'
import PageHeader from '@/components/pages/PageHeader.vue'
import { useMaterialStore } from '@/store/materialStore.js'
import { useProductStore } from '@/store/productStore.js'
import { useUserStore } from '@/store/userStore'
import { db } from '@/firebase'
import { doc, updateDoc, getDoc, deleteDoc } from 'firebase/firestore'

const TITLE = 'Кузница Великих Изделий'

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

const notificationRef = ref(null) // добавьте ref на компонент уведомлений

function addMaterialToProduct(material) {
  const existingMaterial = newProduct.value.materials.find(
    (m) => m.firestoreId === material.firestoreId
  )
  if (existingMaterial) {
    notificationRef.value.addNotification(`Материал "${material.name}" уже добавлен`, 'error')
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
  let hasErrors = false

  for (const material of product.materials) {
    const stockMaterial = materialStore.getMaterialById(material.firestoreId)
    if (!stockMaterial) {
      notificationRef.value.addNotification(
        `Материал "${material.name}" не найден в кладовке.`,
        'error'
      )
      hasErrors = true
    } else if (stockMaterial.quantity < material.quantity) {
      notificationRef.value.addNotification(
        `Недостаточно материала "${material.name}". Доступно: ${stockMaterial.quantity} ${stockMaterial.unit}`,
        'error'
      )
      hasErrors = true
    }
  }

  return hasErrors
}

async function saveProduct() {
  const errors = validateProductMaterials(newProduct.value)
  if (errors.length > 0) {
    errors.forEach((error) => {
      notificationRef.value.addNotification(error, 'error')
    })
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
      notificationRef.value.addNotification(
        `Материал с ID ${material.firestoreId} не найден в базе данных.`,
        'error'
      )
    }
  }

  notificationRef.value.addNotification(`Продукт ${productData.name} успешно создан!`, 'success')
  resetNewProductForm()
}

async function updateMaterialQuantity(materialId, newQuantity) {
  const materialRef = doc(db, `users/${userStore.user.uid}/materials`, materialId)
  await updateDoc(materialRef, { quantity: newQuantity })
}

async function repeatProduct(product) {
  if (validateProductMaterials(product)) {
    return // Есть ошибки, уведомления уже показаны
  }

  try {
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
    notificationRef.value.addNotification(`Продукт ${product.name} успешно повторен!`, 'success')
  } catch (error) {
    console.error('Error in repeatProduct:', error)
    notificationRef.value.addNotification('Произошла ошибка при повторении продукта', 'error')
  }
}

async function cancelProduct(product) {
  if (product.repeatCount <= 0) {
    notificationRef.value.addNotification(
      'Нельзя отменить продукт, который не был повторен',
      'error'
    )
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
    notificationRef.value.addNotification(`Продукт ${product.name} успешно удален!`, 'success')
  } else {
    await updateProductInDB(product)
    notificationRef.value.addNotification(
      `Материалы возвращены. Осталось повторений: ${product.repeatCount}`,
      'success'
    )
  }
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
    notificationRef.value.addNotification(
      'Ошибка при загрузке данных. Пожалуйста, обновите страницу.',
      'error'
    )
  }
})
</script>

<template>
  <PageHeader :title="TITLE">
    <template #btn-action>
      <button @click="showNewProductForm = true">Добавить изделие</button>
    </template>
  </PageHeader>
  <div class="products">
    <div v-if="showNewProductForm" class="new-product-form">
      <h3>Новое изделие</h3>
      <input v-model="newProduct.name" placeholder="Название изделия" required class="form-input" />
      <div class="material-search">
        <input
          v-model="searchMaterial"
          placeholder="Поиск материала"
          class="form-input"
          @keyup.esc="searchMaterial = ''"
        />
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
          <div class="materials-quantity">
            <div class="materials-input">
              <input
                type="number"
                v-model.number="material.quantity"
                min="1"
                :max="getMaxQuantity(material.firestoreId)"
                @input="changeMaterialQuantity(material.firestoreId, material.quantity)"
                class="form-input quantity-input"
              />{{ material.unit }}
            </div>
            <button @click="removeMaterialFromProduct(material.firestoreId)" class="btn btn-delete">
              X
            </button>
          </div>
          <span v-if="newProduct.materialErrors[material.firestoreId]" class="error">
            {{ newProduct.materialErrors[material.firestoreId] }}
          </span>
        </li>
      </ul>
      <div class="control-buttons">
        <button @click="saveProduct" class="btn btn-success">Сохранить изделие</button>
        <button @click="showNewProductForm = false" class="btn btn-secondary">Отменить</button>
      </div>
    </div>

    <ul class="product-list">
      <li v-for="product in productStore.products" :key="product.firestoreId" class="product-item">
        <h4 class="product-item__title">
          {{ product.name }} <span>(Повторений: {{ product.repeatCount || 0 }})</span>
        </h4>
        <ul class="product-item__materials">
          <li v-for="material in product.materials" :key="material.firestoreId">
            {{ material.name }}: {{ material.quantity }} {{ material.unit }}
          </li>
        </ul>
        <div class="product-item__buttons">
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
  <Notification ref="notificationRef" />
</template>

<style scoped>
.products {
  width: 100%;
  margin: 0 auto;
}

.new-product-form {
  background-color: var(--main-color);
  padding: 1rem;
  margin-top: 1rem;
  border-radius: 10px;
}
.new-product-form h3 {
  margin-bottom: 1rem;
}
.form-input {
  width: 100%;
  margin-bottom: 0.5rem;
}
.material-search {
  position: relative;
  margin-bottom: 1rem;
  width: 100%;
}
.material-search input {
  width: 100%;
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
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  margin-bottom: 1rem;
  @media (max-width: 1024px) {
    grid-template-columns: repeat(4, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 576px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 400px) {
    grid-template-columns: 1fr;
  }
}

.selected-materials .material-item {
  margin: 0;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  background-color: var(--bg-color);
  padding: 8px;
  border: var(--border);
  border-radius: 10px;
}

.materials-quantity {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
}

.materials-input {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 5px;
}

.btn-delete {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-list {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-gap: 0.5rem;
  list-style-type: none;
  margin-top: 1rem;
  padding: 0;
  @media (max-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 576px) {
    grid-template-columns: repeat(1, 1fr);
  }
}

.product-list .product-item {
  height: fit-content;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
  border: 1px solid #ccc;
  padding: 0.75rem;
  border-radius: 4px;
}
.product-list .product-item .product-item__buttons {
  width: 100%;
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
}

.control-buttons {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 15px;
}

.error {
  color: red;
  font-size: 0.9rem;
  text-wrap-style: balance;
}
</style>
