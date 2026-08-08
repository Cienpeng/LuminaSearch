<script setup lang="ts">
import { computed } from 'vue'

const model = defineModel<number>({ required: true })

const props = defineProps<{
  label: string
  description?: string
  min: number
  max: number
  step: number
  unit?: string
}>()

const safeValue = computed(() => {
  if (!Number.isFinite(model.value)) return props.min
  return Math.max(props.min, Math.min(props.max, model.value))
})

const rangeStyle = computed(() => {
  const progress = ((safeValue.value - props.min) / (props.max - props.min)) * 100
  return {
    background: `linear-gradient(to right, #F8C387 0%, #F8C387 ${progress}%, #eef1f5 ${progress}%, #eef1f5 100%)`,
  }
})

const displayValue = computed(() => `${safeValue.value}${props.unit || ''}`)
</script>

<template>
  <div class="range-card">
    <div class="range-info">
      <span class="range-label">{{ label }}</span>
      <p v-if="description" class="range-desc">{{ description }}</p>
    </div>
    <div class="range-control">
      <input
        v-model.number="model"
        type="range"
        class="native-range"
        :min="min"
        :max="max"
        :step="step"
        :aria-label="label"
        :style="rangeStyle"
      />
      <output class="range-value">{{ displayValue }}</output>
    </div>
  </div>
</template>

<style scoped>
.range-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  border: 1px solid #eef1f5;
  padding: 14px 16px;
}
.range-info {
  flex: 1;
  min-width: 0;
}
.range-label {
  font-size: 13px;
  font-weight: 500;
  color: #334155;
}
.range-desc {
  font-size: 11px;
  color: #94a3b8;
  margin: 2px 0 0;
}
.range-control {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 150px;
  flex-shrink: 0;
}
.native-range {
  flex: 1;
  min-width: 0;
  height: 4px;
  margin: 0;
  appearance: none;
  border-radius: 2px;
  cursor: pointer;
}
.native-range:focus-visible {
  outline: 2px solid rgba(217, 119, 6, 0.55);
  outline-offset: 4px;
}
.native-range::-webkit-slider-thumb {
  width: 14px;
  height: 14px;
  appearance: none;
  border: 2px solid #f8c387;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 3px rgba(248, 195, 135, 0.4);
}
.native-range::-moz-range-thumb {
  width: 10px;
  height: 10px;
  border: 2px solid #f8c387;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 3px rgba(248, 195, 135, 0.4);
}
.range-value {
  width: 34px;
  color: #94a3b8;
  font-size: 11px;
  text-align: right;
  flex-shrink: 0;
}
</style>
