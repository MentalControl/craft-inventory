<script setup>
import { ref } from 'vue'
import { auth } from '../firebase'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'

const email = ref('')
const password = ref('')
const isLogin = ref(true)

const handleSubmit = async () => {
  try {
    if (isLogin.value) {
      await signInWithEmailAndPassword(auth, email.value, password.value)
    } else {
      await createUserWithEmailAndPassword(auth, email.value, password.value)
    }
    console.log('Authentication successful')
    // Redirect or update UI as needed
  } catch (error) {
    console.error('Authentication error:', error.message)
  }
}

const toggleAuthMode = () => {
  isLogin.value = !isLogin.value
}
</script>
<template>
  <div class="auth">
    <h2>{{ isLogin ? 'Login' : 'Sign Up' }}</h2>
    <form @submit.prevent="handleSubmit">
      <input v-model="email" type="email" placeholder="Email" required />
      <input v-model="password" type="password" placeholder="Password" required />
      <button type="submit">{{ isLogin ? 'Login' : 'Sign Up' }}</button>
    </form>
    <p @click="toggleAuthMode">
      {{ isLogin ? 'Need an account? Sign up' : 'Already have an account? Login' }}
    </p>
  </div>
</template>
