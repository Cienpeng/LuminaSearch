import type { Feature, AppConfig, EngineAdapter } from '../../shared/types'

const FAVICON_CLASS = 'searchbeauti-favicon'

let currentAdapter: EngineAdapter | null = null

function getDomain(item: Element, selector: string): string {
  const anchor = item.querySelector(selector)
  if (anchor) {
    const text = (anchor.textContent || '').trim()
    // Handle full URLs (e.g. Google cite: "https://www.example.com › path")
    if (text.startsWith('http')) {
      try {
        return new URL(text.split(/\s|·|›|»/)[0]).hostname.replace(/^www\./, '')
      } catch {}
    }
    // Extract domain from plain text (e.g. Bing: "www.example.com")
    const match = text.match(/^([a-zA-Z0-9.-]+\.[a-z]{2,})/)
    if (match) return match[1]
    const first = text.split(/\s|·|›|»/)[0]
    if (first && first.includes('.')) return first
  }
  // Fallback for engines that store the target URL in an attribute (e.g. Baidu's mu attr)
  const mu = item.getAttribute('mu')
  if (mu) {
    try {
      return new URL(mu).hostname.replace(/^www\./, '')
    } catch {}
  }
  return ''
}

function addFavicon(item: HTMLElement, domain: string, insertSelector: string) {
  if (!domain) return
  const anchor = item.querySelector(insertSelector) as HTMLElement | null
  if (!anchor?.parentNode) return
  if (anchor.parentNode.querySelector(`.${FAVICON_CLASS}`)) return

  const img = document.createElement('img')
  img.className = FAVICON_CLASS
  img.setAttribute('data-searchbeauti', 'favicon')
  img.src = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=32`
  img.width = 16
  img.height = 16
  img.style.cssText = 'margin-right:6px;vertical-align:middle;border-radius:2px;flex-shrink:0;'
  img.onerror = () => { img.style.display = 'none' }
  anchor.style.verticalAlign = 'middle'
  anchor.parentNode.insertBefore(img, anchor)
}

function processItems(items: HTMLElement[], adapter: EngineAdapter) {
  for (const item of items) {
    const domain = getDomain(item, adapter.selectors.faviconAnchor)
    addFavicon(item, domain, adapter.selectors.resultLink)
  }
}

function removeAll() {
  document.querySelectorAll(`.${FAVICON_CLASS}`).forEach((el) => el.remove())
}

function isSearchBeautiNode(node: Node): boolean {
  if (node.nodeType !== 1) return true
  const el = node as HTMLElement
  if (el.classList.contains(FAVICON_CLASS) || el.getAttribute('data-searchbeauti')) {
    return true
  }
  return false
}

let domWatcher: MutationObserver | null = null
let debounceTimer: number | null = null

function startDomWatcher(config: AppConfig, adapter: EngineAdapter) {
  if (domWatcher) {
    domWatcher.disconnect()
    domWatcher = null
  }
  if (debounceTimer !== null) {
    clearTimeout(debounceTimer)
    debounceTimer = null
  }

  domWatcher = new MutationObserver((mutations) => {
    let hasAddedNodes = false
    for (let i = 0; i < mutations.length; i++) {
      const addedNodes = mutations[i].addedNodes
      for (let j = 0; j < addedNodes.length; j++) {
        if (!isSearchBeautiNode(addedNodes[j])) {
          hasAddedNodes = true
          break
        }
      }
      if (hasAddedNodes) break
    }
    if (!hasAddedNodes) return

    if (debounceTimer !== null) {
      clearTimeout(debounceTimer)
    }
    debounceTimer = window.setTimeout(() => {
      debounceTimer = null
      const items = Array.from(document.querySelectorAll<HTMLElement>(adapter.selectors.resultItem))
      processItems(items, adapter)
    }, 100)
  })

  const target = document.querySelector(adapter.selectors.pageContent) || document.body
  domWatcher.observe(target, {
    childList: true,
    subtree: true,
  })
}

export const faviconFeature: Feature = {
  name: 'favicon',

  init(config: AppConfig, adapter: EngineAdapter) {
    currentAdapter = adapter
    const ec = config.engines[adapter.name]
    if (!ec.favicon) return

    const items = Array.from(document.querySelectorAll<HTMLElement>(adapter.selectors.resultItem))
    processItems(items, adapter)

    startDomWatcher(config, adapter)
  },

  processResults(results: HTMLElement[], adapter: EngineAdapter) {
    processItems(results, adapter)
  },

  onConfigChange(config: AppConfig) {
    if (!currentAdapter) return
    const ec = config.engines[currentAdapter.name]
    if (ec.favicon) {
      const items = Array.from(
        document.querySelectorAll<HTMLElement>(currentAdapter.selectors.resultItem),
      )
      processItems(items, currentAdapter)
      startDomWatcher(config, currentAdapter)
    } else {
      if (domWatcher) {
        domWatcher.disconnect()
        domWatcher = null
      }
      if (debounceTimer !== null) {
        clearTimeout(debounceTimer)
        debounceTimer = null
      }
      removeAll()
    }
  },

  destroy() {
    currentAdapter = null
    if (domWatcher) {
      domWatcher.disconnect()
      domWatcher = null
    }
    if (debounceTimer !== null) {
      clearTimeout(debounceTimer)
      debounceTimer = null
    }
    removeAll()
  },
}
