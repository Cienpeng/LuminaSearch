<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue'
import { loadConfig, saveConfig } from '../shared/storage'
import { engineLabels, engineIcons, defaultEngineConfig } from '../shared/defaults'
import type { AppConfig, EngineName, EngineConfig, LayoutMode, DarkModeSetting } from '../shared/types'
import ToggleCard from './components/ToggleCard.vue'
import LayoutPicker from './components/LayoutPicker.vue'
import EyeProtectCard from './components/EyeProtectCard.vue'

function getIconUrl(key: EngineName): string {
  return chrome.runtime.getURL(engineIcons[key])
}

const config = reactive<AppConfig>({
  global: { darkMode: 'auto' },
  engines: {
    baidu: { ...defaultEngineConfig },
    google: { ...defaultEngineConfig },
    bing: { ...defaultEngineConfig },
  },
})

const activeEngine = ref<EngineName>('baidu')
const loaded = ref(false)

const engines: { key: EngineName; label: string }[] = [
  { key: 'baidu', label: engineLabels.baidu },
  { key: 'google', label: engineLabels.google },
  { key: 'bing', label: engineLabels.bing },
]

onMounted(async () => {
  Object.assign(config, await loadConfig())
  loaded.value = true
  detectEngine()
})

async function detectEngine() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (!tab.url) return
    const url = tab.url.toLowerCase()
    if (url.includes('bing.com')) activeEngine.value = 'bing'
    else if (url.includes('baidu.com')) activeEngine.value = 'baidu'
    else if (url.includes('google.com')) activeEngine.value = 'google'
  } catch {
    // silent — keep default
  }
}

watch(
  config,
  () => {
    if (loaded.value) {
      saveConfig(JSON.parse(JSON.stringify(config)))
    }
  },
  { deep: true, immediate: false },
)

const currentEngine = reactive({
  get config(): EngineConfig {
    return config.engines[activeEngine.value]
  },
})
</script>

<template>
  <div class="app-shell">
    <!-- Header -->
    <header class="app-header">
      <div class="header-left">
        <div class="logo">S</div>
        <div>
          <h1 class="app-title">SearchBeauti</h1>
          <p class="app-subtitle">Search Results Enhancement</p>
        </div>
      </div>
    </header>

    <div class="content">
      <!-- Global Settings -->
      <section class="section">
        <p class="section-title">Global Settings</p>
        <div class="card">
          <div class="setting-row">
            <div class="setting-info">
              <p class="setting-label">Dark Mode</p>
              <p class="setting-desc">Follow system or force on/off</p>
            </div>
            <el-select v-model="config.global.darkMode" size="small" class="dark-select" popper-class="select-popper">
              <el-option label="Auto" value="auto" />
              <el-option label="On" value="on" />
              <el-option label="Off" value="off" />
            </el-select>
          </div>
        </div>
      </section>

      <!-- Engine Settings -->
      <section class="section">
        <p class="section-title">Engine Settings</p>

        <!-- Engine Tabs -->
        <div class="engine-tabs">
          <button
            v-for="engine in engines"
            :key="engine.key"
            @click="activeEngine = engine.key"
            class="engine-tab"
            :class="{ active: activeEngine === engine.key }"
          >
            <img :src="getIconUrl(engine.key)" class="engine-icon" alt="" />{{ engine.label }}
          </button>
        </div>

        <!-- Current Engine Config -->
        <div class="settings-list">
          <ToggleCard
            label="Enable on {{ engineLabels[activeEngine] }}"
            description="Apply enhancements to this search engine"
            v-model="currentEngine.config.enabled"
          />

          <LayoutPicker v-model="currentEngine.config.layout" />

          <ToggleCard
            label="Favicon"
            description="Show website icons next to results"
            v-model="currentEngine.config.favicon"
          />

          <ToggleCard
            label="Auto Pagination"
            description="Auto-load next page on scroll"
            v-model="currentEngine.config.autoPagination"
          />

          <EyeProtectCard
            v-model:enabled="currentEngine.config.eyeProtection.enabled"
            v-model:color="currentEngine.config.eyeProtection.color"
            v-model:opacity="currentEngine.config.eyeProtection.opacity"
          />

          <ToggleCard
            label="Hide Sidebar"
            description="Remove the sidebar panel on results pages"
            v-model="currentEngine.config.hideSidebar"
          />
        </div>
      </section>
    </div>

    <!-- Footer -->
    <footer class="app-footer">
      <p>SearchBeauti v1.0 · Chrome Extension</p>
    </footer>
  </div>
</template>

<style scoped>
.app-shell {
  width: 380px;
  background: #f8f9fb;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  color: #1e293b;
  user-select: none;
  border-radius: 12px;
  overflow: hidden;
}

/* Header */
.app-header {
  background: #fff;
  border-bottom: 1px solid #eef1f5;
  padding: 14px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.logo {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: #5c7cfa;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.app-title {
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
  line-height: 1.1;
  margin: 0;
}
.app-subtitle {
  font-size: 10px;
  color: #94a3b8;
  margin: 1px 0 0;
}

/* Content */
.content {
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Section */
.section-title {
  font-size: 11px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 8px;
}

/* Card */
.card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  border: 1px solid #eef1f5;
  padding: 14px 16px;
}

/* Setting row */
.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.setting-info {
  flex: 1;
  min-width: 0;
}
.setting-label {
  font-size: 13px;
  font-weight: 500;
  color: #334155;
  margin: 0;
}
.setting-desc {
  font-size: 11px;
  color: #94a3b8;
  margin: 2px 0 0;
}

/* Dark mode select */
.dark-select {
  width: 110px;
}

/* Engine Tabs */
.engine-tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 10px;
}
.engine-tab {
  flex: 1;
  padding: 7px 0;
  font-size: 12px;
  font-weight: 500;
  border-radius: 8px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
  background: transparent;
  color: #94a3b8;
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}
.engine-tab:hover {
  color: #64748b;
  background: rgba(255, 255, 255, 0.6);
}
.engine-tab.active {
  background: #eef2ff;
  color: #4f46e5;
  border-color: #c7d2fe;
  box-shadow: 0 0 0 1px rgba(79, 70, 229, 0.15), 0 1px 3px rgba(79, 70, 229, 0.12);
  font-weight: 600;
}
.engine-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}
.tab-icon {
  margin-right: 4px;
}

/* Settings list */
.settings-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* Footer */
.app-footer {
  padding: 10px 16px;
  border-top: 1px solid #eef1f5;
  text-align: center;
}
.app-footer p {
  font-size: 10px;
  color: #c0c8d4;
  margin: 0;
}
</style>

<style>
/* Global overrides (not scoped so they affect el-select etc.) */
body {
  margin: 0;
  background: #f8f9fb;
}

/* Select overrides */
.dark-select .el-input__wrapper {
  border-radius: 8px;
  box-shadow: 0 0 0 1px #e5e7eb inset !important;
  background: #f9fafb;
  transition: all 0.2s;
  padding: 0 10px;
}
.dark-select .el-input__wrapper:hover {
  box-shadow: 0 0 0 1px #bac8ff inset !important;
  background: #fff;
}
.dark-select .el-input.is-focus .el-input__wrapper {
  box-shadow: 0 0 0 1px #5c7cfa inset !important;
  background: #fff;
}
.dark-select .el-input__inner {
  font-size: 13px;
}

.select-popper {
  border-radius: 10px !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06) !important;
  border: 1px solid #f3f4f6 !important;
  padding: 4px !important;
}
.select-popper .el-select-dropdown__item {
  border-radius: 6px;
  font-size: 13px;
  padding: 6px 12px;
}

/* Scrollbar */
::-webkit-scrollbar {
  width: 4px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 4px;
}
</style>
