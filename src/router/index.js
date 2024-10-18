import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import MaterialsView from '@/views/MaterialsView.vue'
import ProductsView from '@/views/ProductsView.vue'
import { useUserStore } from '@/store/userStore'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView
  },
  {
    path: '/materials',
    name: 'Materials',
    component: MaterialsView,
    meta: { requiresAuth: true }
  },
  {
    path: '/products',
    name: 'Products',
    component: ProductsView,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Флаг для отслеживания инициализации аутентификации
let authInitialized = false

// Глобальный guard для проверки авторизации
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()

  // Если аутентификация еще не инициализирована, инициализируем ее
  if (!authInitialized) {
    await userStore.initAuthState()
    authInitialized = true
  }

  // Проверяем, требует ли маршрут аутентификации
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    // Ждем завершения загрузки
    if (userStore.loading) {
      // Можно добавить здесь логику отображения загрузки, если нужно
      await new Promise((resolve) => {
        const unwatch = userStore.$subscribe((mutation, state) => {
          if (!state.loading) {
            unwatch()
            resolve()
          }
        })
      })
    }

    if (!userStore.user) {
      // Если пользователь не авторизован, перенаправляем на главную
      next('/')
    } else {
      // Если пользователь авторизован, разрешаем доступ
      next()
    }
  } else {
    // Если страница не требует аутентификации, разрешаем доступ
    next()
  }
})

export default router
