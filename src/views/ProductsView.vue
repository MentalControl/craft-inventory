<script setup>
import { ref, computed, onMounted } from 'vue'
import Notification from '@/components/Notification.vue'
import PageHeader from '@/components/pages/PageHeader.vue'
import { useMaterialStore } from '@/store/materialStore.js'
import { useProductStore } from '@/store/productStore.js'

const TITLE = 'Кузница Великих Изделий'

const materialStore = useMaterialStore()
const productStore = useProductStore()

const notificationRef = ref(null)

function removeMaterialFromProduct(materialId) {
  delete newProduct.value.materialErrors[materialId]
  newProduct.value.materials = newProduct.value.materials.filter(
    (m) => m.firestoreId !== materialId
  )
}

// function getMaxQuantity(materialId) {
//   const material = materialStore.getMaterialById(materialId)
//   return material ? material.quantity : 0
// }

const sortedProducts = computed(() => {
  return productStore.products.sort((a, b) => b.createdAt - a.createdAt)
})

function handleAddMaterialToProduct(material) {
  productStore.addMaterialToProduct(material)
}

onMounted(async () => {
  productStore.setNotificationFunction((message, type) => {
    notificationRef.value.addNotification(message, type)
  })

  try {
    await Promise.all([productStore.subToProducts(), materialStore.subToMaterials()])
    productStore.showNewProductForm = false
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
      <button @click="productStore.showNewProductForm = true">Добавить изделие</button>
    </template>
  </PageHeader>
  <div class="products">
    <div v-if="productStore.showNewProductForm" class="new-product-form">
      <h3>Новое изделие</h3>
      <input
        v-model="productStore.newProduct.name"
        placeholder="Название изделия"
        required
        class="form-input"
      />
      <div class="material-search">
        <input
          v-model="materialStore.searchMaterial"
          placeholder="Поиск материала"
          class="form-input"
          @keyup.esc="materialStore.searchMaterial = ''"
        />
        <ul v-if="materialStore.searchMaterial" class="material-list">
          <li
            v-for="material in materialStore.filteredMaterials"
            :key="material.firestoreId"
            @click="handleAddMaterialToProduct(material)"
            @keydown.esc="closeDropdown"
          >
            {{ material.name }} ({{ material.quantity }} {{ material.unit }})
          </li>
        </ul>
      </div>

      <ul class="selected-materials">
        <li
          v-for="material in productStore.newProduct.materials"
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
                :max="materialStore.getMaxQuantity(material.firestoreId)"
                @input="
                  productStore.changeMaterialQuantity(material.firestoreId, material.quantity)
                "
                class="form-input quantity-input"
              />{{ material.unit }}
            </div>
            <button @click="removeMaterialFromProduct(material.firestoreId)" class="btn btn-delete">
              X
            </button>
          </div>
          <span v-if="productStore.newProduct.materialErrors[material.firestoreId]" class="error">
            {{ productStore.newProduct.materialErrors[material.firestoreId] }}
          </span>
        </li>
      </ul>
      <div class="control-buttons">
        <button @click="productStore.saveProduct" class="btn btn-success">Сохранить изделие</button>
        <button @click="showNewProductForm = false" class="btn btn-secondary">Отменить</button>
      </div>
    </div>
    <p v-if="productStore.products.length === 0">Мы еще ничего не создали</p>
    <ul class="product-list">
      <li v-for="product in sortedProducts" :key="product.firestoreId" class="product-item">
        <h4 class="product-item__title">
          {{ product.name }} <span>(Повторений: {{ product.repeatCount || 0 }})</span>
        </h4>
        <ul class="product-item__materials">
          <li v-for="material in product.materials" :key="material.firestoreId">
            {{ material.name }}: {{ material.quantity }} {{ material.unit }}
          </li>
        </ul>
        <div class="product-item__buttons">
          <button @click="productStore.repeatProduct(product)" class="btn btn-primary">
            Повторить
          </button>
          <button
            @click="productStore.cancelProduct(product)"
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

<style scoped></style>
