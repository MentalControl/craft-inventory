<script setup>
import { ref } from 'vue'
import { auth } from '../firebase'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'
import { useUserStore } from '@/store/userStore'

const email = ref('')
const password = ref('')
const isLogin = ref(true)
const userStore = useUserStore()
const error = ref('')

const handleSubmit = async () => {
  try {
    if (isLogin.value) {
      const userCredential = await signInWithEmailAndPassword(auth, email.value, password.value)
      userStore.setUser(userCredential.user)
    } else {
      const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value)
      userStore.setUser(userCredential.user)
    }
    error.value = ''
  } catch (err) {
    error.value = err.message
  }
}

const handleLogout = () => {
  userStore.clearUser()
}

const toggleAuthMode = () => {
  isLogin.value = !isLogin.value
  error.value = ''
}
</script>

<template>
  <div class="container">
    <div v-if="!userStore.user" class="auth-card">
      <div class="card-header">
        <h2>{{ isLogin ? 'С возвращением' : 'Создать аккаунт' }}</h2>
        <p class="subtitle">
          {{ isLogin ? 'Войдите в ваш аккаунт' : 'Введите данные для регистрации' }}
        </p>
        <span class="test-acc">
          Тестовый аккаунт:
          <p>admin@admin.com : admin123</p>
        </span>
      </div>

      <form @submit.prevent="handleSubmit" class="form">
        <div class="input-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="name@example.com"
            autocomplete="email"
            required
          />
        </div>

        <div class="input-group">
          <label for="password">Пароль</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="••••••••"
            autocomplete="password"
            required
          />
        </div>

        <p v-if="error" class="error">{{ error }}</p>

        <button type="submit" class="submit-btn">
          {{ isLogin ? 'Войти' : 'Зарегистрироваться' }}
        </button>
      </form>

      <p class="toggle-text">
        {{ isLogin ? 'Нет аккаунта?' : 'Уже есть аккаунт?' }}
        <button @click="toggleAuthMode" class="toggle-btn">
          {{ isLogin ? 'Зарегистрироваться' : 'Войти' }}
        </button>
      </p>
    </div>

    <div v-else class="welcome-card">
      <h2>Добро пожаловать!</h2>
      <p class="email">{{ userStore.user.email }}</p>
      <button @click="handleLogout" class="logout-btn">
        Выйти
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="logout-icon">
          <path
            d="M9 4.5H8C5.64298 4.5 4.46447 4.5 3.73223 5.23223C3 5.96447 3 7.14298 3 9.5V14.5C3 16.857 3 18.0355 3.73223 18.7678C4.46447 19.5 5.64298 19.5 8 19.5H9"
            stroke="currentColor"
            stroke-width="1.5"
          />
          <path
            d="M9 6.4764C9 4.18259 9 3.03569 9.70725 2.4087C10.4145 1.78171 11.4955 1.97026 13.6576 2.34736L15.9864 2.75354C18.3809 3.17118 19.5781 3.37999 20.2891 4.25826C21 5.13652 21 6.40672 21 8.94711V15.0529C21 17.5933 21 18.8635 20.2891 19.7417C19.5781 20.62 18.3809 20.8288 15.9864 21.2465L13.6576 21.6526C11.4955 22.0297 10.4145 22.2183 9.70725 21.5913C9 20.9643 9 19.8174 9 17.5236V6.4764Z"
            stroke="currentColor"
            stroke-width="1.5"
          />
          <path d="M12 11V13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        </svg>
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  display: grid;
  place-items: center;
  background-color: var(--bg-color);
  padding: 1rem;
}

.auth-card,
.welcome-card {
  width: 100%;
  max-width: 400px;
  background-color: #fff;
  border-radius: 1rem;
  padding: 2rem;
  border: var(--border);
  box-shadow: 0 4px 15px rgba(140, 122, 100, 0.1);
}

.card-header {
  text-align: center;
  margin-bottom: 1rem;

  h2 {
    color: var(--text-color);
    font-weight: 700;
    margin-bottom: 0.5rem;
  }

  .subtitle {
    color: var(--button-color);
  }
  .test-acc {
    display: flex;
    flex-direction: column;
    gap: 2px;
    margin-top: 8px;
    color: red;
  }
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  label {
    color: var(--text-color);
    font-size: 0.875rem;
    font-weight: 500;
  }

  input {
    padding: 0.75rem 1rem;
    background-color: var(--bg-color);
    border: var(--border);
    border-radius: 0.5rem;
    color: var(--text-color);
    font-size: 0.875rem;
    transition: all 0.2s ease;

    &:focus {
      outline: none;
      border-color: var(--main-color);
      box-shadow: 0 0 0 2px rgba(200, 176, 143, 0.2);
    }

    &::placeholder {
      color: var(--button-color);
    }
  }
}

.error {
  color: #d32f2f;
  font-size: 0.875rem;
  text-align: center;
}

.submit-btn {
  padding: 0.75rem 1.5rem;
  background-color: var(--main-color);
  color: #fff;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: var(--accent-color);
  }

  &:active {
    transform: scale(0.98);
  }
}

.toggle-text {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 1.5rem;
  text-align: center;
  color: var(--button-color);
  font-size: 1rem;
}

.toggle-btn {
  background: var(--main-color);
  border: none;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  padding: 12px 0;
  margin-left: 0;

  &:hover {
    text-decoration: underline;
    background-color: var(--accent-color);
  }
}

.welcome-card {
  text-align: center;

  h2 {
    color: var(--text-color);
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  .email {
    color: var(--button-color);
    margin-bottom: 1.5rem;
  }
}

.logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem 1.5rem;
  background-color: var(--main-color);
  color: #fff;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: var(--accent-color);
  }

  &:active {
    transform: scale(0.98);
  }

  .logout-icon {
    width: 1.25rem;
    height: 1.25rem;
    stroke: currentColor;
  }
}
</style>
