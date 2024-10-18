<script setup>
import { auth } from '../firebase'
import { signOut } from 'firebase/auth'
import { useUserStore } from '@/store/userStore'

const userStore = useUserStore()

const handleLogout = async () => {
  try {
    await signOut(auth)
    userStore.clearUser() // Очищаем данные пользователя при выходе
    console.log('Logout successful')
  } catch (error) {
    console.error('Logout error:', error.message)
  }
}
</script>

<template>
  <button @click="handleLogout">Выйти</button>
</template>
