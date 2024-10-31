<script setup>
import { ref } from 'vue'
import { auth } from '../firebase'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'
import { useUserStore } from '@/store/userStore' // Импортируем store

const email = ref('')
const password = ref('')
const isLogin = ref(true)
const userStore = useUserStore() // Доступ к store

const handleSubmit = async () => {
  try {
    if (isLogin.value) {
      const userCredential = await signInWithEmailAndPassword(auth, email.value, password.value)
      userStore.setUser(userCredential.user) // Устанавливаем пользователя в store
    } else {
      const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value)
      userStore.setUser(userCredential.user) // Устанавливаем пользователя в store
    }
  } catch (error) {
    console.error('Authentication error:', error.message)
  }
}

const toggleAuthMode = () => {
  isLogin.value = !isLogin.value
}
</script>

<template>
  <div class="auth" v-if="!userStore.user">
    <!-- Форма для регистрации/входа -->
    <h2>{{ isLogin ? 'Login' : 'Sign Up' }}</h2>
    <form @submit.prevent="handleSubmit">
      <input v-model="email" type="email" placeholder="Email" required />
      <input
        v-model="password"
        type="password"
        placeholder="Password"
        required
        autocomplete="off"
      />
      <button type="submit">{{ isLogin ? 'Login' : 'Sign Up' }}</button>
    </form>
    <p @click="toggleAuthMode">
      {{ isLogin ? 'Need an account? Sign up' : 'Already have an account? Login' }}
    </p>
  </div>
  <div v-else>
    <!-- Контент для авторизованного пользователя -->
    <p>Welcome, {{ userStore.user.email }}!</p>
    <button @click="userStore.clearUser()">Logout</button>
  </div>
</template>
