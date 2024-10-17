<script setup>
import { ref } from 'vue'
import AuthComp from '@/components/AuthComp.vue'

const title = ref('Хроники Складских Деяний')
const description = ref(
  `Добро пожаловать в наш Великий Склад! Здесь записаны все подвиги нашего братства по добыче, использованию и созданию изделий. <br> Каждый материал, добытый с трудом, и каждое изделие,выкованное в огне, хранится в этих свитках! Следите за историей материалов и изделий, да будет известно, кто сотворил славные творения!`
)
</script>

<template>
  <div class="home">
    <header class="content-title">
      <h1>{{ title }}</h1>
      <p v-html="description"></p>
    </header>
    <AuthComp />
  </div>
</template>

<style lang="scss"></style>
