<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/store/userStore'
import { useMaterialStore } from '@/store/materialStore'
import { auth } from './firebase'
import { onAuthStateChanged } from 'firebase/auth'
import MenuItem from '@/components/pages/MenuItem.vue'

const route = useRoute()
const userStore = useUserStore()
const materialStore = useMaterialStore()

const isHomePage = computed(() => {
  return route.path === '/'
})

onMounted(() => {
  // Сначала дождёмся инициализации состояния авторизации
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      userStore.setUser(user)
      // Подписываемся на материалы только после установки пользователя
      materialStore.subToMaterials()
    } else {
      userStore.clearUser()
    }
    userStore.loading = false
  })
  userStore.initAuthState()
})

const updateContentPadding = () => {
  if (window.innerWidth <= 992) {
    const sidebar = document.querySelector('nav')
    const mainContent = document.querySelector('.main')
    if (sidebar && mainContent) {
      const sidebarHeight = sidebar.offsetHeight
      mainContent.style.paddingBottom = `${sidebarHeight}px`
    }
  } else {
    // Сбрасываем padding если экран больше заданной ширины
    const mainContent = document.querySelector('.main')
    if (mainContent) {
      mainContent.style.paddingBottom = '0'
    }
  }
}

onMounted(() => {
  updateContentPadding()
  window.addEventListener('resize', updateContentPadding)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateContentPadding)
})
</script>

<template>
  <nav>
    <div class="logo">
      <img v-if="isHomePage" src="@/assets/close.png" alt="Happy Gnom" />
      <img v-else src="@/assets/open.png" alt="Angry Gnom" />
    </div>
    <div class="links">
      <MenuItem to="/" :class="{ 'notification-dot': materialStore.lowStockMaterials.length > 0 }">
        <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" fill="#000000">
          <path
            fill="#000000"
            d="M195.344 71.438c-3.83.12-7.66 1.205-10.938 3.062-9.987 5.66-16.774 16.198-25.062 31.72-8.288 15.52-17.55 36.4-29.03 63.218C107.35 223.07 75.606 300.42 26.843 403.875a9.5 9.5 0 1 0 17.187 8.094c48.966-103.882 80.897-181.682 103.75-235.064 11.428-26.69 20.6-47.274 28.314-61.72 7.713-14.443 14.5-22.366 17.656-24.155 1.578-.893 1.773-.822 2.78-.56 1.01.26 3.136 1.348 6 4.155 5.732 5.614 13.667 17.43 23.314 34.438 19.077 33.636 45.742 87.6 87.28 159.03-4.364 10.616-9.077 21.89-14.25 33.876a9.5 9.5 0 1 0 17.438 7.53c20.076-46.524 33.676-83.107 44.188-106.47 5.256-11.68 9.878-20.06 13.22-24.093 1.445-1.745 2.452-2.466 2.874-2.718.654.36 4.928 3.886 9.937 12.468 5.162 8.84 11.398 22.197 18.845 40 14.893 35.605 34.786 89.108 63.313 162.656a9.503 9.503 0 1 0 17.718-6.875c-28.48-73.43-48.32-126.835-63.5-163.126-7.59-18.146-13.993-31.983-19.97-42.22-5.974-10.235-11.09-17.537-19.78-20.843-2.172-.825-4.596-1.186-7-1.124-2.403.062-4.778.553-6.875 1.47-4.192 1.83-7.355 4.77-10.186 8.186-5.664 6.836-10.42 16.147-15.938 28.407-6.044 13.432-12.834 30.485-20.97 50.624-37.043-64.58-61.375-113.65-79.81-146.156-9.925-17.5-17.96-30.198-26.564-38.626-4.3-4.213-8.923-7.548-14.53-9-1.403-.362-2.857-.563-4.313-.624-.547-.024-1.08-.018-1.626 0zm5.03 258.78c-39.944 0-72.31 39.03-72.31 87.188h144.624c0-48.16-32.368-87.187-72.313-87.187z"
          ></path>
        </svg>
      </MenuItem>
      <MenuItem v-if="userStore.user" to="/materials">
        <svg
          viewBox="0 0 512 512"
          xmlns="http://www.w3.org/2000/svg"
          fill="#000000"
          stroke-width="0px"
        >
          <path
            d="M303.2 19.338l-161.966 93.51 93.512 161.966 161.967-93.51-4.674-8.093-4.874-8.44-4.127-7.54-.188.07-79.65-137.962zm-20.62 33.486l-50.27 90.14c-19.184-7.687-37.887-17.28-56.165-28.69l106.435-61.45zm19.914 2.664l63.235 109.528c-40.568 2.1-78.993-3.29-115.658-15.536l52.422-93.992zm-251.61 25.68L23.032 167.99l74.302 51.123 27.854-86.822-5.723-3.936-68.578-47.186zm10.118 29.646l32.295 22.22-44.233 14.99 11.938-37.21zm385.836 22.33l-46.143 17.418 9.06 16.557 20.165-7.614 2.992 43.463-39.94 15.077-.878-12.748-18.016 10.4 1.977 28.71 76.457-28.865-5.674-82.402zm-270.55 3.045c31.896 18.617 65.316 32.12 100.267 39.964l-39.52 65.25L176.29 136.19zm-76.604 14.414l-12.467 38.863-33.73-23.207 46.197-15.656zm196.437 29.318c19.028 3.07 38.496 4.478 58.403 4.158l-93.675 54.084 35.273-58.242zM21.187 224.744l1.96 14.336 21.672 158.522 167.026 49.484-1.994-14.59-23.522-12.463L79.99 388.53l59.563-26.098 34.398-54.528 6.943 50.77 16.082-20.33-8.766-64.114-167.024-49.486zm22.435 26.14l121.497 35.997-38.314 60.733-66 28.92-17.182-125.65zm313.064 5.206l-88.914 23.824-1.916 2.395-89.266 111.594 197.365 102.963 118.662-187.66-135.93-53.117zm-13.6 22.988l31.3 55.317-86.09 22.673 2.505-63.978 52.284-14.012zm21.582.193l88.18 34.46-59.778 15.743-28.402-50.202zm-93.035 25.734l-2.232 57.04-54.978 14.48 57.21-71.52zm184.313 27.234l-73.545 116.31 13.94-100.61 59.605-15.7zm-79.185 20.856L362.762 454.11l-67.342-79.594 81.338-21.422zM275.402 379.79l67.532 79.817-124.325-64.86 56.792-14.958z"
          ></path>
        </svg>
      </MenuItem>
      <MenuItem v-if="userStore.user" to="/products">
        <svg
          fill="#000000"
          version="1.1"
          id="Capa_1"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          viewBox="0 0 59.508 59.508"
          xml:space="preserve"
        >
          <path
            d="M11.417,30.753c1.015,0,2.019-0.142,2.994-0.404l5.614,5.614L9.334,46.654c-0.188,0.188-0.293,0.442-0.293,0.707 s0.105,0.521,0.293,0.707l6.625,6.624c0.195,0.195,0.451,0.293,0.707,0.293c0.256,0,0.512-0.098,0.707-0.293L28.063,44 l10.153,10.151c0.188,0.188,0.441,0.293,0.707,0.293c0.265,0,0.52-0.104,0.707-0.293l6.624-6.625c0.391-0.391,0.391-1.022,0-1.414 L36.103,35.963l8.187-8.187c0.392-0.391,0.392-1.023,0-1.414l-0.955-0.955l3.033-3.032l4.809,4.807 c0.194,0.195,0.45,0.293,0.707,0.293c0.256,0,0.512-0.098,0.707-0.293l6.625-6.624c0.188-0.188,0.293-0.442,0.293-0.707 s-0.105-0.52-0.293-0.707L44.885,4.815c-0.267-0.266-0.661-0.359-1.02-0.243L38.88,6.21c-0.303,0.099-0.539,0.336-0.639,0.638 l-1.638,4.986c-0.118,0.358-0.023,0.752,0.243,1.019l4.808,4.808l-3.032,3.032l-0.955-0.955c-0.375-0.375-1.038-0.375-1.413,0 l-8.188,8.187l-5.629-5.629c1.067-3.954-0.006-8.135-2.92-11.049C17.359,9.089,14.489,7.9,11.436,7.9 c-1.12,0-2.23,0.163-3.3,0.484C7.799,8.485,7.54,8.756,7.454,9.097C7.368,9.438,7.468,9.8,7.717,10.048l3.044,3.045l1.285,4.209 l-2.639,2.639l-4.212-1.284L2.15,15.613c-0.249-0.249-0.611-0.348-0.951-0.263c-0.341,0.086-0.612,0.345-0.713,0.682 c-1.214,4.041-0.117,8.402,2.862,11.381C5.501,29.567,8.367,30.753,11.417,30.753z M39.982,7.952l3.921-1.289L57.092,19.85 l-5.21,5.21L38.693,11.873L39.982,7.952z M34.688,37.376l9.444,9.444l-5.21,5.21l-9.445-9.443l2.403-2.402L34.688,37.376z M43.066,19.074l1.886,1.886l-3.032,3.032l-1.887-1.886L43.066,19.074z M36.957,21.859l0.955,0.955l3.301,3.3l0.954,0.955 L30.41,38.826l-3.054,3.055c0,0,0,0,0,0.001l-10.69,10.689l-5.21-5.21l10.691-10.69l6.625-6.624c0,0,0-0.001,0.001-0.001 L36.957,21.859z M21.439,34.549l-4.964-4.966c0.311-0.15,0.611-0.318,0.904-0.496c0.067-0.041,0.131-0.087,0.198-0.129 c0.272-0.173,0.536-0.358,0.792-0.554c0.086-0.066,0.172-0.131,0.256-0.2c0.306-0.249,0.605-0.508,0.888-0.791 c0.282-0.282,0.542-0.581,0.791-0.888c0.068-0.084,0.134-0.171,0.2-0.257c0.196-0.256,0.38-0.52,0.553-0.792 c0.042-0.067,0.089-0.131,0.13-0.199c0.178-0.293,0.346-0.594,0.497-0.904l4.965,4.965L21.439,34.549z M2.051,18.343l1.906,1.905 c0.116,0.116,0.258,0.202,0.415,0.25l5.022,1.533c0.354,0.107,0.738,0.012,0.999-0.25l3.489-3.489 c0.261-0.261,0.357-0.646,0.25-0.999l-1.533-5.021c-0.048-0.157-0.134-0.299-0.25-0.415l-1.904-1.905 c2.82-0.294,5.641,0.695,7.655,2.709c2.529,2.529,3.401,6.218,2.277,9.628c-0.468,1.418-1.234,2.667-2.277,3.71 c-0.261,0.261-0.534,0.504-0.82,0.73c-0.857,0.677-1.826,1.196-2.89,1.547l0,0c-0.96,0.316-1.959,0.476-2.972,0.476 c-2.516,0-4.879-0.979-6.656-2.754C2.726,23.963,1.756,21.145,2.051,18.343z"
          ></path>
          <path
            d="M15.296,49.227c-0.391,0.391-0.391,1.022,0,1.414c0.195,0.194,0.451,0.293,0.707,0.293c0.256,0,0.512-0.099,0.707-0.293 l13.877-13.877c0.391-0.392,0.391-1.023,0-1.414c-0.391-0.392-1.023-0.392-1.414,0L15.296,49.227z"
          ></path>
        </svg>
      </MenuItem>
      <MenuItem v-if="userStore.user" to="/dashboard/">
        <svg viewBox="0 0 24 24" fill="#000" xmlns="http://www.w3.org/2000/svg" class="nofill">
          <path
            d="M18 3.00001V3.00001C19.6569 3.00001 21 4.34315 21 6.00001L21 8.14286C21 8.47698 21 8.64405 20.9234 8.76602C20.8834 8.82962 20.8296 8.8834 20.766 8.92336C20.644 9 20.477 9 20.1429 9L15 9M18 3.00001V3.00001C16.3431 3.00001 15 4.34315 15 6.00001L15 9M18 3.00001L7 3.00001C5.11438 3.00001 4.17157 3.00001 3.58579 3.58579C3 4.17158 3 5.11439 3 7.00001L3 21L6 20L9 21L12 20L15 21L15 9"
            stroke="#000"
            fill="transparent"
          ></path>
          <path d="M7 7L11 7" fill="#00" stroke-linecap="round"></path>
          <path d="M8 11H7" fill="#000" stroke-linecap="round"></path>
          <path d="M7 15L10 15" fill="#000" stroke-linecap="round"></path>
        </svg>
      </MenuItem>
    </div>
  </nav>
  <main class="main">
    <div class="container">
      <RouterView />
    </div>
  </main>
</template>

<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Marmelad&family=Ruslan+Display&display=swap');

:root {
  --main-color: #c8b08f;
  --accent-color: #d4af37;
  --bg-color: #f0e6d2;
  --text-color: #4a3c31;

  --border: 1px solid #8c7a64;

  --button-color: #8c7a64;
  --hover-color: #a08f77;

  --columns-x-large: 4;
  --columns-large: 3;
  --columns-medium: 2;
  --columns-small: 1;
  --gap: 10px;
}
body,
html {
  background-color: var(--bg-color); /* тот же цвет, что и у сайдбара */
}
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  font-family: 'Marmelad', sans-serif;
  font-weight: 400;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  display: flex;
  flex-direction: row;
  text-align: start;
  font-size: 16px;
  background: var(--bg-color);
  color: var(--text-color);
}
button {
  font-family: 'Marmelad', sans-serif;
  font-weight: 400;
  font-style: normal;
}
h1,
h2 {
  font-family: 'Ruslan Display', sans-serif;
  font-weight: 400;
  font-style: normal;
}
.main {
  background: var(--bg-color);
  width: 100%;
}
.container {
  // width: clamp(320px, 100%, 1440px);
  margin: 0 auto;
  padding: 0 14px;
  box-sizing: border-box;
}

nav {
  width: 100%;
  max-width: 80px;
  height: 100dvh;
  padding-inline: 10px;
  display: flex;
  flex-direction: column;
  justify-content: start;
  gap: 25px;
  @media (max-width: 991.98px) {
    position: fixed;
    bottom: 0;
    flex: none;
    flex-direction: row;
    justify-content: center;
    gap: 0;
    max-width: 100%;
    height: auto;
    background: var(--bg-color);
    border-top: 1px solid var(--text-color);
    padding-block: 10px;
    z-index: 111;
  }
  .logo {
    padding-block: 20px;
    @media (max-width: 991.98px) {
      padding-block: 10px;
    }
    img {
      width: 100%;
      max-width: 100%;
      height: auto;
      @media (max-width: 991.98px) {
        display: none;
      }
    }
  }
  .links {
    display: flex;
    flex-direction: column;
    gap: 15px;
    @media (max-width: 991.98px) {
      flex-direction: row;
      margin-inline: auto;
    }
    a.menu-item {
      position: relative;
      display: flex;
      align-self: center;
      &.notification-dot {
        &::after {
          content: '';
          position: absolute;
          top: 0px;
          left: 0px;
          width: 8px;
          height: 8px;
          background-color: #dc3545;
          border-radius: 50%;
          animation: blink 1s infinite;
        }
      }

      &.router-link-exact-active {
        svg.nofill {
          path {
            stroke: var(--accent-color);
            fill: transparent;
          }
        }
        svg {
          path {
            fill: var(--accent-color);
          }
        }
      }
    }
    svg {
      width: 46px;
      fill: var(--text-color);
      stroke: transparent;
      transition: stroke 0.3s ease;
      @media (max-width: 991.98px) {
        width: 44px;
      }
      &:hover {
        stroke: var(--accent-color);
      }
    }
  }
  a {
    font-weight: bold;
    color: #7da0c4;
    &.router-link-exact-active {
      color: #42b983;
    }
  }
}

ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

input {
  padding: 10px;
  border: 1px solid #8c7a64;
  border-radius: 5px;
  background-color: #e8dcc7;
  color: #4a3c31;
}

select {
  padding: 10px;
  font-size: 16px;
  border: var(--border);
  border-radius: 5px;
  background-color: #f0e6d2;
  color: #4a3c31;
}

button {
  width: 100%;
  padding: 10px 0;
  margin: 0;
  font-size: 1rem;
  color: #ffffff;
  background-color: var(--button-color);
  border: var(--border);
  border-radius: 5px;
  cursor: pointer;
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  &:hover {
    background-color: var(--hover-color);
    box-shadow: 0 0 10px var(--accent-color);
  }
}

@keyframes blink {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}
</style>
