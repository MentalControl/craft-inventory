import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useUserStore } from './store/userStore'

const app = createApp(App)
const pinia = createPinia()

app.use(router)
app.use(pinia)

const userStore = useUserStore()
userStore.initAuthState()

app.mount('#app')
