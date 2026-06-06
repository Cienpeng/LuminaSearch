import type { Feature, AppConfig, EngineAdapter } from '../../shared/types'

const STYLE_ID = 'searchbeauti-hide-sidebar'

let currentAdapter: EngineAdapter | null = null

function inject(adapter: EngineAdapter) {
  remove()
  const style = document.createElement('style')
  style.id = STYLE_ID
  style.setAttribute('data-searchbeauti', 'hide-sidebar')
  style.textContent = `${adapter.selectors.sidebar} { display: none !important; }`
  document.head.appendChild(style)
}

function remove() {
  document.getElementById(STYLE_ID)?.remove()
}

export const hideSidebarFeature: Feature = {
  name: 'hide-sidebar',

  init(config: AppConfig, adapter: EngineAdapter) {
    currentAdapter = adapter
    if (config.engines[adapter.name].hideSidebar) {
      inject(adapter)
    }
  },

  onConfigChange(config: AppConfig) {
    if (!currentAdapter) return
    if (config.engines[currentAdapter.name].hideSidebar) {
      inject(currentAdapter)
    } else {
      remove()
    }
  },

  destroy() {
    currentAdapter = null
    remove()
  },
}
