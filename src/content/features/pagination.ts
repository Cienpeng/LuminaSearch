import type { Feature, AppConfig, EngineAdapter } from '../../shared/types'

const LOADER_ID = 'searchbeauti-pagination-loader'
const SENTINEL_ID = 'searchbeauti-sentinel'

interface PaginationState {
  loading: boolean
  currentPage: number
  nextUrl: string | null
  observer: IntersectionObserver | null
  domWatcher: MutationObserver | null
}

const state: PaginationState = {
  loading: false,
  currentPage: 1,
  nextUrl: null,
  observer: null,
  domWatcher: null,
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
  el.setAttribute('data-searchbeauti', 'pagination-loader')
  el.style.cssText = 'text-align:center;padding:16px;color:#94a3b8;font-size:13px;'
  el.textContent = 'Loading more results...'
  return el
}

function createSentinel(): HTMLDivElement {
  const el = document.createElement('div')
  el.id = SENTINEL_ID
  el.setAttribute('data-searchbeauti', 'sentinel')
  el.style.cssText = 'height:1px;width:100%;'
  return el
}

async function loadNextPage(
  adapter: EngineAdapter,
  contentArea: Element,
): Promise<HTMLElement[]> {
  if (state.loading || !state.nextUrl) return []

  state.loading = true

  const loader = createLoader()
  contentArea.appendChild(loader)

  try {
    const resp = await fetch(state.nextUrl)
    const html = await resp.text()
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

    state.currentPage++
    state.nextUrl = findNextUrlInDoc(doc, adapter.selectors.nextPageLink)

    loader.remove()

    const oldNav = contentArea.querySelector('nav[role="navigation"]')
    oldNav?.remove()

    return newItems
  } catch {
    loader.textContent = 'Failed to load more results'
    return []
  } finally {
    state.loading = false
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
            for (const item of newItems) {
              area.appendChild(item)
            }
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
    const q = url.searchParams.get('q') || url.searchParams.get('wd') || url.searchParams.get('word') || ''
    return decodeURIComponent(q).toLowerCase().replace(/\+/g, ' ').trim()
  } catch {
    return ''
  }
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

    const nav = contentArea.querySelector('nav[role="navigation"]')
    nav?.remove()

    setupScrollObserver(adapter, contentArea)
    return true
  }
  return false
}

let domWatcherTimer: number | null = null

function startDomWatcher(adapter: EngineAdapter) {
  if (state.domWatcher) {
    state.domWatcher.disconnect()
    state.domWatcher = null
  }
  if (domWatcherTimer !== null) {
    clearTimeout(domWatcherTimer)
    domWatcherTimer = null
  }

  const contentArea = document.querySelector(adapter.selectors.pageContent)
  const watchTarget = contentArea ?? document.body

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
      }
    }, 100)
  })

  state.domWatcher.observe(watchTarget, {
    childList: true,
    subtree: true,
  })

  setTimeout(() => {
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
  if (state.observer) {
    state.observer.disconnect()
    state.observer = null
  }
  if (state.domWatcher) {
    state.domWatcher.disconnect()
    state.domWatcher = null
  }
  if (domWatcherTimer !== null) {
    clearTimeout(domWatcherTimer)
    domWatcherTimer = null
  }
  document.getElementById(LOADER_ID)?.remove()
  document.getElementById(SENTINEL_ID)?.remove()
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
      tryInit(currentAdapter)
    }
  },

  destroy() {
    currentAdapter = null
    cleanup()
  },
}
