<script setup>
import { computed, ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/store/userStore'
import { useMaterialStore } from '@/store/materialStore'
import { useActivityStore } from '@/store/activityStore'

import AuthComp from '@/components/AuthComp.vue'
import UserButton from '@/components/UserButton.vue'
import PageHeader from '@/components/pages/PageHeader.vue'

const TITLE = ref('Хроники Складских Деяний')
const DESCRIPTION = ref(
  `Добро пожаловать в наш Великий Склад! Здесь записаны все подвиги нашего братства по добыче, использованию и созданию изделий. Каждый материал, добытый с трудом, и каждое изделие,выкованное в огне, хранится в этих свитках! Следите за историей материалов и изделий, да будет известно, кто сотворил славные творения!`
)

const userStore = useUserStore()

const materialStore = useMaterialStore()
const lowStockMaterials = computed(() => materialStore.lowStockMaterials)

const activityStore = useActivityStore()
const { activities } = storeToRefs(activityStore)

const getUnitWord = (value) => {
  if (!value) return 'единиц'

  const lastDigit = value % 10
  const lastTwoDigits = value % 100

  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) return 'единиц'
  if (lastDigit === 1) return 'единица'
  if (lastDigit >= 2 && lastDigit <= 4) return 'единицы'
  return 'единиц'
}

onMounted(() => {
  activityStore.fetchActivities()
  materialStore.subToMaterials()
})
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
      <div class="content">
        <div class="activityfeed">
          <span>Лента активности</span>
          <ul class="activityfeed__list">
            <li class="activityfeed__item" v-for="activity in activities" :key="activity.id">
              {{ activity.timestamp }} -
              <div v-html="activity.type"></div>
              <div v-if="activity.details" v-html="activity.details"></div>
            </li>
          </ul>
        </div>
        <div v-if="lowStockMaterials && lowStockMaterials.length > 0" class="stock">
          <span class="stock__title">Наши запасы кончаются!</span>
          <ul class="stock__list">
            <li v-for="material in lowStockMaterials" :key="material.id" class="stock__item">
              <div class="stock__item__wrapper">
                <p class="stock__item__title">
                  {{ material?.name || 'Неизвестный материал' }}:
                  <span
                    >осталось {{ material?.quantity || 0 }}
                    {{ getUnitWord(material?.quantity) }}</span
                  >
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>
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
.content {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  @media (max-width: 931px) {
    flex-direction: column;
    gap: 1rem;
    padding-bottom: 1rem;
  }
  .activityfeed {
    height: 100%;
    flex: 0 0 65%;

    padding: 1rem;

    color: var(--text-color);

    background-color: var(--bg-color);
    border-left: 4px solid var(--accent-color);
    border-radius: 6px;

    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    @media (max-width: 1200px) {
      flex: 0 0 60%;
    }
    span {
      display: block;
      font-size: 1.25rem;
      font-weight: bold;
      margin-bottom: 0.5rem;
    }
    &__list {
      max-height: 30rem;
      height: 100%;

      display: flex;
      flex-direction: column;
      gap: 0.75rem;

      overflow: auto;
    }
    &__item {
      padding: 0.25rem 0;

      display: flex;
      flex-direction: column;
      align-items: flex-start;

      border-bottom: 1px solid var(--accent-color);
      &:last-child {
        border-bottom: none;
      }
      div {
        text-wrap-style: balance;
      }
    }
  }
  .stock {
    height: 100%;
    flex: 0 0 30%;

    padding: 1rem;

    font-size: 0.95rem;
    color: var(--text-color);

    background-color: var(--bg-color);
    border-left: 4px solid var(--accent-color);
    border-radius: 6px;

    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    @media (max-width: 1200px) {
      flex: 0 0 38%;
    }
    &__title {
      display: block;
      font-size: 1.25rem;
      font-weight: bold;
      margin-bottom: 0.5rem;
    }

    &__list {
      max-height: 30rem;
      height: 100%;

      display: flex;
      flex-direction: column;
      gap: 0.75rem;

      overflow: auto;
    }

    &__item {
      padding: 0.25rem 0;

      display: flex;
      align-items: center;
      justify-content: space-between;

      border-bottom: 1px solid var(--accent-color);
      &:last-child {
        border-bottom: none;
      }

      &__wrapper {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      &__title {
        font-weight: 600;
        color: var(--text-color);
        span {
          color: #dc3545;
          font-weight: 500;
        }
        @media (max-width: 365px) {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
      }
    }
  }
}
</style>
