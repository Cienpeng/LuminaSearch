import type { Feature, AppConfig, EngineAdapter } from '../../shared/types'

const OVERLAY_ID = 'searchbeauti-eye-protect'

let currentAdapter: EngineAdapter | null = null

function createOverlay(config: AppConfig, adapter: EngineAdapter): HTMLDivElement {
  const ec = config.engines[adapter.name].eyeProtection
  const el = document.createElement('div')
  el.id = OVERLAY_ID
  el.setAttribute('data-searchbeauti', 'eye-protect')
  el.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: ${ec.color}; opacity: ${ec.opacity};
    pointer-events: none; z-index: 9998;
  `
  return el
}

export const eyeProtectFeature: Feature = {
  name: 'eye-protect',

  init(config: AppConfig, adapter: EngineAdapter) {
    currentAdapter = adapter
    const ec = config.engines[adapter.name].eyeProtection
    if (ec.enabled) {
      document.body.appendChild(createOverlay(config, adapter))
    }
  },

  onConfigChange(config: AppConfig) {
    if (!currentAdapter) return
    const existing = document.getElementById(OVERLAY_ID) as HTMLDivElement | null
    const ec = config.engines[currentAdapter.name].eyeProtection

    if (ec.enabled) {
      if (existing) {
        existing.style.background = ec.color
        existing.style.opacity = String(ec.opacity)
      } else {
        document.body.appendChild(createOverlay(config, currentAdapter))
      }
    } else {
      existing?.remove()
    }
  },

  destroy() {
    currentAdapter = null
    document.getElementById(OVERLAY_ID)?.remove()
  },
}
