<script setup>
import { ref } from 'vue'
import { useUserStore } from '@/store/userStore'
import AuthComp from '@/components/AuthComp.vue'
import UserButton from '@/components/UserButton.vue'

const title = ref('Хроники Складских Деяний')
const description = ref(
  `Добро пожаловать в наш Великий Склад! Здесь записаны все подвиги нашего братства по добыче, использованию и созданию изделий. <br> Каждый материал, добытый с трудом, и каждое изделие,выкованное в огне, хранится в этих свитках! Следите за историей материалов и изделий, да будет известно, кто сотворил славные творения!`
)

const userStore = useUserStore()
</script>

<template>
  <div class="home">
    <header class="content-title">
      <div>
        <h1>{{ title }}</h1>
        <!-- Показываем кнопку выхода, если пользователь авторизован -->
        <UserButton v-if="userStore.user" />
      </div>
      <p v-html="description"></p>
    </header>

    <!-- Если идет загрузка, показываем сообщение "Загрузка..." -->
    <div v-if="userStore.loading" class="spinner"></div>

    <!-- Если пользователь не авторизован и загрузка завершена, показываем форму авторизации -->
    <AuthComp v-else-if="!userStore.user" />
  </div>
</template>

<style scoped>
.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left-color: #ffdc3e;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 20px auto;
}

/* Анимация вращения */
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
