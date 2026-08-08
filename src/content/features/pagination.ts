import type { Feature, AppConfig, EngineAdapter } from '../../shared/types'

const LOADER_ID = 'luminasearch-pagination-loader'
const SENTINEL_ID = 'luminasearch-sentinel'
const HIDE_STYLE_ID = 'luminasearch-pagination-hide-style'

interface PaginationState {
  loading: boolean
  currentPage: number
  nextUrl: string | null
  observer: IntersectionObserver | null
  domWatcher: MutationObserver | null
  abortController: AbortController | null
  requestId: number
}

const state: PaginationState = {
  loading: false,
  currentPage: 1,
  nextUrl: null,
  observer: null,
  domWatcher: null,
  abortController: null,
  requestId: 0,
}

let currentAdapter: EngineAdapter | null = null
let onResultsAdded: ((elements: HTMLElement[]) => void) | null = null

export function setOnResultsAdded(cb: (elements: HTMLElement[]) => void) {
  onResultsAdded = cb
}

function findNextUrlInDoc(doc: Document | Element, selector: string): string | null {
  const link = doc.querySelector<HTMLAnchorElement>(selector)
  return link ? link.href : null
}

function createLoader(): HTMLDivElement {
  const el = document.createElement('div')
  el.id = LOADER_ID
  el.setAttribute('data-luminasearch', 'pagination-loader')
  el.style.cssText = 'text-align:center;padding:16px;color:#94a3b8;font-size:13px;'
  el.textContent = 'Loading more results...'
  return el
}

function createSentinel(): HTMLDivElement {
  const el = document.createElement('div')
  el.id = SENTINEL_ID
  el.setAttribute('data-luminasearch', 'sentinel')
  el.style.cssText = 'height:1px;width:100%;'
  return el
}

async function loadNextPage(
  adapter: EngineAdapter,
  contentArea: Element,
): Promise<HTMLElement[]> {
  if (state.loading || !state.nextUrl) return []

  state.loading = true
  const requestId = ++state.requestId
  const nextUrl = state.nextUrl
  const abortController = new AbortController()
  state.abortController = abortController

  const loader = createLoader()
  contentArea.appendChild(loader)

  try {
    const resp = await fetch(nextUrl, { signal: abortController.signal })
    const html = await resp.text()
    if (requestId !== state.requestId) return []

    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')

    const newItems = Array.from(
      doc.querySelectorAll<HTMLElement>(adapter.selectors.resultItem),
    )

    if (newItems.length === 0) {
      state.nextUrl = null
      loader.textContent = 'No more results'
      return []
    }

    adapter.prepareImportedResults?.(newItems, nextUrl, doc)

    state.currentPage++
    state.nextUrl = findNextUrlInDoc(doc, adapter.selectors.nextPageLink)

    loader.remove()

    return newItems
  } catch {
    if (requestId !== state.requestId) return []
    loader.textContent = 'Failed to load more results'
    return []
  } finally {
    if (requestId === state.requestId) {
      state.loading = false
      state.abortController = null
    }
  }
}

function setupScrollObserver(adapter: EngineAdapter, contentArea: Element) {
  if (state.observer) {
    state.observer.disconnect()
  }

  document.getElementById(SENTINEL_ID)?.remove()

  const sentinel = createSentinel()
  contentArea.appendChild(sentinel)

  state.observer = new IntersectionObserver(
    async (entries) => {
      if (entries[0]?.isIntersecting && state.nextUrl && !state.loading) {
        const newItems = await loadNextPage(adapter, contentArea)
        if (newItems.length > 0) {
          const area = document.querySelector(adapter.selectors.pageContent)
          if (area) {
            const fragment = document.createDocumentFragment()
            fragment.append(...newItems)
            area.appendChild(fragment)
          }
          onResultsAdded?.(newItems)
          setupScrollObserver(adapter, contentArea)
        }
      }
    },
    { rootMargin: '800px' },
  )

  state.observer.observe(sentinel)
}

function getQueryFromUrl(urlStr: string): string {
  try {
    const url = new URL(urlStr, location.href)
    let q = url.searchParams.get('q') || url.searchParams.get('wd') || url.searchParams.get('word')
    
    // Fallback to check hash parameters if search parameters are empty
    if (!q && url.hash) {
      const hashParams = new URLSearchParams(url.hash.substring(1))
      q = hashParams.get('q') || hashParams.get('wd') || hashParams.get('word')
    }
    
    return q ? decodeURIComponent(q).toLowerCase().replace(/\+/g, ' ').trim() : ''
  } catch {
    return ''
  }
}

function hideOriginalPagination(adapter: EngineAdapter) {
  removeHideStyle()
  const style = document.createElement('style')
  style.id = HIDE_STYLE_ID
  style.setAttribute('data-luminasearch', 'pagination-hide')
  
  let selectors = ''
  if (adapter.name === 'google') {
    selectors = '#navcnt, #foot, #botstuff table, nav[role="navigation"]'
  } else if (adapter.name === 'baidu') {
    selectors = '#page'
  } else if (adapter.name === 'bing') {
    selectors = '.b_pag, #b_results > li.b_pag'
  }
  
  if (selectors) {
    style.textContent = `${selectors} { display: none !important; }`
    const container = document.head || document.documentElement
    container.appendChild(style)
  }
}

function removeHideStyle() {
  document.getElementById(HIDE_STYLE_ID)?.remove()
}

function tryInit(adapter: EngineAdapter) {
  const nextUrl = findNextUrlInDoc(document, adapter.selectors.nextPageLink)
  if (nextUrl) {
    const currentQuery = getQueryFromUrl(location.href)
    const nextQuery = getQueryFromUrl(nextUrl)

    if (currentQuery && nextQuery && currentQuery !== nextQuery) {
      return false
    }

    state.nextUrl = nextUrl
    const contentArea = document.querySelector(adapter.selectors.pageContent)
    if (!contentArea) return false

    hideOriginalPagination(adapter)

    setupScrollObserver(adapter, contentArea)
    return true
  }
  return false
}

let domWatcherTimer: number | null = null
let domWatcherStopTimer: number | null = null

function clearDomWatcherStopTimer() {
  if (domWatcherStopTimer !== null) {
    clearTimeout(domWatcherStopTimer)
    domWatcherStopTimer = null
  }
}

function startDomWatcher(adapter: EngineAdapter) {
  if (state.domWatcher) {
    state.domWatcher.disconnect()
    state.domWatcher = null
  }
  clearDomWatcherStopTimer()
  if (domWatcherTimer !== null) {
    clearTimeout(domWatcherTimer)
    domWatcherTimer = null
  }

  const contentArea = document.querySelector(adapter.selectors.pageContent)
  const watchTarget = contentArea ?? document.body ?? document.documentElement

  state.domWatcher = new MutationObserver(() => {
    if (domWatcherTimer !== null) {
      clearTimeout(domWatcherTimer)
    }
    domWatcherTimer = window.setTimeout(() => {
      domWatcherTimer = null
      const result = tryInit(adapter)
      if (result) {
        state.domWatcher?.disconnect()
        state.domWatcher = null
        clearDomWatcherStopTimer()
      }
    }, 100)
  })

  state.domWatcher.observe(watchTarget, {
    childList: true,
    subtree: true,
  })

  domWatcherStopTimer = window.setTimeout(() => {
    domWatcherStopTimer = null
    if (state.domWatcher) {
      state.domWatcher.disconnect()
      state.domWatcher = null
    }
    if (domWatcherTimer !== null) {
      clearTimeout(domWatcherTimer)
      domWatcherTimer = null
    }
  }, 15000)
}

function cleanup() {
  state.abortController?.abort()
  state.abortController = null
  state.requestId++
  state.loading = false

  if (state.observer) {
    state.observer.disconnect()
    state.observer = null
  }
  if (state.domWatcher) {
    state.domWatcher.disconnect()
    state.domWatcher = null
  }
  clearDomWatcherStopTimer()
  if (domWatcherTimer !== null) {
    clearTimeout(domWatcherTimer)
    domWatcherTimer = null
  }
  document.getElementById(LOADER_ID)?.remove()
  document.getElementById(SENTINEL_ID)?.remove()
  removeHideStyle()
  state.nextUrl = null
  state.currentPage = 1
}

export const paginationFeature: Feature = {
  name: 'pagination',

  init(config: AppConfig, adapter: EngineAdapter) {
    currentAdapter = adapter
    state.currentPage = 1

    const ec = config.engines[adapter.name]
    if (!ec.autoPagination) return

    const ok = tryInit(adapter)
    if (!ok) {
      startDomWatcher(adapter)
    }
  },

  onConfigChange(config: AppConfig) {
    if (!currentAdapter) return
    const ec = config.engines[currentAdapter.name]
    if (!ec.autoPagination) {
      cleanup()
    } else if (!state.observer && !state.domWatcher) {
      // Was off, now on — re-init
      if (!tryInit(currentAdapter)) {
        startDomWatcher(currentAdapter)
      }
    }
  },

  destroy() {
    currentAdapter = null
    cleanup()
  },
}
