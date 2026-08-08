<script setup lang="ts">
const model = defineModel<boolean>({ required: true })

defineProps<{
  label: string
}>()
</script>

<template>
  <input
    v-model="model"
    type="checkbox"
    class="native-switch"
    :aria-label="label"
  />
</template>

<style scoped>
.native-switch {
  appearance: none;
  width: 40px;
  height: 22px;
  margin: 0;
  padding: 0;
  flex-shrink: 0;
  position: relative;
  border: 1px solid #d1d5db;
  border-radius: 999px;
  background: #d1d5db;
  cursor: pointer;
  transition: background-color 0.2s, border-color 0.2s, box-shadow 0.2s;
}

.native-switch::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s;
}

.native-switch:checked {
  border-color: #f8c387;
  background: #f8c387;
}

.native-switch:checked::after {
  transform: translateX(18px);
}

.native-switch:focus-visible {
  outline: 2px solid rgba(217, 119, 6, 0.55);
  outline-offset: 2px;
}

.native-switch:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}
</style>
