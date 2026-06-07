import type { AppConfig, EngineAdapter, Feature } from '../shared/types'
import { loadConfig, onConfigChanged } from '../shared/storage'
import { bingAdapter } from './engines/bing'
import { baiduAdapter } from './engines/baidu'
import { googleAdapter } from './engines/google'
import { eyeProtectFeature } from './features/eye-protect'
import { faviconFeature } from './features/favicon'
import { paginationFeature, setOnResultsAdded } from './features/pagination'
import { hideSidebarFeature } from './features/hide-sidebar'
import { layoutFeature } from './features/layout'

// Synchronously inject anti-flash styles at document_start to prevent FOOC
const antiFlash = document.createElement('style')
antiFlash.id = 'searchflow-anti-flash'
antiFlash.textContent = 'html { opacity: 0 !important; }'
document.documentElement.appendChild(antiFlash)

// Safety fallback to restore visibility if initialization hangs
setTimeout(() => {
  document.getElementById('searchflow-anti-flash')?.remove()
}, 500)

const adapters: EngineAdapter[] = [bingAdapter, baiduAdapter, googleAdapter]
const features: Feature[] = [
  eyeProtectFeature,
  faviconFeature,
  paginationFeature,
  hideSidebarFeature,
  layoutFeature,
]

let activeFeatures: Feature[] = []
let currentConfig: AppConfig | null = null
let currentAdapter: EngineAdapter | null = null

let lastProcessedUrl = ''
let isInitializing = false
let debounceTimer: number | null = null

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
    try {
      const res = feature.init?.(config, adapter)
      if (res instanceof Promise) await res
      activeFeatures.push(feature)
    } catch (err) {
      console.error(`[SearchFlow] Error initializing feature ${feature.name}:`, err)
    }
  }
}

function destroyFeatures() {
  for (const f of activeFeatures) {
    try {
      f.destroy?.()
    } catch (err) {
      console.error(`[SearchBeauti] Error destroying feature ${f.name}:`, err)
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

    // Load configuration fresh to ensure correct layout options are applied
    currentConfig = await loadConfig()

    await initFeatures(currentConfig, adapter)
  } finally {
    // Always remove anti-flash styles to restore page visibility
    document.getElementById('searchflow-anti-flash')?.remove()
  }
}

// Trigger page re-initialization if the URL state has changed
async function triggerReinit() {
  if (isInitializing) return
  isInitializing = true
  
  try {
    while (location.href !== lastProcessedUrl) {
      const urlToProcess = location.href
      console.log(`[SearchFlow] Initializing layout for URL: ${urlToProcess}`)
      await performInit(urlToProcess)
      lastProcessedUrl = urlToProcess
    }
  } catch (err) {
    console.error('[SearchFlow] Error during initialization:', err)
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
    const layoutStyle = document.getElementById('searchbeauti-layout')
    if (!layoutStyle) {
      styleMissing = true
    }
  }



  // Check eye protect stylesheet
  if (ec.eyeProtection?.enabled) {
    const eyeStyle = document.getElementById('searchbeauti-eye-protect')
    if (!eyeStyle) {
      styleMissing = true
    }
  }

  // Check hide sidebar stylesheet
  if (ec.hideSidebar) {
    const sidebarStyle = document.getElementById('searchbeauti-hide-sidebar')
    if (!sidebarStyle) {
      styleMissing = true
    }
  }

  if (styleMissing) {
    console.log('[SearchFlow] Active stylesheet missing, forcing re-initialization...')
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

  // Observe all DOM mutations under documentElement (remains active through SPA head/body replacements)
  const observer = new MutationObserver((mutations) => {
    let shouldCheck = location.href !== lastProcessedUrl
    if (!shouldCheck) {
      for (let k = 0; k < mutations.length; k++) {
        const m = mutations[k]
        if (m.target.nodeName === 'TITLE') {
          shouldCheck = true
          break
        }
        for (let i = 0; i < m.addedNodes.length; i++) {
          const node = m.addedNodes[i]
          if (node.nodeName === 'STYLE' || node.nodeName === 'LINK') {
            shouldCheck = true
            break
          }
        }
        if (shouldCheck) break
        for (let i = 0; i < m.removedNodes.length; i++) {
          const node = m.removedNodes[i]
          if (node.nodeName === 'STYLE' || node.nodeName === 'LINK') {
            shouldCheck = true
            break
          }
        }
        if (shouldCheck) break
      }
    }
    if (shouldCheck) {
      scheduleChecks()
    }
  })
  observer.observe(document.documentElement, { childList: true, subtree: true })

  // Fallback periodic check (every 1 second) in case observers are delayed
  setInterval(scheduleChecks, 1000)
}

let scrollTimeout: number | null = null

function setupScrollListener() {
  window.addEventListener('scroll', () => {
    if (!document.body) return
    if (!document.body.classList.contains('sb-scrolling')) {
      document.body.classList.add('sb-scrolling')
    }
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
  // Load initial config
  currentConfig = await loadConfig()

  // Initialize features for the first page load
  await triggerReinit()

  // Setup URL change and stylesheet listeners
  setupUrlChangeListener()
  setupScrollListener()

  // Listen for config changes from popup
  onConfigChanged((newConfig: AppConfig) => {
    currentConfig = newConfig
    for (const f of features) {
      f.onConfigChange?.(newConfig)
    }

    if (!currentAdapter) return
    const wasEnabled = getEngineConfig(currentConfig, currentAdapter).enabled
    const nowEnabled = getEngineConfig(newConfig, currentAdapter).enabled
    if (!wasEnabled && nowEnabled) {
      initFeatures(newConfig, currentAdapter)
    } else if (wasEnabled && !nowEnabled) {
      destroyFeatures()
    }
  })
}

// Start immediately (at document_start)
main()
