<script setup>
import { ref } from 'vue'
import PageHeader from '@/components/pages/PageHeader.vue'

const TITLE = ref('Мастерская порядка: где всё на своих местах!')
const DESCRIPTION = ref(
  `В этом месте царит полный контроль над всеми ресурсами. Каждое действие направлено на то, чтобы склад работал как часы: новые единицы измерения, чёткие категории и тонкие настройки помогают поддерживать порядок. Здесь каждый ресурс найдёт своё место, а каждый процесс будет работать безупречно`
)
</script>
<template>
  <PageHeader :title="TITLE" :description="DESCRIPTION" />
  <div class="dashboard">Управление</div>
</template>

<style lang="scss" scoped></style>
