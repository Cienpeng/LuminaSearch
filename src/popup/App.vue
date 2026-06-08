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

const logoUrl = chrome.runtime.getURL('icons/logo.svg')

const config = reactive<AppConfig>({
  global: { lang: 'en' },
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
    title: 'LuminaSearch',
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
    footer: 'LuminaSearch v1.0 · ',
  },
  en: {
    title: 'LuminaSearch',
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
    footer: 'LuminaSearch v1.0 · ',
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
        <img :src="logoUrl" class="logo-img" alt="LuminaSearch" />
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
      <p>
        <span>{{ t('footer') }}</span>
        <a href="https://github.com/Cienpeng/LuminaSearch" target="_blank" class="github-link" title="GitHub Repository">
          <svg viewBox="0 0 24 24" width="14" height="14" class="github-icon">
            <path fill="currentColor" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.164 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
          </svg>
        </a>
      </p>
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
.logo-img {
  width: 28px;
  height: 28px;
  border-radius: 8px;
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
  background: #FEF3E2;
  border-color: #F8C387;
  color: #D97706;
}
.lang-btn:active {
  background: #FDE4C3;
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
  background: #FEF3E2;
  color: #D97706;
  border-color: #F8C387;
  box-shadow: 0 0 0 1px rgba(248, 195, 135, 0.2), 0 1px 3px rgba(248, 195, 135, 0.15);
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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}
.github-link {
  color: #c0c8d4;
  display: inline-flex;
  align-items: center;
  transition: color 0.2s;
}
.github-link:hover {
  color: #F8C387;
}
.github-icon {
  vertical-align: middle;
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
