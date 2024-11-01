import { useSettingsStore } from '@/store/settingsStore'
import { useUserStore } from '@/store/userStore' // Импортируйте userStore
import { auth } from '@/firebase'
import { onAuthStateChanged } from 'firebase/auth'

export default {
  install: (app) => {
    const settingsStore = useSettingsStore()
    const userStore = useUserStore() // Создайте экземпляр userStore

    // Добавляем слушатель состояния аутентификации
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        userStore.setUser(user) // Сохраняем пользователя из userStore
        await settingsStore.loadSettings() // Загружаем настройки только если пользователь авторизован
      } else {
        userStore.clearUser() // Очищаем данные пользователя, если он не авторизован
        settingsStore.unitOptions = [] // Очистите unitOptions
        settingsStore.categoryOptions = [] // Очистите categoryOptions
      }
    })
  }
}
