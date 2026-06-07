<script setup lang="ts">
const enabled = defineModel<boolean>('enabled', { required: true })
const color = defineModel<string>('color', { required: true })
const opacity = defineModel<number>('opacity', { required: true })

defineProps<{
  label: string
  description?: string
  opacityLabel?: string
}>()

const presetColors = ['#c8e6c9', '#fff9c4', '#f8bbd0', '#bbdefb', '#e1bee7', '#d7ccc8']
</script>

<template>
  <div class="eye-card" :class="{ disabled: !enabled }">
    <div class="eye-header">
      <div class="eye-info">
        <span class="eye-label">{{ label }}</span>
        <p v-if="description" class="eye-desc">{{ description }}</p>
      </div>
      <el-switch v-model="enabled" size="small" />
    </div>

    <div v-if="enabled" class="eye-body">
      <div class="color-row">
        <el-color-picker v-model="color" size="small" show-alpha />
        <div class="color-presets">
          <button
            v-for="c in presetColors"
            :key="c"
            @click="color = c"
            class="preset-dot"
            :class="{ active: color === c }"
            :style="{ backgroundColor: c }"
          />
        </div>
      </div>
      <div class="opacity-row">
        <span class="opacity-label">{{ opacityLabel || 'Opacity' }}</span>
        <el-slider v-model="opacity" :min="0.05" :max="0.4" :step="0.05" size="small" class="opacity-slider" />
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
  border-color: #0284c7;
  transform: scale(1.12);
}

.opacity-row {
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
}
.opacity-value {
  font-size: 11px;
  color: #94a3b8;
  width: 32px;
  text-align: right;
  flex-shrink: 0;
}
</style>

<style>
/* Color picker global overrides */
.eye-card .el-color-picker__trigger {
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  box-shadow: none;
}

/* Slider global overrides */
.eye-card .el-slider {
  --el-slider-main-bg-color: #0284c7;
  --el-slider-runway-bg-color: #eef1f5;
}
.eye-card .el-slider .el-slider__runway {
  height: 4px;
  border-radius: 2px;
}
.eye-card .el-slider .el-slider__bar {
  height: 4px;
  border-radius: 2px;
}
.eye-card .el-slider .el-slider__button {
  width: 14px;
  height: 14px;
  border-color: #0284c7;
  box-shadow: 0 1px 3px rgba(2, 132, 199, 0.3);
}
</style>
