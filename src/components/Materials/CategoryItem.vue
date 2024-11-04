<template>
  <div class="accordion-item">
    <div class="accordion-header" @click="$emit('toggleCategory', category)">
      <div class="accordion-title">
        <h3>{{ category }}</h3>
        <span>{{ materials.length }}</span>
      </div>
      <select @change="$emit('changeMaterialSort', $event)" @click.stop>
        <option selected disabled>Сортировка крупиц!</option>
        <option value="quantity-asc">От мелких кусков к целым залежам!</option>
        <option value="quantity-desc">От величественных гор к крупицам!</option>
      </select>
      <!-- <span class="accordion-icon" :class="{ opened: isOpen }"> 🠟 </span> -->
    </div>
    <transition name="accordion">
      <div v-if="isOpen" class="accordion-content">
        <MaterialsList
          :materials="materials"
          :unitOptions="unitOptions"
          @remove="$emit('removeMaterial', $event)"
        />
      </div>
    </transition>
  </div>
</template>

<script setup>
import MaterialsList from './MaterialsList.vue'

defineProps({
  category: {
    type: String,
    required: true
  },
  materials: {
    type: Array,
    required: true
  },
  isOpen: {
    type: Boolean,
    required: true
  },
  unitOptions: {
    type: Array,
    required: true
  }
})

defineEmits(['toggleCategory', 'changeMaterialSort', 'removeMaterial'])
</script>

<style lang="scss">
.accordion {
  &-title {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    h3 {
      font-size: 1.35rem;
      font-weight: 600;
      color: var(--text-color);
    }
    span {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-color);
      font-size: 1rem;
      font-weight: bold;
      color: var(--text-color);
      border-radius: 1rem;
      border: 1px solid var(--text-color);
    }
  }
  &-content {
    padding: 16px 10px;
  }
}
</style>
