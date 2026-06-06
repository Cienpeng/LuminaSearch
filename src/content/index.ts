import type { AppConfig, EngineAdapter, Feature } from '../shared/types'
import { loadConfig, onConfigChanged } from '../shared/storage'
import { bingAdapter } from './engines/bing'
import { baiduAdapter } from './engines/baidu'
import { googleAdapter } from './engines/google'
import { darkModeFeature } from './features/dark-mode'
import { eyeProtectFeature } from './features/eye-protect'
import { faviconFeature } from './features/favicon'
import { paginationFeature, setOnResultsAdded } from './features/pagination'
import { hideSidebarFeature } from './features/hide-sidebar'
import { layoutFeature } from './features/layout'

const adapters: EngineAdapter[] = [bingAdapter, baiduAdapter, googleAdapter]
const features: Feature[] = [
  darkModeFeature,
  eyeProtectFeature,
  faviconFeature,
  paginationFeature,
  hideSidebarFeature,
  layoutFeature,
]

let activeFeatures: Feature[] = []
let currentConfig: AppConfig | null = null
let currentAdapter: EngineAdapter | null = null

function matchAdapter(): EngineAdapter | null {
  return adapters.find((a) => a.match(location.href)) ?? null
}

function getEngineConfig(config: AppConfig, adapter: EngineAdapter) {
  return config.engines[adapter.name]
}

async function initFeatures(config: AppConfig, adapter: EngineAdapter) {
  const ec = getEngineConfig(config, adapter)
  if (!ec.enabled) return

  for (const feature of features) {
    const res = feature.init?.(config, adapter)
    if (res instanceof Promise) await res
    activeFeatures.push(feature)
  }
}

function destroyFeatures() {
  for (const f of activeFeatures) {
    f.destroy?.()
  }
  activeFeatures = []
}

async function main() {
  const adapter = matchAdapter()
  if (!adapter || !adapter.isSearchPage(location.href)) return

  currentAdapter = adapter

  // Wire pagination → favicon callback for dynamically loaded results
  setOnResultsAdded((newItems: HTMLElement[]) => {
    if (!currentConfig) return
    if (getEngineConfig(currentConfig, adapter).favicon) {
      faviconFeature.processResults?.(newItems, adapter)
    }
  })

  const config = await loadConfig()
  currentConfig = config

  await initFeatures(config, adapter)

  // Listen for config changes from popup
  onConfigChanged((newConfig: AppConfig) => {
    currentConfig = newConfig
    for (const f of features) {
      f.onConfigChange?.(newConfig)
    }

    // Handle engine enable/disable
    const wasEnabled = getEngineConfig(config, adapter).enabled
    const nowEnabled = getEngineConfig(newConfig, adapter).enabled
    if (!wasEnabled && nowEnabled) {
      initFeatures(newConfig, adapter)
    } else if (wasEnabled && !nowEnabled) {
      destroyFeatures()
    }
  })
}

// Run after DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main)
} else {
  main()
}
