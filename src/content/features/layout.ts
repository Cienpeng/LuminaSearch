import type { Feature, AppConfig, EngineAdapter, LayoutMode } from '../../shared/types'

const STYLE_ID = 'luminasearch-layout'

let currentMode: LayoutMode = 'original'
let currentAdapter: EngineAdapter | null = null

const BING_SINGLE_CSS = `
:root {
  --luminasearch-bing-list-width: min(972px, calc(100vw - 48px));
  --luminasearch-bing-wide-width: min(1200px, calc(100vw - 48px));
}

/* === Global Page Background === */
body {
  background: #f8fafc !important;
}
body.sb-scrolling * {
  pointer-events: none !important;
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
  width: var(--luminasearch-bing-wide-width) !important;
  max-width: var(--luminasearch-bing-wide-width) !important;
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
  width: var(--luminasearch-bing-list-width) !important;
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
  background: #ffffff !important;
  border-radius: 16px !important;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 10px 15px -3px rgba(0, 0, 0, 0.03) !important;
  border: 1px solid rgba(0, 0, 0, 0.04) !important;
  padding: 20px 24px !important;
  margin-bottom: 16px !important;
  transition: transform 0.2s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.2s cubic-bezier(0.25, 0.8, 0.25, 1), border-color 0.2s cubic-bezier(0.25, 0.8, 0.25, 1) !important;
  box-sizing: border-box !important;
}
#b_results > li.b_algo:hover,
#b_results > li.b_ans:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 12px 24px -10px rgba(0, 0, 0, 0.08), 0 4px 12px -4px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.05) !important;
  border-color: rgba(0, 0, 0, 0.08) !important;
  will-change: transform, box-shadow !important;
}
#b_results > li.b_msg {
  margin-bottom: 16px !important;
}
#b_results > li.b_algo h2 a:visited {
  color: #6b21a8 !important;
}

/* === Restore Bing's result text states that card styling can flatten === */
#b_topw h2 a,
#b_topw .b_title a,
#b_results h2 a,
#b_results .b_title a {
  color: #2563eb !important;
}
#b_topw h2 a:visited,
#b_topw .b_title a:visited,
#b_results h2 a:visited,
#b_results .b_title a:visited {
  color: #6b21a8 !important;
}
#b_content strong,
#b_content b,
#b_content em {
  background: rgba(59, 130, 246, 0.06) !important;
  color: #ef4444 !important;
  padding: 1px 4px !important;
  border-radius: 4px !important;
  font-style: normal !important;
  font-weight: 600 !important;
  border: 1px solid rgba(59, 130, 246, 0.15) !important;
}
#b_results h2 a em,
#b_results h2 a strong,
#b_results h2 a b,
#b_topw h2 a em,
#b_topw h2 a strong,
#b_topw h2 a b {
  color: #ef4444 !important;
  background: none !important;
  border: none !important;
  padding: 0 !important;
  font-style: normal !important;
  font-weight: 600 !important;
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
  width: var(--luminasearch-bing-list-width) !important;
  margin: 0 auto !important;
}
.b_searchboxForm {
  width: auto !important;
}
.b_scopebar {
  display: block !important;
  width: var(--luminasearch-bing-list-width) !important;
  margin-left: auto !important;
  margin-right: auto !important;
}

/* === Center Bing's b_pole (Overview / tabs) === */
#b_pole {
  display: block !important;
  width: var(--luminasearch-bing-list-width) !important;
  max-width: var(--luminasearch-bing-list-width) !important;
  padding-left: 0 !important;
  padding-right: 0 !important;
  margin-left: auto !important;
  margin-right: auto !important;
  box-sizing: border-box !important;
}
#b_pole .b_poleContent {
  width: 100% !important;
  max-width: 100% !important;
  margin-left: 0 !important;
  margin-right: 0 !important;
  box-sizing: border-box !important;
}
body:not(:has(.pole-mag)) #b_pole .wptabs_cont {
  margin-left: 0 !important;
}

/* === App-pill Favicon Styling === */
img.luminasearch-favicon {
  width: 20px !important;
  height: 20px !important;
  padding: 3px !important;
  background: #ffffff !important;
  border: 1px solid rgba(0, 0, 0, 0.06) !important;
  border-radius: 6px !important;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04) !important;
  margin-right: 8px !important;
  vertical-align: middle !important;
  display: inline-block !important;
}
`

const GOOGLE_SINGLE_CSS = `
:root {
  --luminasearch-google-list-width: min(972px, calc(100vw - 48px));
}

/* === Global Page Background === */
body {
  background: #f8fafc !important;
}
body.sb-scrolling * {
  pointer-events: none !important;
}

/* === Center the search results === */
#rcnt {
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
}

#center_col {
  width: var(--luminasearch-google-list-width) !important;
  max-width: var(--luminasearch-google-list-width) !important;
  padding-left: 0 !important;
  padding-right: 0 !important;
  margin-left: 0 !important;
  margin-right: 0 !important;
}

/* === Handle sidebar positioning === */
#rhs {
  margin-left: 0 !important;
  padding-left: 0 !important;
  width: var(--luminasearch-google-list-width) !important;
  max-width: var(--luminasearch-google-list-width) !important;
}

/* === Center and shorten Google Search Box === */
#searchform {
  min-height: 70px !important;
  position: relative !important;
}
form.tsf {
  position: absolute !important;
  left: 50% !important;
  transform: translateX(-50%) !important;
  width: min(580px, calc(100vw - 48px)) !important;
  max-width: min(580px, calc(100vw - 48px)) !important;
  margin: 0 !important;
  z-index: 1001 !important;
}
.Q3DXx.Efnghe {
  position: absolute !important;
  right: 24px !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
  left: auto !important;
}

/* === Center Google Navigation Tabs === */
.YNk70c.iFBYke {
  display: block !important;
}
.GG4mbd {
  width: 100% !important;
  max-width: 100% !important;
}
.HTOhZ {
  margin-left: auto !important;
  margin-right: auto !important;
  width: var(--luminasearch-google-list-width) !important;
  max-width: var(--luminasearch-google-list-width) !important;
}

/* === Card styling for Google results === */
#rso .MjjYud:has(a) {
  background: #ffffff !important;
  border-radius: 16px !important;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 10px 15px -3px rgba(0, 0, 0, 0.03) !important;
  border: 1px solid rgba(0, 0, 0, 0.04) !important;
  padding: 20px 24px !important;
  margin-bottom: 16px !important;
  transition: transform 0.2s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.2s cubic-bezier(0.25, 0.8, 0.25, 1), border-color 0.2s cubic-bezier(0.25, 0.8, 0.25, 1) !important;
  box-sizing: border-box !important;
  width: 100% !important;
}
#rso .MjjYud:has(a):hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 12px 24px -10px rgba(0, 0, 0, 0.08), 0 4px 12px -4px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.05) !important;
  border-color: rgba(0, 0, 0, 0.08) !important;
  will-change: transform, box-shadow !important;
}

/* === Restore Google result text states (Blue titles, Purple visited, Red keywords) === */
#center_col h3,
#center_col h3 * {
  color: #2563eb !important;
}
#center_col a:visited h3,
#center_col a:visited h3 * {
  color: #6b21a8 !important;
}
#center_col em {
  background: rgba(59, 130, 246, 0.06) !important;
  color: #ef4444 !important;
  padding: 1px 4px !important;
  border-radius: 4px !important;
  font-style: normal !important;
  font-weight: 600 !important;
  border: 1px solid rgba(59, 130, 246, 0.15) !important;
}
#center_col h3 em,
#center_col h3 strong,
#center_col h3 b {
  color: #ef4444 !important;
  background: none !important;
  border: none !important;
  padding: 0 !important;
  font-style: normal !important;
  font-weight: 600 !important;
}

/* === App-pill Favicon Styling === */
img.luminasearch-favicon {
  width: 20px !important;
  height: 20px !important;
  padding: 3px !important;
  background: #ffffff !important;
  border: 1px solid rgba(0, 0, 0, 0.06) !important;
  border-radius: 6px !important;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04) !important;
  margin-right: 8px !important;
  vertical-align: middle !important;
  display: inline-block !important;
}
`

const BAIDU_SINGLE_CSS = `
:root {
  --luminasearch-baidu-list-width: min(972px, calc(100vw - 48px));
}

/* === Global Page Background === */
body {
  background: #f8fafc !important;
}
body.sb-scrolling * {
  pointer-events: none !important;
}

/* === Center the search results container === */
#container {
  margin-left: auto !important;
  margin-right: auto !important;
  width: var(--luminasearch-baidu-list-width) !important;
  padding-left: 0 !important;
  padding-right: 0 !important;
}

#content_left {
  width: 100% !important;
  padding-left: 0 !important;
  padding-right: 0 !important;
  margin: 0 auto !important;
  float: none !important;
}

/* === Hide sidebar in single layout mode === */
#content_right {
  display: none !important;
}

/* === Center and shorten Baidu Search Box === */
.s_form {
  width: 100% !important;
  max-width: 100% !important;
}
#result_logo,
.result_logo {
  position: absolute !important;
  left: 24px !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
  margin: 0 !important;
}
.chat-input-anchor {
  position: absolute !important;
  left: 50% !important;
  transform: translateX(-50%) !important;
  margin-left: 0 !important;
  width: min(580px, calc(100vw - 48px)) !important;
  max-width: min(580px, calc(100vw - 48px)) !important;
}
#form,
.fm {
  float: none !important;
  margin-left: auto !important;
  margin-right: auto !important;
  width: min(580px, calc(100vw - 48px)) !important;
  max-width: min(580px, calc(100vw - 48px)) !important;
}
#chat-input-main {
  position: relative !important;
  left: 0 !important;
  transform: none !important;
  width: 100% !important;
  max-width: 100% !important;
}
.chat-input-wrapper {
  width: 100% !important;
  max-width: 100% !important;
}

/* === Center Baidu Navigation Tabs === */
.s_tab {
  margin-left: auto !important;
  margin-right: auto !important;
  width: var(--luminasearch-baidu-list-width) !important;
  padding-left: 0 !important;
}
#s_tab_inner,
.s_tab_inner {
  display: flex !important;
  padding-left: 0 !important;
  padding-right: 0 !important;
  justify-content: center !important;
  width: 100% !important;
  gap: 28px !important;
}

/* === Center pagination === */
.page_2muyV, #page {
  display: flex !important;
  justify-content: center !important;
  width: 100% !important;
  padding-left: 0 !important;
  margin-left: 0 !important;
}

/* === Card styling for Baidu results === */
#content_left .result,
#content_left .c-container {
  background: #ffffff !important;
  border-radius: 16px !important;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 10px 15px -3px rgba(0, 0, 0, 0.03) !important;
  border: 1px solid rgba(0, 0, 0, 0.04) !important;
  padding: 20px 24px !important;
  margin-bottom: 16px !important;
  transition: transform 0.2s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.2s cubic-bezier(0.25, 0.8, 0.25, 1), border-color 0.2s cubic-bezier(0.25, 0.8, 0.25, 1) !important;
  box-sizing: border-box !important;
  width: 100% !important;
}
#content_left .result:hover,
#content_left .c-container:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 12px 24px -10px rgba(0, 0, 0, 0.08), 0 4px 12px -4px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.05) !important;
  border-color: rgba(0, 0, 0, 0.08) !important;
  will-change: transform, box-shadow !important;
}

/* === Restore Baidu result text states (Blue titles, Purple visited, Red keywords) === */
#content_left h3 a,
#content_left h3 a * {
  color: #2563eb !important;
}
#content_left h3 a:visited,
#content_left h3 a:visited * {
  color: #6b21a8 !important;
}
#content_left em {
  background: rgba(59, 130, 246, 0.06) !important;
  color: #ef4444 !important;
  padding: 1px 4px !important;
  border-radius: 4px !important;
  font-style: normal !important;
  font-weight: 600 !important;
  border: 1px solid rgba(59, 130, 246, 0.15) !important;
}
#content_left h3 em,
#content_left h3 strong,
#content_left h3 b,
#content_left h3 a em,
#content_left h3 a strong,
#content_left h3 a b {
  color: #ef4444 !important;
  background: none !important;
  border: none !important;
  padding: 0 !important;
  font-style: normal !important;
  font-weight: 600 !important;
}

/* === App-pill Favicon Styling === */
img.luminasearch-favicon {
  width: 20px !important;
  height: 20px !important;
  padding: 3px !important;
  background: #ffffff !important;
  border: 1px solid rgba(0, 0, 0, 0.06) !important;
  border-radius: 6px !important;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04) !important;
  margin-right: 8px !important;
  vertical-align: middle !important;
  display: inline-block !important;
}
`

const BING_DOUBLE_CSS = `
:root {
  --luminasearch-bing-list-width: min(1200px, calc(100vw - 48px));
  --luminasearch-bing-wide-width: min(1200px, calc(100vw - 48px));
}

/* === Global Page Background === */
body {
  background: #f8fafc !important;
}
body.sb-scrolling * {
  pointer-events: none !important;
}

/* === Remove Bing's left padding and make containers full-width === */
#b_content {
  padding-left: 0 !important;
}
#b_mcw {
  display: block !important;
  width: auto !important;
}

/* === Center Bing's wide top answer === */
#b_topw {
  display: block !important;
  width: var(--luminasearch-bing-wide-width) !important;
  max-width: var(--luminasearch-bing-wide-width) !important;
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

/* === Center the results list and make it a 2-column Grid === */
#b_results {
  display: grid !important;
  grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  gap: 16px !important;
  align-items: stretch !important;
  width: var(--luminasearch-bing-list-width) !important;
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
#b_results > li:not(.b_algo):not(.b_ans):not(.b_ad) {
  grid-column: span 2 !important;
}

/* === Card styling for each result === */
#b_results > li.b_algo,
#b_results > li.b_ans,
#b_results > li.b_ad {
  background: #ffffff !important;
  border-radius: 16px !important;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 10px 15px -3px rgba(0, 0, 0, 0.03) !important;
  border: 1px solid rgba(0, 0, 0, 0.04) !important;
  padding: 20px 24px !important;
  transition: transform 0.2s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.2s cubic-bezier(0.25, 0.8, 0.25, 1), border-color 0.2s cubic-bezier(0.25, 0.8, 0.25, 1) !important;
  box-sizing: border-box !important;
}
#b_results > li.b_algo:hover,
#b_results > li.b_ans:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 12px 24px -10px rgba(0, 0, 0, 0.08), 0 4px 12px -4px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.05) !important;
  border-color: rgba(0, 0, 0, 0.08) !important;
  will-change: transform, box-shadow !important;
}
#b_results > li.b_msg {
  margin-bottom: 16px !important;
}
#b_results > li.b_algo h2 a:visited {
  color: #6b21a8 !important;
}

/* === Restore Bing's result text states === */
#b_topw h2 a,
#b_topw .b_title a,
#b_results h2 a,
#b_results .b_title a {
  color: #2563eb !important;
}
#b_topw h2 a:visited,
#b_topw .b_title a:visited,
#b_results h2 a:visited,
#b_results .b_title a:visited {
  color: #6b21a8 !important;
}
#b_content strong,
#b_content b,
#b_content em {
  background: rgba(59, 130, 246, 0.06) !important;
  color: #ef4444 !important;
  padding: 1px 4px !important;
  border-radius: 4px !important;
  font-style: normal !important;
  font-weight: 600 !important;
  border: 1px solid rgba(59, 130, 246, 0.15) !important;
}
#b_results h2 a em,
#b_results h2 a strong,
#b_results h2 a b,
#b_topw h2 a em,
#b_topw h2 a strong,
#b_topw h2 a b {
  color: #ef4444 !important;
  background: none !important;
  border: none !important;
  padding: 0 !important;
  font-style: normal !important;
  font-weight: 600 !important;
}

/* === Keep URL and translate action horizontal === */
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

/* === Normalize Bing's compound first result === */
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

/* === Center the search box and scope bar === */
#sb_form {
  display: block !important;
  width: min(972px, calc(100vw - 48px)) !important;
  margin: 0 auto !important;
}
.b_searchboxForm {
  width: auto !important;
}
.b_scopebar {
  display: block !important;
  width: min(972px, calc(100vw - 48px)) !important;
  margin-left: auto !important;
  margin-right: auto !important;
}

#b_pole {
  display: block !important;
  width: min(972px, calc(100vw - 48px)) !important;
  max-width: min(972px, calc(100vw - 48px)) !important;
  padding-left: 0 !important;
  padding-right: 0 !important;
  margin-left: auto !important;
  margin-right: auto !important;
  box-sizing: border-box !important;
}
#b_pole .b_poleContent {
  width: 100% !important;
  max-width: 100% !important;
  margin-left: 0 !important;
  margin-right: 0 !important;
  box-sizing: border-box !important;
}
body:not(:has(.pole-mag)) #b_pole .wptabs_cont {
  margin-left: 0 !important;
}

/* === App-pill Favicon Styling === */
img.luminasearch-favicon {
  width: 20px !important;
  height: 20px !important;
  padding: 3px !important;
  background: #ffffff !important;
  border: 1px solid rgba(0, 0, 0, 0.06) !important;
  border-radius: 6px !important;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04) !important;
  margin-right: 8px !important;
  vertical-align: middle !important;
  display: inline-block !important;
}

/* === Double layout card constraints & expand CSS === */
body.sb-double-layout #b_results > li.b_algo,
body.sb-double-layout #b_results > li.b_ans,
body.sb-double-layout #b_results > li.b_ad {
  max-height: 280px;
  overflow: hidden !important;
  position: relative !important;
  margin-bottom: 0 !important;
  transition: max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1), transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease !important;
}
body.sb-double-layout #b_results > li.b_algo.can-expand::after,
body.sb-double-layout #b_results > li.b_ans.can-expand::after,
body.sb-double-layout #b_results > li.b_ad.can-expand::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 48px;
  background: linear-gradient(transparent, #ffffff) !important;
  pointer-events: none;
  transition: opacity 0.3s;
  z-index: 5;
}
body.sb-double-layout #b_results > li.b_algo.expanded::after,
body.sb-double-layout #b_results > li.b_ans.expanded::after,
body.sb-double-layout #b_results > li.b_ad.expanded::after {
  opacity: 0 !important;
}
.sb-expand-btn {
  position: absolute;
  bottom: 10px;
  right: 14px;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #ffffff !important;
  border: 1px solid rgba(0, 0, 0, 0.08) !important;
  box-shadow: 0 2px 4px rgba(0,0,0,0.06) !important;
  color: #64748b !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  cursor: pointer !important;
  z-index: 10 !important;
  transition: all 0.2s !important;
}
.sb-expand-btn:hover {
  background: #f8fafc !important;
  color: #1e293b !important;
  border-color: rgba(0, 0, 0, 0.15) !important;
  transform: scale(1.08) !important;
}
`

const GOOGLE_DOUBLE_CSS = `
:root {
  --luminasearch-google-list-width: min(1200px, calc(100vw - 48px));
}

/* === Global Page Background === */
body {
  background: #f8fafc !important;
}
body.sb-scrolling * {
  pointer-events: none !important;
}

/* === Center the search results === */
#rcnt {
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
}

#center_col {
  width: var(--luminasearch-google-list-width) !important;
  max-width: var(--luminasearch-google-list-width) !important;
  padding-left: 0 !important;
  padding-right: 0 !important;
  margin-left: 0 !important;
  margin-right: 0 !important;
}

/* === Handle sidebar positioning === */
#rhs {
  margin-left: 0 !important;
  padding-left: 0 !important;
  width: var(--luminasearch-google-list-width) !important;
  max-width: var(--luminasearch-google-list-width) !important;
}

/* === Center and shorten Google Search Box === */
#searchform {
  min-height: 70px !important;
  position: relative !important;
}
form.tsf {
  position: absolute !important;
  left: 50% !important;
  transform: translateX(-50%) !important;
  width: min(580px, calc(100vw - 48px)) !important;
  max-width: min(580px, calc(100vw - 48px)) !important;
  margin: 0 !important;
  z-index: 1001 !important;
}
.Q3DXx.Efnghe {
  position: absolute !important;
  right: 24px !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
  left: auto !important;
}

/* === Center Google Navigation Tabs === */
.YNk70c.iFBYke {
  display: block !important;
}
.GG4mbd {
  width: 100% !important;
  max-width: 100% !important;
}
.HTOhZ {
  margin-left: auto !important;
  margin-right: auto !important;
  width: min(972px, calc(100vw - 48px)) !important;
  max-width: min(972px, calc(100vw - 48px)) !important;
}

/* === Grid container for Google results === */
#rso {
  display: grid !important;
  grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  gap: 16px !important;
  align-items: stretch !important;
}

/* === Non-standard or full-width elements span 2 columns === */
#rso > .MjjYud:not(:has(h3)),
#rso > .MjjYud:has(.kp-blk) {
  grid-column: span 2 !important;
}

/* === Card styling for Google results === */
#rso .MjjYud:has(a) {
  background: #ffffff !important;
  border-radius: 16px !important;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 10px 15px -3px rgba(0, 0, 0, 0.03) !important;
  border: 1px solid rgba(0, 0, 0, 0.04) !important;
  padding: 20px 24px !important;
  transition: transform 0.2s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.2s cubic-bezier(0.25, 0.8, 0.25, 1), border-color 0.2s cubic-bezier(0.25, 0.8, 0.25, 1) !important;
  box-sizing: border-box !important;
  width: 100% !important;
}
#rso .MjjYud:has(a):hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 12px 24px -10px rgba(0, 0, 0, 0.08), 0 4px 12px -4px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.05) !important;
  border-color: rgba(0, 0, 0, 0.08) !important;
  will-change: transform, box-shadow !important;
}

/* === Restore Google result text states === */
#center_col h3,
#center_col h3 * {
  color: #2563eb !important;
}
#center_col a:visited h3,
#center_col a:visited h3 * {
  color: #6b21a8 !important;
}
#center_col em {
  background: rgba(59, 130, 246, 0.06) !important;
  color: #ef4444 !important;
  padding: 1px 4px !important;
  border-radius: 4px !important;
  font-style: normal !important;
  font-weight: 600 !important;
  border: 1px solid rgba(59, 130, 246, 0.15) !important;
}
#center_col h3 em,
#center_col h3 strong,
#center_col h3 b {
  color: #ef4444 !important;
  background: none !important;
  border: none !important;
  padding: 0 !important;
  font-style: normal !important;
  font-weight: 600 !important;
}

/* === App-pill Favicon Styling === */
img.luminasearch-favicon {
  width: 20px !important;
  height: 20px !important;
  padding: 3px !important;
  background: #ffffff !important;
  border: 1px solid rgba(0, 0, 0, 0.06) !important;
  border-radius: 6px !important;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04) !important;
  margin-right: 8px !important;
  vertical-align: middle !important;
  display: inline-block !important;
}

/* === Double layout card constraints & expand CSS === */
body.sb-double-layout #rso .MjjYud:has(a) {
  max-height: 280px;
  overflow: hidden !important;
  position: relative !important;
  margin-bottom: 0 !important;
  transition: max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1), transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease !important;
}
body.sb-double-layout #rso .MjjYud.can-expand:has(a)::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 48px;
  background: linear-gradient(transparent, #ffffff) !important;
  pointer-events: none;
  transition: opacity 0.3s;
  z-index: 5;
}
body.sb-double-layout #rso .MjjYud.expanded:has(a)::after {
  opacity: 0 !important;
}
.sb-expand-btn {
  position: absolute;
  bottom: 10px;
  right: 14px;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #ffffff !important;
  border: 1px solid rgba(0, 0, 0, 0.08) !important;
  box-shadow: 0 2px 4px rgba(0,0,0,0.06) !important;
  color: #64748b !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  cursor: pointer !important;
  z-index: 10 !important;
  transition: all 0.2s !important;
}
.sb-expand-btn:hover {
  background: #f8fafc !important;
  color: #1e293b !important;
  border-color: rgba(0, 0, 0, 0.15) !important;
  transform: scale(1.08) !important;
}
`

const BAIDU_DOUBLE_CSS = `
:root {
  --luminasearch-baidu-list-width: min(1200px, calc(100vw - 48px));
}

/* === Global Page Background === */
body {
  background: #f8fafc !important;
}
body.sb-scrolling * {
  pointer-events: none !important;
}

/* === Center the search results container === */
#container {
  margin-left: auto !important;
  margin-right: auto !important;
  width: var(--luminasearch-baidu-list-width) !important;
  padding-left: 0 !important;
  padding-right: 0 !important;
}

#content_left {
  display: grid !important;
  grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  gap: 16px !important;
  align-items: stretch !important;
  width: 100% !important;
  padding-left: 0 !important;
  padding-right: 0 !important;
  margin: 0 auto !important;
  float: none !important;
}

/* === Non-standard or full-width elements span 2 columns === */
#content_left > *:not(.result):not(.c-container) {
  grid-column: span 2 !important;
}

/* === Hide sidebar in double layout mode === */
#content_right {
  display: none !important;
}

/* === Center and shorten Baidu Search Box === */
.s_form {
  width: 100% !important;
  max-width: 100% !important;
}
#result_logo,
.result_logo {
  position: absolute !important;
  left: 24px !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
  margin: 0 !important;
}
.chat-input-anchor {
  position: absolute !important;
  left: 50% !important;
  transform: translateX(-50%) !important;
  margin-left: 0 !important;
  width: min(580px, calc(100vw - 48px)) !important;
  max-width: min(580px, calc(100vw - 48px)) !important;
}
#form,
.fm {
  float: none !important;
  margin-left: auto !important;
  margin-right: auto !important;
  width: min(580px, calc(100vw - 48px)) !important;
  max-width: min(580px, calc(100vw - 48px)) !important;
}
#chat-input-main {
  position: relative !important;
  left: 0 !important;
  transform: none !important;
  width: 100% !important;
  max-width: 100% !important;
}
.chat-input-wrapper {
  width: 100% !important;
  max-width: 100% !important;
}

/* === Center Baidu Navigation Tabs === */
.s_tab {
  margin-left: auto !important;
  margin-right: auto !important;
  width: min(972px, calc(100vw - 48px)) !important;
  padding-left: 0 !important;
}
#s_tab_inner,
.s_tab_inner {
  display: flex !important;
  padding-left: 0 !important;
  padding-right: 0 !important;
  justify-content: center !important;
  width: 100% !important;
  gap: 28px !important;
}

/* === Center pagination === */
.page_2muyV, #page {
  display: flex !important;
  justify-content: center !important;
  width: 100% !important;
  padding-left: 0 !important;
  margin-left: 0 !important;
}

/* === Card styling for Baidu results === */
#content_left .result,
#content_left .c-container {
  background: #ffffff !important;
  border-radius: 16px !important;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 10px 15px -3px rgba(0, 0, 0, 0.03) !important;
  border: 1px solid rgba(0, 0, 0, 0.04) !important;
  padding: 20px 24px !important;
  transition: transform 0.2s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.2s cubic-bezier(0.25, 0.8, 0.25, 1), border-color 0.2s cubic-bezier(0.25, 0.8, 0.25, 1) !important;
  box-sizing: border-box !important;
  width: 100% !important;
}
#content_left .result:hover,
#content_left .c-container:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 12px 24px -10px rgba(0, 0, 0, 0.08), 0 4px 12px -4px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.05) !important;
  border-color: rgba(0, 0, 0, 0.08) !important;
  will-change: transform, box-shadow !important;
}

/* === Restore Baidu result text states === */
#content_left h3 a,
#content_left h3 a * {
  color: #2563eb !important;
}
#content_left h3 a:visited,
#content_left h3 a:visited * {
  color: #6b21a8 !important;
}
#content_left em {
  background: rgba(59, 130, 246, 0.06) !important;
  color: #ef4444 !important;
  padding: 1px 4px !important;
  border-radius: 4px !important;
  font-style: normal !important;
  font-weight: 600 !important;
  border: 1px solid rgba(59, 130, 246, 0.15) !important;
}
#content_left h3 em,
#content_left h3 strong,
#content_left h3 b,
#content_left h3 a em,
#content_left h3 a strong,
#content_left h3 a b {
  color: #ef4444 !important;
  background: none !important;
  border: none !important;
  padding: 0 !important;
  font-style: normal !important;
  font-weight: 600 !important;
}

/* === App-pill Favicon Styling === */
img.luminasearch-favicon {
  width: 20px !important;
  height: 20px !important;
  padding: 3px !important;
  background: #ffffff !important;
  border: 1px solid rgba(0, 0, 0, 0.06) !important;
  border-radius: 6px !important;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04) !important;
  margin-right: 8px !important;
  vertical-align: middle !important;
  display: inline-block !important;
}

/* === Double layout card constraints & expand CSS === */
body.sb-double-layout #content_left .result,
body.sb-double-layout #content_left .c-container {
  max-height: 280px;
  overflow: hidden !important;
  position: relative !important;
  margin-bottom: 0 !important;
  transition: max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1), transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease !important;
}
body.sb-double-layout #content_left .result.can-expand::after,
body.sb-double-layout #content_left .c-container.can-expand::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 48px;
  background: linear-gradient(transparent, #ffffff) !important;
  pointer-events: none;
  transition: opacity 0.3s;
  z-index: 5;
}
body.sb-double-layout #content_left .result.expanded::after,
body.sb-double-layout #content_left .c-container.expanded::after {
  opacity: 0 !important;
}
.sb-expand-btn {
  position: absolute;
  bottom: 10px;
  right: 14px;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #ffffff !important;
  border: 1px solid rgba(0, 0, 0, 0.08) !important;
  box-shadow: 0 2px 4px rgba(0,0,0,0.06) !important;
  color: #64748b !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  cursor: pointer !important;
  z-index: 10 !important;
  transition: all 0.2s !important;
}
.sb-expand-btn:hover {
  background: #f8fafc !important;
  color: #1e293b !important;
  border-color: rgba(0, 0, 0, 0.15) !important;
  transform: scale(1.08) !important;
}
`

function getCSS(engine: string, mode: LayoutMode): string {
  if (mode === 'single') {
    switch (engine) {
      case 'bing':
        return BING_SINGLE_CSS
      case 'google':
        return GOOGLE_SINGLE_CSS
      case 'baidu':
        return BAIDU_SINGLE_CSS
      default:
        return ''
    }
  } else if (mode === 'double') {
    switch (engine) {
      case 'bing':
        return BING_DOUBLE_CSS
      case 'google':
        return GOOGLE_DOUBLE_CSS
      case 'baidu':
        return BAIDU_DOUBLE_CSS
      default:
        return ''
    }
  }
  return ''
}

let doubleLayoutObserver: MutationObserver | null = null
let doubleLayoutTimer: number | null = null
let documentClickBound = false

function bindClickAway() {
  if (documentClickBound) return
  documentClickBound = true
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    const isClickInsideCard = target.closest('.sb-processed')
    if (!isClickInsideCard) {
      document.querySelectorAll('.sb-processed.expanded').forEach((el) => {
        const castEl = el as HTMLElement
        castEl.classList.remove('expanded')
        castEl.style.maxHeight = '280px'
      })
    }
  })
}

function processDoubleLayoutCards(container: Element, itemSelector: string) {
  const cards = container.querySelectorAll<HTMLElement>(itemSelector)
  cards.forEach((card) => {
    const hasProcessed = card.classList.contains('sb-processed')
    if (hasProcessed && card.classList.contains('can-expand')) return

    if (!hasProcessed) {
      card.classList.add('sb-processed')
    }

    if (card.scrollHeight > 280) {
      card.classList.add('can-expand')
      
      if (!card.querySelector('.sb-expand-btn')) {
        const btn = document.createElement('div')
        btn.className = 'sb-expand-btn'
        btn.setAttribute('data-luminasearch', 'expand-btn')
        btn.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" style="transition: transform 0.2s;"><path fill="currentColor" d="M7 10l5 5 5-5z"/></svg>`
        
        btn.addEventListener('click', (e) => {
          e.stopPropagation()
          const isExpanded = card.classList.contains('expanded')
          
          document.querySelectorAll('.sb-processed.expanded').forEach((el) => {
            const castEl = el as HTMLElement
            if (el !== card) {
              castEl.classList.remove('expanded')
              castEl.style.maxHeight = '280px'
            }
          })
          
          if (isExpanded) {
            card.classList.remove('expanded')
            card.style.maxHeight = '280px'
          } else {
            card.classList.add('expanded')
            card.style.maxHeight = card.scrollHeight + 'px'
          }
        })
        
        card.appendChild(btn)
      }
    }
  })
}

function runDoubleLayoutProcessor(adapter: EngineAdapter) {
  if (currentMode !== 'double') return
  const container = document.querySelector(adapter.selectors.pageContent)
  if (container) {
    processDoubleLayoutCards(container, adapter.selectors.resultItem)
    bindClickAway()
  }
}

function isDoubleLayoutExtendNode(node: Node): boolean {
  if (node.nodeType !== 1) return true
  const el = node as HTMLElement
  if (el.classList.contains('sb-expand-btn') || el.getAttribute('data-luminasearch')) {
    return true
  }
  return false
}

function startDoubleLayoutWatcher(adapter: EngineAdapter) {
  stopDoubleLayoutWatcher()
  runDoubleLayoutProcessor(adapter)

  doubleLayoutObserver = new MutationObserver((mutations) => {
    let hasAddedNodes = false
    for (let i = 0; i < mutations.length; i++) {
      const addedNodes = mutations[i].addedNodes
      for (let j = 0; j < addedNodes.length; j++) {
        if (!isDoubleLayoutExtendNode(addedNodes[j])) {
          hasAddedNodes = true
          break
        }
      }
      if (hasAddedNodes) break
    }
    if (!hasAddedNodes) return

    if (doubleLayoutTimer !== null) {
      clearTimeout(doubleLayoutTimer)
    }
    doubleLayoutTimer = window.setTimeout(() => {
      doubleLayoutTimer = null
      runDoubleLayoutProcessor(adapter)
    }, 100)
  })

  const target = document.querySelector(adapter.selectors.pageContent) || document.body
  doubleLayoutObserver.observe(target, {
    childList: true,
    subtree: true,
  })
}

function stopDoubleLayoutWatcher() {
  if (doubleLayoutObserver) {
    doubleLayoutObserver.disconnect()
    doubleLayoutObserver = null
  }
  if (doubleLayoutTimer !== null) {
    clearTimeout(doubleLayoutTimer)
    doubleLayoutTimer = null
  }
}

function cleanDoubleLayoutCards() {
  document.querySelectorAll('.sb-processed').forEach((card) => {
    const castEl = card as HTMLElement
    castEl.classList.remove('sb-processed', 'can-expand', 'expanded')
    castEl.style.maxHeight = ''
    castEl.querySelector('.sb-expand-btn')?.remove()
  })
}

function inject(engine: string, mode: LayoutMode) {
  remove()
  const css = getCSS(engine, mode)
  if (!css) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.setAttribute('data-luminasearch', 'layout')
  style.textContent = css
  const container = document.head || document.documentElement
  container.appendChild(style)
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
      if (mode === 'double') {
        document.documentElement.classList.add('sb-double-layout')
        startDoubleLayoutWatcher(adapter)
      }
    }
  },

  onConfigChange(config: AppConfig) {
    if (!currentAdapter) return
    const mode = config.engines[currentAdapter.name].layout
    if (mode === currentMode) return

    // Cleanup double layout specific states
    document.documentElement.classList.remove('sb-double-layout')
    stopDoubleLayoutWatcher()
    cleanDoubleLayoutCards()

    if (mode === 'original') {
      remove()
    } else {
      inject(currentAdapter.name, mode)
      if (mode === 'double') {
        document.documentElement.classList.add('sb-double-layout')
        startDoubleLayoutWatcher(currentAdapter)
      }
    }
  },

  destroy() {
    currentAdapter = null
    document.documentElement.classList.remove('sb-double-layout')
    stopDoubleLayoutWatcher()
    cleanDoubleLayoutCards()
    remove()
  },
}
