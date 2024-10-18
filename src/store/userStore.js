import { defineStore } from 'pinia'
import { ref } from 'vue'
import { auth } from '@/firebase'

export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const loading = ref(true)

  const setUser = (userData) => {
    user.value = userData
  }

  const clearUser = () => {
    user.value = null
  }

  const initAuthState = () => {
    return new Promise((resolve) => {
      loading.value = true
      auth.onAuthStateChanged((currentUser) => {
        if (currentUser) {
          setUser(currentUser)
        } else {
          clearUser()
        }
        loading.value = false
        resolve()
      })
    })
  }

  return { user, loading, setUser, clearUser, initAuthState }
})
