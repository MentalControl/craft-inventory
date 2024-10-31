<script setup>
import PageHeader from '@/components/pages/PageHeader.vue'
import SettingsManager from '@/components/Dashboard/SettingsManager.vue'

const TITLE = 'Мастерская порядка'
</script>
<template>
  <PageHeader :title="TITLE" />
  <div class="dashboard">Управление</div>
  <SettingsManager />
</template>

<style lang="scss" scoped></style>
