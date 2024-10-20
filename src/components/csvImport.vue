<template>
  <div>
    <input type="file" ref="fileInput" @change="handleFileUpload" accept=".csv" />
    <button @click="importCSV">Импортировать CSV</button>

    <!-- Затемнение и полоса прогресса -->
    <div v-if="isLoading" class="overlay">
      <div class="progress-bar">
        <div class="progress" :style="{ width: progress + '%' }"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Papa from 'papaparse'
import { useMaterialStore } from '@/store/index'
import { useUserStore } from '@/store/userStore'

const csvFile = ref(null)
const isLoading = ref(false) // Состояние загрузки
const progress = ref(0) // Прогресс импорта
const fileInput = ref(null) // Ссылка на инпут

const userStore = useUserStore()
const materialStore = useMaterialStore()

const handleFileUpload = (event) => {
  csvFile.value = event.target.files[0]
}

const importCSV = async () => {
  if (!csvFile.value) {
    alert('Выберите CSV файл')
    return
  }

  isLoading.value = true // Начать загрузку
  progress.value = 0 // Сбросить прогресс

  const reader = new FileReader()
  reader.onload = function (e) {
    const csv = e.target.result
    Papa.parse(csv, {
      header: true,
      complete: async (results) => {
        console.log('Parsed data:', results.data) // Отладочный вывод

        const totalRows = results.data.length
        let importedCount = 0
        let skippedCount = 0

        for (let index = 0; index < totalRows; index++) {
          const row = results.data[index]
          const material = {
            name: row.name,
            quantity: Number(row.quantity) || 0,
            unit: row.unit,
            category: row.category,
            userId: userStore.user.uid
          }

          // Проверяем наличие обязательных полей
          if (material.name && material.unit && material.category) {
            await materialStore.addMaterial(material)
            importedCount++
          } else {
            console.warn('Пропущена запись из-за отсутствия обязательных полей:', material)
            skippedCount++
          }

          // Обновляем прогресс
          progress.value = ((index + 1) / totalRows) * 100
        }

        alert(`Импорт завершен. Импортировано: ${importedCount}, Пропущено: ${skippedCount}`)

        // Очистка формы загрузки
        csvFile.value = null
        isLoading.value = false // Завершить загрузку
        progress.value = 0 // Сбросить прогресс

        // Сбросить инпут
        fileInput.value.value = null
      },
      error: (error) => {
        console.error('Ошибка при парсинге CSV: ', error)
        isLoading.value = false // Завершить загрузку в случае ошибки
      }
    })
  }

  reader.readAsText(csvFile.value, 'UTF-8')
}
</script>

<style lang="scss" scoped>
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5); /* Затемнение */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000; /* На верхнем уровне */
}

.progress-bar {
  width: 80%; /* Ширина полосы прогресса */
  background: #ccc; /* Цвет фона полосы */
  border-radius: 5px; /* Закругление краёв */
  overflow: hidden; /* Скрыть переполнение */
}

.progress {
  height: 20px; /* Высота полосы прогресса */
  background: #4caf50; /* Цвет заполнения */
  transition: width 0.4s; /* Плавный переход */
}
</style>
