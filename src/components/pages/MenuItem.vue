<template>
  <RouterLink :to="to" class="menu-item">
    <slot></slot>
  </RouterLink>
</template>

<script setup>
defineProps({
  to: {
    type: String,
    required: true
  }
})
</script>
