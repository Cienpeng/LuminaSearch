import type { AppConfig, EngineAdapter, Feature } from '../shared/types'
import {
  CONFIG_UPDATED_MESSAGE,
  getConfigFingerprint,
  loadConfig,
  mergeConfig,
  onConfigChanged,
} from '../shared/storage'
import { defaultConfig } from '../shared/defaults'
import { bingAdapter } from './engines/bing'
import { baiduAdapter } from './engines/baidu'
import { googleAdapter } from './engines/google'
import { eyeProtectFeature } from './features/eye-protect'
import { faviconFeature } from './features/favicon'
import { paginationFeature, setOnResultsAdded } from './features/pagination'
import { hideSidebarFeature } from './features/hide-sidebar'
import { layoutFeature, updateGoogleCompactHeaderForScroll } from './features/layout'
import { fontSizeFeature } from './features/font-size'

// Synchronously inject anti-flash styles at document_start to prevent FOOC
const antiFlash = document.createElement('style')
antiFlash.id = 'luminasearch-anti-flash'
antiFlash.textContent = 'html { opacity: 0 !important; }'
document.documentElement.appendChild(antiFlash)

// Safety fallback to restore visibility if initialization hangs
setTimeout(() => {
  document.getElementById('luminasearch-anti-flash')?.remove()
}, 500)

const adapters: EngineAdapter[] = [bingAdapter, baiduAdapter, googleAdapter]
const features: Feature[] = [
  eyeProtectFeature,
  faviconFeature,
  paginationFeature,
  hideSidebarFeature,
  layoutFeature,
  fontSizeFeature,
]

let activeFeatures: Feature[] = []
let currentConfig: AppConfig | null = null
let currentAdapter: EngineAdapter | null = null
let currentConfigFingerprint = ''

let lastProcessedUrl = ''
let isInitializing = false
let debounceTimer: number | null = null

function matchAdapter(): EngineAdapter | null {
  return adapters.find((a) => a.match(location.href)) ?? null
}

function getEngineConfig(config: AppConfig, adapter: EngineAdapter) {
  return config.engines[adapter.name]
}

function applyConfig(newConfig: AppConfig) {
  const nextFingerprint = getConfigFingerprint(newConfig)
  if (nextFingerprint === currentConfigFingerprint) return

  const previousConfig = currentConfig
  currentConfig = newConfig
  currentConfigFingerprint = nextFingerprint
  if (!currentAdapter) return

  const wasEnabled = previousConfig
    ? getEngineConfig(previousConfig, currentAdapter).enabled
    : false
  const nowEnabled = getEngineConfig(newConfig, currentAdapter).enabled
  if (!wasEnabled && nowEnabled) {
    void initFeatures(newConfig, currentAdapter).catch((err) => {
      console.error('[LuminaSearch] Error enabling features:', err)
    })
  } else if (wasEnabled && !nowEnabled) {
    destroyFeatures()
  } else if (nowEnabled) {
    for (const f of activeFeatures) {
      f.onConfigChange?.(newConfig)
    }
  }
}

function isConfigUpdateMessage(
  message: unknown,
): message is { type: string; config: unknown } {
  if (!message || typeof message !== 'object') return false
  const record = message as Record<string, unknown>
  return record.type === CONFIG_UPDATED_MESSAGE && record.config !== undefined
}

function setupConfigMessageListener() {
  chrome.runtime.onMessage.addListener((message) => {
    if (!isConfigUpdateMessage(message)) return
    applyConfig(mergeConfig(defaultConfig, message.config))
  })
}

async function initFeatures(config: AppConfig, adapter: EngineAdapter) {
  const ec = getEngineConfig(config, adapter)
  if (!ec.enabled) return

  for (const feature of features) {
    try {
      const res = feature.init?.(config, adapter)
      if (res instanceof Promise) await res
      activeFeatures.push(feature)
    } catch (err) {
      console.error(`[LuminaSearch] Error initializing feature ${feature.name}:`, err)
    }
  }
}

function destroyFeatures() {
  for (const f of activeFeatures) {
    try {
      f.destroy?.()
    } catch (err) {
      console.error(`[LuminaSearch] Error destroying feature ${f.name}:`, err)
    }
  }
  activeFeatures = []
}

// Perform actual initialization for a specific URL
async function performInit(url: string) {
  try {
    destroyFeatures()
    
    const adapter = matchAdapter()
    if (!adapter || !adapter.isSearchPage(url)) {
      currentAdapter = null
      return
    }

    currentAdapter = adapter

    // Wire pagination → favicon callback for dynamically loaded results
    setOnResultsAdded((newItems: HTMLElement[]) => {
      if (!currentConfig || !currentAdapter) return
      if (getEngineConfig(currentConfig, currentAdapter).favicon) {
        faviconFeature.processResults?.(newItems, currentAdapter)
      }
    })

    // The initial configuration is loaded before the first init. Reusing it
    // avoids a second storage round-trip on every page load and URL change.
    const config = currentConfig ?? await loadConfig()
    currentConfig = config
    currentConfigFingerprint = getConfigFingerprint(config)
    await initFeatures(config, adapter)
  } finally {
    // Always remove anti-flash styles to restore page visibility
    document.getElementById('luminasearch-anti-flash')?.remove()
  }
}

// Trigger page re-initialization if the URL state has changed
async function triggerReinit() {
  if (isInitializing) return
  isInitializing = true
  
  try {
    while (location.href !== lastProcessedUrl) {
      const urlToProcess = location.href
      console.log(`[LuminaSearch] Initializing layout for URL: ${urlToProcess}`)
      await performInit(urlToProcess)
      lastProcessedUrl = urlToProcess
    }
  } catch (err) {
    console.error('[LuminaSearch] Error during initialization:', err)
  } finally {
    isInitializing = false
  }
}

// Reset processed URL state to force a full re-initialization
function forceReinit() {
  lastProcessedUrl = ''
  triggerReinit()
}

// Check if active style tags are still present in head
function checkStyleTags() {
  if (isInitializing || !currentAdapter || !currentConfig) return
  
  const ec = getEngineConfig(currentConfig, currentAdapter)
  if (!ec.enabled) return

  let styleMissing = false

  // Check layout stylesheet
  const layoutMode = ec.layout
  if (layoutMode !== 'original') {
    const layoutStyle = document.getElementById('luminasearch-layout')
    if (!layoutStyle) {
      styleMissing = true
    }
  }

  if (!document.getElementById('luminasearch-font-size')) {
    styleMissing = true
  }



  // Check eye protect stylesheet
  if (ec.eyeProtection?.enabled) {
    const eyeStyle = document.getElementById('luminasearch-eye-protect')
    if (!eyeStyle) {
      styleMissing = true
    }
  }

  // Check hide sidebar stylesheet
  if (ec.hideSidebar) {
    const sidebarStyle = document.getElementById('luminasearch-hide-sidebar')
    if (!sidebarStyle) {
      styleMissing = true
    }
  }

  if (styleMissing) {
    console.log('[LuminaSearch] Active stylesheet missing, forcing re-initialization...')
    forceReinit()
  }
}

// Schedule checks with debouncing to prevent performance degradation on rapid DOM mutations
function scheduleChecks() {
  if (debounceTimer !== null) {
    clearTimeout(debounceTimer)
  }
  debounceTimer = window.setTimeout(() => {
    debounceTimer = null
    triggerReinit()
    checkStyleTags()
  }, 100)
}

// Set up event listeners and mutation observers for URL changes and styles checking
// Set up event listeners and mutation observers for URL changes and styles checking
function setupUrlChangeListener() {
  window.addEventListener('popstate', scheduleChecks)
  window.addEventListener('hashchange', scheduleChecks)

  // History API navigation does not emit popstate, so notify explicitly.
  const originalPushState = history.pushState.bind(history)
  const originalReplaceState = history.replaceState.bind(history)
  history.pushState = (...args) => {
    const result = originalPushState(...args)
    scheduleChecks()
    return result
  }
  history.replaceState = (...args) => {
    const result = originalReplaceState(...args)
    scheduleChecks()
    return result
  }

  // Only observe the head for stylesheet/title changes. Observing the whole
  // document subtree made every search-result DOM mutation run this callback.
  let headObserver: MutationObserver | null = null
  const attachHeadObserver = () => {
    headObserver?.disconnect()
    const head = document.head
    if (!head) return

    headObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'characterData') {
          if (mutation.target.parentElement?.closest('title')) {
            scheduleChecks()
            return
          }
          continue
        }

        for (const node of mutation.addedNodes) {
          if (node.nodeName === 'STYLE' || node.nodeName === 'LINK' || node.nodeName === 'TITLE') {
            scheduleChecks()
            return
          }
        }
        for (const node of mutation.removedNodes) {
          if (node.nodeName === 'STYLE' || node.nodeName === 'LINK' || node.nodeName === 'TITLE') {
            scheduleChecks()
            return
          }
        }
      }
    })
    headObserver.observe(head, { childList: true, subtree: true, characterData: true })
  }

  attachHeadObserver()

  // Reattach if an SPA replaces the head. This observer watches only direct
  // documentElement children rather than every mutation in the page.
  const rootObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.target !== document.documentElement) continue
      const headChanged = [...mutation.addedNodes, ...mutation.removedNodes].some(
        (node) => node.nodeName === 'HEAD',
      )
      if (headChanged) {
        attachHeadObserver()
        scheduleChecks()
        return
      }
    }
  })
  rootObserver.observe(document.documentElement, { childList: true })
}

let scrollTimeout: number | null = null

function setupScrollListener() {
  window.addEventListener('scroll', () => {
    if (!document.body) return
    if (!document.body.classList.contains('sb-scrolling')) {
      document.body.classList.add('sb-scrolling')
    }
    updateGoogleCompactHeaderForScroll(window.scrollY)
    if (scrollTimeout !== null) {
      clearTimeout(scrollTimeout)
    }
    scrollTimeout = window.setTimeout(() => {
      scrollTimeout = null
      document.body?.classList.remove('sb-scrolling')
    }, 150)
  }, { passive: true })
}

async function main() {
  setupConfigMessageListener()

  // Load initial config
  currentConfig = await loadConfig()
  currentConfigFingerprint = getConfigFingerprint(currentConfig)

  // Initialize features for the first page load
  await triggerReinit()

  // Setup URL change and stylesheet listeners
  setupUrlChangeListener()
  setupScrollListener()

  // Listen for config changes from popup
  onConfigChanged(applyConfig)
}

// Start immediately (at document_start)
main()
