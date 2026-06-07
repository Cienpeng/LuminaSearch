<script setup lang="ts">
import { computed } from 'vue'
import type { LayoutMode } from '../../shared/types'

const model = defineModel<LayoutMode>({ required: true })

const props = defineProps<{
  lang: 'zh' | 'en'
}>()

const options = computed(() => [
  { value: 'original' as const, label: props.lang === 'zh' ? '原生' : 'Original', desc: props.lang === 'zh' ? '保持原生布局' : 'No change' },
  { value: 'single' as const, label: props.lang === 'zh' ? '单栏' : 'Single', desc: props.lang === 'zh' ? '单栏卡片居中' : 'Default column' },
  { value: 'double' as const, label: props.lang === 'zh' ? '双栏' : 'Double', desc: props.lang === 'zh' ? '双栏卡片并排' : 'Two-column grid' },
])
</script>

<template>
  <div class="layout-card">
    <span class="layout-label">{{ lang === 'zh' ? '布局模式' : 'Layout Mode' }}</span>
    <div class="layout-options">
      <button
        v-for="opt in options"
        :key="opt.value"
        @click="model = opt.value"
        class="layout-option"
        :class="{ active: model === opt.value }"
      >
        <div class="layout-preview" :class="`preview-${opt.value}`">
          <div
            class="preview-bar"
            v-for="i in (opt.value === 'double' ? 2 : opt.value === 'single' ? 1 : 0)"
            :key="i"
          >
            <span class="preview-line" v-for="j in 2" :key="j" />
          </div>
        </div>
        <span class="option-label">{{ opt.label }}</span>
        <span class="option-desc">{{ opt.desc }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.layout-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  border: 1px solid #eef1f5;
  padding: 14px 16px;
}
.layout-label {
  font-size: 13px;
  font-weight: 500;
  color: #334155;
}
.layout-options {
  display: flex;
  gap: 6px;
  margin-top: 10px;
}
.layout-option {
  flex: 1;
  padding: 8px 2px;
  border-radius: 10px;
  border: 1px solid #eef1f5;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: #f9fafb;
  font-family: inherit;
}
.layout-option:hover {
  border-color: #d1d8e0;
  background: #fff;
}
.layout-option.active {
  border-color: #F8C387;
  background: #FEF3E2;
  box-shadow: 0 1px 4px rgba(248, 195, 135, 0.2);
}
.layout-option.active .option-label {
  color: #D97706;
}

/* Layout preview bars */
.layout-preview {
  display: flex;
  gap: 3px;
  justify-content: center;
  margin-bottom: 6px;
  min-height: 12px;
}
.preview-original {
  /* show a dashed circle to indicate no layout change */
}
.preview-original::before {
  content: '—';
  font-size: 10px;
  color: #c0c8d4;
  line-height: 1;
}
.preview-single .preview-bar {
  width: 100%;
}
.preview-bar {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.preview-line {
  display: block;
  height: 4px;
  border-radius: 2px;
  background: currentColor;
  opacity: 0.2;
}
.layout-option.active .preview-line {
  opacity: 0.4;
}

.option-label {
  display: block;
  font-size: 11px;
  font-weight: 500;
  color: #475569;
}
.option-desc {
  display: block;
  font-size: 9px;
  color: #94a3b8;
  margin-top: 1px;
}
</style>
