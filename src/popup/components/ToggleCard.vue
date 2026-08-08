<script setup lang="ts">
import NativeSwitch from './NativeSwitch.vue'

const model = defineModel<boolean>({ required: true })

defineProps<{
  label: string
  description?: string
}>()
</script>

<template>
  <label class="toggle-card" :class="{ 'is-on': model }">
    <div class="toggle-info">
      <span class="toggle-label">{{ label }}</span>
      <p v-if="description" class="toggle-desc">{{ description }}</p>
    </div>
    <NativeSwitch v-model="model" :label="label" />
  </label>
</template>

<style scoped>
.toggle-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  border: 1px solid #eef1f5;
  padding: 14px 16px;
  cursor: pointer;
  transition: all 0.2s;
}
.toggle-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border-color: #e2e8f0;
}
.toggle-info {
  flex: 1;
  min-width: 0;
}
.toggle-label {
  font-size: 13px;
  font-weight: 500;
  color: #334155;
}
.toggle-desc {
  font-size: 11px;
  color: #94a3b8;
  margin: 2px 0 0;
}
</style>
