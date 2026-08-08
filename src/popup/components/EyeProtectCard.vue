<script setup lang="ts">
import { computed } from 'vue'
import NativeSwitch from './NativeSwitch.vue'

const enabled = defineModel<boolean>('enabled', { required: true })
const color = defineModel<string>('color', { required: true })
const opacity = defineModel<number>('opacity', { required: true })

defineProps<{
  label: string
  description?: string
  opacityLabel?: string
  colorAlphaLabel?: string
}>()

const presetColors = ['#c8e6c9', '#fff9c4', '#f8bbd0', '#bbdefb', '#e1bee7', '#d7ccc8']

const colorInputValue = computed(() => toHexColor(color.value))
const colorAlpha = computed({
  get: () => getAlpha(color.value) ?? 1,
  set: (value: number) => {
    const alpha = Math.max(0, Math.min(1, value))
    const hex = toHexColor(color.value)
    color.value = alpha >= 1 ? hex : hexToRgba(hex, alpha)
  },
})
const opacityRangeStyle = computed(() => {
  const progress = Math.max(0, Math.min(100, Math.round(((opacity.value - 0.05) / 0.35) * 100)))
  return {
    background: `linear-gradient(to right, #F8C387 0%, #F8C387 ${progress}%, #eef1f5 ${progress}%, #eef1f5 100%)`,
  }
})
const colorAlphaRangeStyle = computed(() => {
  const progress = Math.round(colorAlpha.value * 100)
  return {
    background: `linear-gradient(to right, #F8C387 0%, #F8C387 ${progress}%, #eef1f5 ${progress}%, #eef1f5 100%)`,
  }
})

function updateColor(event: Event) {
  const nextColor = (event.target as HTMLInputElement).value
  const alpha = getAlpha(color.value)
  color.value = alpha === null ? nextColor : hexToRgba(nextColor, alpha)
}

function toHexColor(value: string): string {
  const hex = value.match(/^#([\da-f]{3,8})$/i)?.[1]
  if (hex) {
    if (hex.length === 3 || hex.length === 4) {
      return `#${hex.slice(0, 3).split('').map((part) => part + part).join('')}`
    }
    return `#${hex.slice(0, 6)}`
  }

  const rgb = value.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/i)
  if (rgb) {
    return `#${[rgb[1], rgb[2], rgb[3]]
      .map((part) => Math.max(0, Math.min(255, Math.round(Number(part)))))
      .map((part) => part.toString(16).padStart(2, '0'))
      .join('')}`
  }

  return '#c8e6c9'
}

function getAlpha(value: string): number | null {
  const rgba = value.match(/^rgba\(\s*[\d.]+[,\s]+[\d.]+[,\s]+[\d.]+[,\s]+([\d.]+)\s*\)$/i)
  if (rgba) return Math.max(0, Math.min(1, Number(rgba[1])))

  const hex = value.match(/^#([\da-f]{8})$/i)?.[1]
  return hex ? Number.parseInt(hex.slice(6), 16) / 255 : null
}

function hexToRgba(hex: string, alpha: number): string {
  const value = hex.slice(1)
  const red = Number.parseInt(value.slice(0, 2), 16)
  const green = Number.parseInt(value.slice(2, 4), 16)
  const blue = Number.parseInt(value.slice(4, 6), 16)
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`
}
</script>

<template>
  <div class="eye-card" :class="{ disabled: !enabled }">
    <div class="eye-header">
      <div class="eye-info">
        <span class="eye-label">{{ label }}</span>
        <p v-if="description" class="eye-desc">{{ description }}</p>
      </div>
      <NativeSwitch v-model="enabled" :label="label" />
    </div>

    <div v-if="enabled" class="eye-body">
      <div class="color-row">
        <input
          :value="colorInputValue"
          type="color"
          class="native-color"
          :aria-label="label"
          @input="updateColor"
        />
        <div class="color-presets">
          <button
            v-for="c in presetColors"
            :key="c"
            type="button"
            @click="color = c"
            :aria-label="c"
            class="preset-dot"
            :class="{ active: color === c }"
            :style="{ backgroundColor: c }"
          />
        </div>
      </div>
      <div class="color-alpha-row">
        <span class="opacity-label">{{ colorAlphaLabel || 'Color alpha' }}</span>
        <input
          v-model.number="colorAlpha"
          type="range"
          class="opacity-slider native-range"
          min="0"
          max="1"
          step="0.05"
          :aria-label="colorAlphaLabel || 'Color alpha'"
          :style="colorAlphaRangeStyle"
        />
        <span class="opacity-value">{{ Math.round(colorAlpha * 100) }}%</span>
      </div>
      <div class="opacity-row">
        <span class="opacity-label">{{ opacityLabel || 'Opacity' }}</span>
        <input
          v-model.number="opacity"
          type="range"
          class="opacity-slider native-range"
          min="0.05"
          max="0.4"
          step="0.05"
          :aria-label="opacityLabel || 'Opacity'"
          :style="opacityRangeStyle"
        />
        <span class="opacity-value">{{ Math.round(opacity * 100) }}%</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.eye-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  border: 1px solid #eef1f5;
  padding: 14px 16px;
  transition: all 0.2s;
}
.eye-card.disabled {
  opacity: 0.55;
}
.eye-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.eye-info {
  flex: 1;
  min-width: 0;
}
.eye-label {
  font-size: 13px;
  font-weight: 500;
  color: #334155;
}
.eye-desc {
  font-size: 11px;
  color: #94a3b8;
  margin: 2px 0 0;
}

.eye-body {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f1f5f9;
}
.color-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.native-color {
  width: 32px;
  height: 28px;
  padding: 2px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
}
.native-color:focus-visible {
  outline: 2px solid rgba(217, 119, 6, 0.55);
  outline-offset: 2px;
}
.native-color::-webkit-color-swatch-wrapper {
  padding: 0;
}
.native-color::-webkit-color-swatch {
  border: 0;
  border-radius: 5px;
}
.color-presets {
  display: flex;
  gap: 6px;
}
.preset-dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid #e5e7eb;
  cursor: pointer;
  transition: all 0.15s;
  padding: 0;
  flex-shrink: 0;
}
.preset-dot:hover {
  transform: scale(1.12);
}
.preset-dot.active {
  border-color: #F8C387;
  transform: scale(1.12);
}

.opacity-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
}
.color-alpha-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
}
.opacity-label {
  font-size: 11px;
  color: #94a3b8;
  width: 50px;
  flex-shrink: 0;
}
.opacity-slider {
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
.opacity-value {
  font-size: 11px;
  color: #94a3b8;
  width: 32px;
  text-align: right;
  flex-shrink: 0;
}
</style>
