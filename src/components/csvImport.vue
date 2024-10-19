<template>
  <div>
    <input type="file" @change="handleFileUpload" />
    <button @click="importCSV">Импортировать CSV</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Papa from 'papaparse'
import { useMaterialStore } from '@/store/index'
import { useUserStore } from '@/store/userStore'

const csvFile = ref(null) // Для хранения выбраного файла
const csvData = ref([]) // Для хранения данных из файла

const userStore = useUserStore()
const materialStore = useMaterialStore()

const handleFileUpload = (event) => {
  // Сохраняем файл
  csvFile.value = event.target.files[0]
}

// Импортируем csv
const importCSV = async () => {
  if (!csvFile.value) {
    alert('Выберите CSV файл')
    return
  }

  // используем PapaParse для парсинга файла
  Papa.parse(csvFile.value, {
    header: true, // Первая строка - название полей
    complete: async (results) => {
      csvData.value = results.data
      // Добавляем данные в firestore
      for (let material of csvData.value) {
        material.userId = userStore.user.uid
        material.quantity = Number(material.quantity)

        await materialStore.addMaterial(material)
      }
      alert('Материалы успешно импортированы')
    },
    error: (error) => {
      console.error('Error parsing CSV: ', error)
    }
  })
}
</script>

<style lang="scss" scoped></style>
