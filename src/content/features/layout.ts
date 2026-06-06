import type { Feature, AppConfig, EngineAdapter, LayoutMode } from '../../shared/types'

const STYLE_ID = 'searchbeauti-layout'

let currentMode: LayoutMode = 'original'
let currentAdapter: EngineAdapter | null = null

const BING_SINGLE_CSS = `
:root {
  --searchbeauti-bing-list-width: min(972px, calc(100vw - 48px));
  --searchbeauti-bing-wide-width: min(1200px, calc(100vw - 48px));
}

/* === Remove Bing's left padding and make containers full-width === */
#b_content {
  padding-left: 0 !important;
}
#b_mcw {
  display: block !important;
  width: auto !important;
}

/* === Center Bing's wide top answer that sits outside #b_results === */
#b_topw {
  display: block !important;
  width: var(--searchbeauti-bing-wide-width) !important;
  max-width: var(--searchbeauti-bing-wide-width) !important;
  padding-left: 0 !important;
  padding-right: 0 !important;
  margin-left: auto !important;
  margin-right: auto !important;
  margin-bottom: 24px !important;
  box-sizing: border-box !important;
}
#b_topw > li {
  width: 100% !important;
  max-width: 100% !important;
  margin-left: 0 !important;
  margin-right: 0 !important;
  box-sizing: border-box !important;
}
#b_topw .b_wpt_bl:first-of-type {
  margin-left: 0 !important;
}

/* === Center the results list === */
#b_results {
  display: block !important;
  width: var(--searchbeauti-bing-list-width) !important;
  padding-left: 0 !important;
  padding-right: 0 !important;
  margin-left: auto !important;
  margin-right: auto !important;
  box-sizing: border-box !important;
}
#b_results > li {
  width: 100% !important;
  max-width: 100% !important;
  margin-left: 0 !important;
  margin-right: 0 !important;
  box-sizing: border-box !important;
}

/* === Card styling for each result === */
#b_results > li.b_algo,
#b_results > li.b_ans,
#b_results > li.b_ad {
  background: #fff !important;
  border-radius: 12px !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06) !important;
  border: 1px solid #e8eaed !important;
  padding: 16px 20px !important;
  margin-bottom: 10px !important;
  transition: box-shadow 0.15s, border-color 0.15s !important;
}
#b_results > li.b_algo:hover,
#b_results > li.b_ans:hover {
  box-shadow: 0 4px 16px rgba(92, 124, 250, 0.18) !important;
  border-color: #bac8ff !important;
}
#b_results > li.b_msg {
  margin-bottom: 10px !important;
}
#b_results > li.b_algo h2 a:visited {
  color: #681da8 !important;
}

/* === Restore Bing's result text states that card styling can flatten === */
#b_topw h2 a,
#b_topw .b_title a,
#b_results h2 a,
#b_results .b_title a {
  color: #1a0dab !important;
}
#b_topw h2 a:visited,
#b_topw .b_title a:visited,
#b_results h2 a:visited,
#b_results .b_title a:visited {
  color: #681da8 !important;
}
#b_topw strong,
#b_results strong {
  color: #c5221f !important;
}

/* === Keep URL and translate action horizontal after narrowing result cards === */
#b_results .b_tpcn,
#b_results .b_attribution {
  max-width: 100% !important;
}
#b_results .b_attribution {
  display: flex !important;
  align-items: center !important;
  flex-wrap: nowrap !important;
  width: max-content !important;
}
#b_results .b_attribution cite,
#b_results .b_attribution .b_tranthis {
  white-space: nowrap !important;
}
#b_results .b_attribution .b_tranthis {
  display: inline-block !important;
  width: auto !important;
  min-width: max-content !important;
  color: #1a0dab !important;
}

/* === Normalize Bing's compound first result so it starts at the same x-position as list cards === */
#b_results > li.b_algo:has(.b_viewport) .b_viewport,
#b_results > li.b_algo:has(.b_viewport) .b_deep,
#b_results > li.b_algo:has(.b_viewport) .b_vList,
#b_results > li.b_algo:has(.b_viewport) .b_vlist,
#b_results > li.b_algo:has(.b_viewport) .b_vList2col,
#b_results > li.b_algo:has(.b_viewport) .b_vlist2col {
  width: 100% !important;
  max-width: 100% !important;
  margin-left: 0 !important;
  margin-right: 0 !important;
  box-sizing: border-box !important;
}

/* === Center the search box and scope bar — same width as cards === */
#sb_form {
  display: block !important;
  width: var(--searchbeauti-bing-list-width) !important;
  margin: 0 auto !important;
}
.b_searchboxForm {
  width: auto !important;
}
.b_scopebar {
  display: block !important;
  width: var(--searchbeauti-bing-list-width) !important;
  margin-left: auto !important;
  margin-right: auto !important;
}
`

function getCSS(engine: string, mode: LayoutMode): string {
  if (mode === 'single') {
    switch (engine) {
      case 'bing':
        return BING_SINGLE_CSS
      // Baidu and Google layouts to be implemented
      default:
        return ''
    }
  }
  return ''
}

function inject(engine: string, mode: LayoutMode) {
  remove()
  const css = getCSS(engine, mode)
  if (!css) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.setAttribute('data-searchbeauti', 'layout')
  style.textContent = css
  document.head.appendChild(style)
  currentMode = mode
}

function remove() {
  document.getElementById(STYLE_ID)?.remove()
  currentMode = 'original'
}

export const layoutFeature: Feature = {
  name: 'layout',

  init(config: AppConfig, adapter: EngineAdapter) {
    currentAdapter = adapter
    const mode = config.engines[adapter.name].layout
    if (mode !== 'original') {
      inject(adapter.name, mode)
    }
  },

  onConfigChange(config: AppConfig) {
    if (!currentAdapter) return
    const mode = config.engines[currentAdapter.name].layout
    if (mode === currentMode) return
    if (mode === 'original') {
      remove()
    } else {
      inject(currentAdapter.name, mode)
    }
  },

  destroy() {
    currentAdapter = null
    remove()
  },
}
