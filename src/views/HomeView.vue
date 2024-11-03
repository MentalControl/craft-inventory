<script setup>
import { ref } from 'vue'
import { useUserStore } from '@/store/userStore'
import AuthComp from '@/components/AuthComp.vue'
import UserButton from '@/components/UserButton.vue'
import PageHeader from '@/components/pages/PageHeader.vue'

const TITLE = ref('Хроники Складских Деяний')
const DESCRIPTION = ref(
  `Добро пожаловать в наш Великий Склад! Здесь записаны все подвиги нашего братства по добыче, использованию и созданию изделий. Каждый материал, добытый с трудом, и каждое изделие,выкованное в огне, хранится в этих свитках! Следите за историей материалов и изделий, да будет известно, кто сотворил славные творения!`
)

const userStore = useUserStore()
</script>

<template>
  <div class="home">
    <!-- Если идет загрузка, показываем спиннер -->
    <div v-if="userStore.loading" class="spinner"></div>

    <!-- Если пользователь не авторизован, показываем только форму -->
    <AuthComp v-else-if="!userStore.user" />

    <!-- Если пользователь авторизован, показываем основной контент -->
    <template v-else>
      <PageHeader :title="TITLE">
        <template #btn-action>
          <UserButton />
        </template>
        <template #description>
          <p>{{ DESCRIPTION }}</p>
        </template>
      </PageHeader>
    </template>
  </div>
</template>

<style scoped lang="scss">
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
