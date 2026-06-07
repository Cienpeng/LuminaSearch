<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue'
import { loadConfig, saveConfig } from '../shared/storage'
import { engineLabels, engineIcons, defaultEngineConfig } from '../shared/defaults'
import type { AppConfig, EngineName, EngineConfig, LayoutMode } from '../shared/types'
import ToggleCard from './components/ToggleCard.vue'
import LayoutPicker from './components/LayoutPicker.vue'
import EyeProtectCard from './components/EyeProtectCard.vue'

function getIconUrl(key: EngineName): string {
  return chrome.runtime.getURL(engineIcons[key])
}

const config = reactive<AppConfig>({
  global: { lang: 'zh' },
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

// i18n Translation Dictionary
const translations = {
  zh: {
    title: 'SearchFlow',
    subtitle: '搜索引擎结果美化与优化',
    globalSettings: '全局设置',
    engineSettings: '单引擎设置',
    langLabel: '界面语言',
    langDesc: '切换当前设置面板的显示语言',
    enableOn: '启用 {engine} 优化',
    enableOnDesc: '在此搜索引擎上应用所有美化和优化功能',
    favicon: '显示 Favicon 图标',
    faviconDesc: '在搜索结果标题旁显示对应的网站图标',
    autoPagination: '自动无缝翻页',
    autoPaginationDesc: '滚动到底部时自动加载下一页搜索结果',
    eyeProtection: '温和护眼模式',
    eyeProtectionDesc: '为整个页面添加一层舒适背景护眼色',
    eyeOpacity: '护眼深度',
    hideSidebar: '隐藏推广侧边栏',
    hideSidebarDesc: '移除右侧的侧边栏推荐面板以聚焦内容',
    footer: 'SearchFlow v1.0 · 浏览器插件',
  },
  en: {
    title: 'SearchFlow',
    subtitle: 'Search Results Enhancement',
    globalSettings: 'Global Settings',
    engineSettings: 'Engine Settings',
    langLabel: 'UI Language',
    langDesc: 'Toggle current settings panel language',
    enableOn: 'Enable on {engine}',
    enableOnDesc: 'Apply enhancements to this search engine',
    favicon: 'Show Favicon',
    faviconDesc: 'Show website icons next to result titles',
    autoPagination: 'Auto Pagination',
    autoPaginationDesc: 'Auto-load next page on scroll',
    eyeProtection: 'Eye Protection Overlay',
    eyeProtectionDesc: 'Tint page background with protective color',
    eyeOpacity: 'Opacity',
    hideSidebar: 'Hide Sidebar Column',
    hideSidebarDesc: 'Remove the sidebar panel on results pages',
    footer: 'SearchFlow v1.0 · Chrome Extension',
  },
}

function t(key: keyof typeof translations.zh, replacements?: Record<string, string>): string {
  const lang = config.global.lang === 'zh' ? 'zh' : 'en'
  let text = translations[lang][key] || translations.en[key] || ''
  if (replacements) {
    for (const [k, v] of Object.entries(replacements)) {
      text = text.replace(`{${k}}`, v)
    }
  }
  return text
}

function toggleLang() {
  config.global.lang = config.global.lang === 'zh' ? 'en' : 'zh'
}

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
          <h1 class="app-title">{{ t('title') }}</h1>
          <p class="app-subtitle">{{ t('subtitle') }}</p>
        </div>
      </div>
    </header>

    <div class="content">
      <!-- Global Settings -->
      <section class="section">
        <p class="section-title">{{ t('globalSettings') }}</p>
        <div class="card">
          <div class="setting-row">
            <div class="setting-info">
              <p class="setting-label">{{ t('langLabel') }}</p>
              <p class="setting-desc">{{ t('langDesc') }}</p>
            </div>
            <button @click="toggleLang" class="lang-btn">
              {{ config.global.lang === 'zh' ? 'English' : '简体中文' }}
            </button>
          </div>
        </div>
      </section>

      <!-- Engine Settings -->
      <section class="section">
        <p class="section-title">{{ t('engineSettings') }}</p>

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
            :label="t('enableOn', { engine: engineLabels[activeEngine] })"
            :description="t('enableOnDesc')"
            v-model="currentEngine.config.enabled"
          />

          <LayoutPicker :lang="config.global.lang" v-model="currentEngine.config.layout" />

          <ToggleCard
            :label="t('favicon')"
            :description="t('faviconDesc')"
            v-model="currentEngine.config.favicon"
          />

          <ToggleCard
            :label="t('autoPagination')"
            :description="t('autoPaginationDesc')"
            v-model="currentEngine.config.autoPagination"
          />

          <EyeProtectCard
            :label="t('eyeProtection')"
            :description="t('eyeProtectionDesc')"
            :opacityLabel="t('eyeOpacity')"
            v-model:enabled="currentEngine.config.eyeProtection.enabled"
            v-model:color="currentEngine.config.eyeProtection.color"
            v-model:opacity="currentEngine.config.eyeProtection.opacity"
          />

          <ToggleCard
            :label="t('hideSidebar')"
            :description="t('hideSidebarDesc')"
            v-model="currentEngine.config.hideSidebar"
          />
        </div>
      </section>
    </div>

    <!-- Footer -->
    <footer class="app-footer">
      <p>{{ t('footer') }}</p>
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
  background: #0284c7;
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
  gap: 10px;
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

/* Language toggle button */
.lang-btn {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: #475569;
  font-family: inherit;
  font-size: 11px;
  font-weight: 500;
  border-radius: 8px;
  padding: 6px 12px;
  height: 28px;
  transition: all 0.2s;
  cursor: pointer;
  flex-shrink: 0;
}
.lang-btn:hover {
  background: #e0f2fe;
  border-color: #bae6fd;
  color: #0369a1;
}
.lang-btn:active {
  background: #bae6fd;
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
  background: #e0f2fe;
  color: #0369a1;
  border-color: #bae6fd;
  box-shadow: 0 0 0 1px rgba(2, 132, 199, 0.15), 0 1px 3px rgba(2, 132, 199, 0.12);
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
/* Global overrides */
body {
  margin: 0;
  background: #f8f9fb;
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
