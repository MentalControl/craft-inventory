<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  buttonText: {
    type: String,
    default: 'Добавить новый материал'
  }
})
</script>

<template>
  <header class="content-title">
    <div class="top-header">
      <h1>{{ title }}</h1>
      <button @click="$emit('openDialog')">{{ buttonText }}</button>
    </div>
    <p>{{ description }}</p>
  </header>
</template>

<style lang="scss">
.content-title {
  display: flex;
  align-items: center;
  flex-direction: column;
  flex-wrap: wrap;
  row-gap: 15px;
  padding-block: 20px;
}
.top-header {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 15px;
  @media (max-width: 400px) {
    flex-direction: column;
  }
  button {
    max-width: 250px;
  }
}
</style>
