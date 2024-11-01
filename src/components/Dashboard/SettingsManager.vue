<!-- components/SettingsManager.vue -->
<template>
  <div class="settings-manager">
    <!-- Единицы измерения -->
    <div class="settings-section">
      <h3>Единицы измерения</h3>
      <div class="input-group">
        <input v-model="newUnit" placeholder="Добавить единицу измерения" @keyup.enter="addUnit" />
        <button @click="addUnit" :disabled="!newUnit">Добавить</button>
      </div>
      <div class="options-list">
        <div v-for="unit in settingsStore.unitOptions" :key="unit" class="option-item">
          {{ unit }}
          <button @click="removeUnit(unit)" class="remove-btn">×</button>
        </div>
      </div>
    </div>

    <!-- Категории -->
    <div class="settings-section">
      <h3>Категории</h3>
      <div class="input-group">
        <input v-model="newCategory" placeholder="Добавить категорию" @keyup.enter="addCategory" />
        <button @click="addCategory" :disabled="!newCategory">Добавить</button>
      </div>
      <div class="options-list">
        <div v-for="category in settingsStore.categoryOptions" :key="category" class="option-item">
          <span>{{ category }}</span>
          <button @click="removeCategory(category)" class="remove-btn">×</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useSettingsStore } from '@/store/settingsStore'

const settingsStore = useSettingsStore()
const newUnit = ref('')
const newCategory = ref('')

// Load settings when the component mounts
onMounted(() => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      userStore.setUser(user)
      await settingsStore.loadSettings() // Загружаем настройки только после аутентификации
    } else {
      userStore.clearUser()
      // Возможно, очистить или сбросить настройки, если пользователь не аутентифицирован
    }
    userStore.loading = false
  })
})

const addUnit = async () => {
  if (newUnit.value) {
    await settingsStore.addUnit(newUnit.value)
    newUnit.value = ''
  }
}

const removeUnit = async (unit) => {
  await settingsStore.removeUnit(unit)
}

const addCategory = async () => {
  if (newCategory.value) {
    await settingsStore.addCategory(newCategory.value)
    newCategory.value = ''
  }
}

const removeCategory = async (category) => {
  await settingsStore.removeCategory(category)
}
</script>

<style scoped lang="scss">
.settings-manager {
  margin-top: 1rem;
  background-color: var(--bg-color);
  color: var(--text-color);
}

.settings-section {
  margin-bottom: 30px;
  border: var(--border);
  border-radius: 4px;
  padding: 15px;
  background-color: #ffffff; /* Optional: Background for each section */
  h3 {
    margin-bottom: 15px;
    color: var(--main-color);
  }
  .input-group {
    display: flex;
    gap: var(--gap);
    margin-bottom: 15px;
    input {
      flex: 1;
      padding: 8px;
      border: var(--border);
      border-radius: 4px;
      color: var(--text-color);
    }
    button {
      flex: 0 0 20%;
      padding: 8px 15px;
      background-color: var(--button-color);
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.3s;
      &:hover {
        background-color: var(--hover-color);
      }
      &:disabled {
        background-color: rgb(229, 229, 229);
        cursor: not-allowed;
        &:hover {
          box-shadow: 0 0 10px rgb(229, 229, 229);
        }
      }
    }
  }
}

.options-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--gap);
}

.option-item {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  background-color: var(--bg-color); /* Optional: Background for each option */
  border-radius: 4px;
  border: var(--border); /* Optional: Add border to options */
}

.remove-btn {
  background: var(--bg-color);
  color: #e02424;
  border: none;
  cursor: pointer;
  font-size: 18px;
  padding: 0 5px;
}

.remove-btn:hover {
  color: #cc0000;
}
</style>
