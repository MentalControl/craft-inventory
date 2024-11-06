<script setup>
import { ref } from 'vue'

const notifications = ref([])
const maxNotifications = 3

const addNotification = (message) => {
  if (!message) return

  const id = Date.now() + Math.random()
  notifications.value.push({ id, message })

  if (notifications.value.length > maxNotifications) {
    notifications.value.shift()
  }

  setTimeout(() => {
    const index = notifications.value.findIndex((n) => n.id === id)
    if (index !== -1) {
      notifications.value.splice(index, 1)
    }
  }, 3000)
}

// Экспортируем метод для использования в родительском компоненте
defineExpose({ addNotification })
</script>

<template>
  <div class="notifications-container">
    <TransitionGroup name="notification-list">
      <div
        v-for="(notification, index) in notifications"
        :key="notification.id"
        class="notification"
        :style="{ bottom: `${20 + index * 70}px` }"
      >
        {{ notification.message }}
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.notifications-container {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 1000;
  pointer-events: none; /* Позволяет кликать сквозь контейнер уведомлений */
  overflow: visible; /* Позволяет уведомлениям выходить за пределы контейнера */
}

.notification {
  background-color: #ff4d4f;
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  min-width: 200px;
  transition: all 0.3s ease;
  margin-top: 10px;
}

.notification-list-enter-active,
.notification-list-leave-active {
  transition: all 0.3s ease;
}

.notification-list-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-list-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
