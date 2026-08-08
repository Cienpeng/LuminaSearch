import type { Feature, AppConfig, EngineAdapter, LayoutMode } from '../../shared/types'
import {
  GOOGLE_AI_OVERVIEW_SELECTOR,
  GOOGLE_FULL_WIDTH_RESULT_SELECTOR,
  GOOGLE_STANDARD_RESULT_SELECTOR,
} from '../engines/google'
import { splitSelectorList } from './selector-list'

const STYLE_ID = 'luminasearch-layout'

let currentMode: LayoutMode = 'original'
let currentAdapter: EngineAdapter | null = null

export const GOOGLE_COMPACT_HEADER_ENTER_Y = 64
export const GOOGLE_COMPACT_HEADER_EXIT_Y = 32
const GOOGLE_COMPACT_HEADER_CLASS = 'sb-google-compact-header'

export function getGoogleCompactHeaderState(scrollY: number, isCompact: boolean): boolean {
  const normalizedScrollY = Number.isFinite(scrollY) ? Math.max(0, scrollY) : 0
  return isCompact
    ? normalizedScrollY > GOOGLE_COMPACT_HEADER_EXIT_Y
    : normalizedScrollY >= GOOGLE_COMPACT_HEADER_ENTER_Y
}

export function updateGoogleCompactHeaderForScroll(scrollY = window.scrollY) {
  const root = document.documentElement
  const enabled = currentAdapter?.name === 'google' && currentMode !== 'original'
  const isCompact = root.classList.contains(GOOGLE_COMPACT_HEADER_CLASS)
  const shouldCompact = enabled && getGoogleCompactHeaderState(scrollY, isCompact)

  if (shouldCompact !== isCompact) {
    root.classList.toggle(GOOGLE_COMPACT_HEADER_CLASS, shouldCompact)
  }
}

const CARD_SELECTORS: Record<string, string> = {
  bing: '#b_results > li.b_algo, #b_results > li.b_ans, #b_results > li.b_ad',
  google: GOOGLE_STANDARD_RESULT_SELECTOR,
  baidu: '#content_left .result, #content_left .c-container',
}

export function getCenteredNavigationScrollLeft(clientWidth: number, scrollWidth: number): number {
  if (!Number.isFinite(clientWidth) || !Number.isFinite(scrollWidth)) return 0
  return Math.max(0, (scrollWidth - clientWidth) / 2)
}

const BING_NAVIGATION_CSS = `
/* === Center the visible Bing navigation items inside the result column === */
.b_scopebar {
  flex-basis: 100% !important;
  overflow-x: auto !important;
  overflow-y: hidden !important;
  overscroll-behavior-inline: contain !important;
}
.b_scopebar > ul {
  display: flex !important;
  flex-wrap: nowrap !important;
  align-items: stretch !important;
  justify-content: center !important;
  width: max-content !important;
  min-width: var(--luminasearch-bing-list-width) !important;
  overflow: visible !important;
  padding-left: 0 !important;
  padding-right: 0 !important;
  margin-left: auto !important;
  margin-right: auto !important;
}
.b_scopebar > ul > li {
  flex: 0 0 auto !important;
}
`

const GOOGLE_NAVIGATION_CSS = `
/* === Center Google's real navigation strip without changing its controls === */
.YNk70c.iFBYke {
  display: block !important;
}
.GG4mbd {
  width: 100% !important;
  max-width: 100% !important;
  margin-left: 0 !important;
  margin-right: 0 !important;
  padding-left: 0 !important;
  padding-right: 0 !important;
  box-sizing: border-box !important;
}
.HTOhZ {
  display: flex !important;
  overflow-x: auto !important;
  overflow-y: hidden !important;
  overscroll-behavior-inline: contain !important;
  touch-action: pan-x pinch-zoom !important;
  scrollbar-width: thin;
}
.HTOhZ > .EDblX {
  flex: 0 0 auto !important;
  width: max-content !important;
  min-width: max-content !important;
  margin-left: auto !important;
  margin-right: auto !important;
}
`

const GOOGLE_COMPACT_HEADER_CSS = `
/* === Keep Google's sticky search banner compact after the user starts browsing === */
html.${GOOGLE_COMPACT_HEADER_CLASS} {
  scroll-padding-top: 68px !important;
}
html.${GOOGLE_COMPACT_HEADER_CLASS} .Xx7Mif.E5eFb.CTOaxb.zLSRge {
  height: 60px !important;
  min-height: 60px !important;
  transition: height 120ms ease !important;
}
html.${GOOGLE_COMPACT_HEADER_CLASS} #searchform {
  box-sizing: border-box !important;
  height: 60px !important;
  min-height: 60px !important;
  padding-top: 4px !important;
  padding-bottom: 4px !important;
  transition: height 120ms ease, min-height 120ms ease, padding 120ms ease !important;
}
html.${GOOGLE_COMPACT_HEADER_CLASS} #searchform > .NDnoQ {
  height: 52px !important;
  min-height: 52px !important;
}
html.${GOOGLE_COMPACT_HEADER_CLASS} #searchform form.tsf {
  top: 4px !important;
}
html.${GOOGLE_COMPACT_HEADER_CLASS} .Xx7Mif.E5eFb.CTOaxb.zLSRge:has(#searchform:focus-within) {
  height: 72px !important;
  min-height: 72px !important;
}
html.${GOOGLE_COMPACT_HEADER_CLASS} #searchform:focus-within {
  height: 72px !important;
  min-height: 72px !important;
  padding-top: 10px !important;
  padding-bottom: 10px !important;
}
html.${GOOGLE_COMPACT_HEADER_CLASS} #searchform:focus-within form.tsf {
  top: 10px !important;
}
body.sb-scrolling .Xx7Mif.E5eFb.CTOaxb.zLSRge,
body.sb-scrolling #searchform {
  transition: none !important;
}
@media (prefers-reduced-motion: reduce) {
  html.${GOOGLE_COMPACT_HEADER_CLASS} .Xx7Mif.E5eFb.CTOaxb.zLSRge,
  html.${GOOGLE_COMPACT_HEADER_CLASS} #searchform {
    transition: none !important;
  }
}
`

export function createGoogleRichResultGridTemplateAreas(hasMetadata: boolean): string {
  const rows = [
    '"x5WNvb x5WNvb x5WNvb x5WNvb x5WNvb x5WNvb x5WNvb x5WNvb x5WNvb x5WNvb Vjbam Vjbam"',
    '"nke7rc nke7rc nke7rc nke7rc nke7rc nke7rc nke7rc nke7rc nke7rc nke7rc Vjbam Vjbam"',
    '". . . . . . . . . . Vjbam Vjbam"',
  ]
  if (hasMetadata) {
    rows.push('"mCCBcf mCCBcf mCCBcf mCCBcf mCCBcf mCCBcf mCCBcf mCCBcf mCCBcf mCCBcf mCCBcf mCCBcf"')
  }
  return rows.join(' ')
}

const GOOGLE_RICH_GRID_AREAS = createGoogleRichResultGridTemplateAreas(false)
const GOOGLE_RICH_GRID_WITH_METADATA_AREAS = createGoogleRichResultGridTemplateAreas(true)

const GOOGLE_RESULT_FLOW_CSS = `
/* === Keep ordinary web results fluid while preserving Google's rich modules === */
#rso > .MjjYud:not(:has(a)) {
  display: none !important;
}
${GOOGLE_STANDARD_RESULT_SELECTOR} {
  min-width: 0 !important;
  height: auto !important;
  max-height: none !important;
  overflow: visible !important;
}
${GOOGLE_STANDARD_RESULT_SELECTOR} > .A6K0A,
${GOOGLE_STANDARD_RESULT_SELECTOR} .wHYlTd.tF2Cxc,
${GOOGLE_STANDARD_RESULT_SELECTOR} .wHYlTd.tF2Cxc > .srKDX,
${GOOGLE_STANDARD_RESULT_SELECTOR} .wHYlTd.tF2Cxc > .kb0PBd {
  min-width: 0 !important;
}
${GOOGLE_STANDARD_RESULT_SELECTOR} .wHYlTd.tF2Cxc {
  display: block !important;
  width: 100% !important;
  max-width: 100% !important;
  height: auto !important;
  margin-bottom: 0 !important;
}
/* Organic video web results use a different outer wrapper but inherit the
   same native 30px result-stack tail. Keep video carousels untouched. */
${GOOGLE_STANDARD_RESULT_SELECTOR} .PmEWq.wHYlTd {
  margin-bottom: 0 !important;
}
/* Preserve unknown native .srKDX templates. For the known header/snippet/
   thumbnail structure, restate Google's semantic named areas because
   imported pagination results do not bring their data-snc-specific CSS. */
${GOOGLE_STANDARD_RESULT_SELECTOR} .wHYlTd.tF2Cxc > .srKDX {
  width: 100% !important;
  max-width: 100% !important;
  height: auto !important;
  align-items: start !important;
}
${GOOGLE_STANDARD_RESULT_SELECTOR} .wHYlTd.tF2Cxc > .srKDX:has(> .kb0PBd[data-snf="x5WNvb"]):has(> .kb0PBd[data-snf="nke7rc"]):has(> .kb0PBd[data-snf="Vjbam"]) {
  grid-template-columns: repeat(10, minmax(0, 1fr)) repeat(2, 48px) !important;
  grid-template-areas: ${GOOGLE_RICH_GRID_AREAS} !important;
}
${GOOGLE_STANDARD_RESULT_SELECTOR} .wHYlTd.tF2Cxc > .srKDX:has(> .kb0PBd[data-snf="x5WNvb"]):has(> .kb0PBd[data-snf="nke7rc"]):has(> .kb0PBd[data-snf="Vjbam"]):has(> .kb0PBd[data-snf="mCCBcf"]) {
  grid-template-areas: ${GOOGLE_RICH_GRID_WITH_METADATA_AREAS} !important;
}
${GOOGLE_STANDARD_RESULT_SELECTOR} .wHYlTd.tF2Cxc > .kb0PBd.LnCrMe,
${GOOGLE_STANDARD_RESULT_SELECTOR} .wHYlTd.tF2Cxc > .srKDX > .kb0PBd.LnCrMe {
  align-self: start !important;
}
${GOOGLE_STANDARD_RESULT_SELECTOR} h3,
${GOOGLE_STANDARD_RESULT_SELECTOR} .VwiC3b {
  min-width: 0 !important;
  height: auto !important;
  max-height: none !important;
  overflow-wrap: anywhere !important;
}
${GOOGLE_STANDARD_RESULT_SELECTOR} .kb0PBd.LnCrMe img {
  max-width: 100% !important;
  height: auto !important;
  object-fit: cover !important;
}
${GOOGLE_STANDARD_RESULT_SELECTOR} .iHxmLe {
  display: flex !important;
  width: 100% !important;
  max-width: 100% !important;
  min-width: 0 !important;
}
${GOOGLE_STANDARD_RESULT_SELECTOR} .iHxmLe .rIRoqf {
  flex: 0 0 auto !important;
  max-width: 40% !important;
}
${GOOGLE_STANDARD_RESULT_SELECTOR} .iHxmLe .rIRoqf .gY2b2c,
${GOOGLE_STANDARD_RESULT_SELECTOR} .iHxmLe .rIRoqf .AZJdrc,
${GOOGLE_STANDARD_RESULT_SELECTOR} .iHxmLe .rIRoqf .uhHOwf.BYbUcd {
  width: 100% !important;
  max-width: 100% !important;
}
${GOOGLE_STANDARD_RESULT_SELECTOR} .iHxmLe .fzUZNc,
${GOOGLE_STANDARD_RESULT_SELECTOR} .iHxmLe .ITZIwc {
  flex: 1 1 auto !important;
  min-width: 0 !important;
  max-width: 100% !important;
  overflow-wrap: anywhere !important;
}
${GOOGLE_STANDARD_RESULT_SELECTOR} .iHxmLe .uhHOwf.BYbUcd img {
  width: 100% !important;
  height: 100% !important;
  max-width: 100% !important;
  object-fit: cover !important;
}
${GOOGLE_FULL_WIDTH_RESULT_SELECTOR} {
  width: 100% !important;
  max-width: 100% !important;
  min-width: 0 !important;
  height: auto !important;
  max-height: none !important;
}
/* The native AI wrapper has a stale outer 30px margin that collapses through
   the imported full-width module. Keep all AI content and controls intact. */
${GOOGLE_AI_OVERVIEW_SELECTOR} > .MjjYud > .SePcAf {
  margin-bottom: 0 !important;
}
`

function qualifyCardSelector(selector: string, suffix: string): string {
  return splitSelectorList(selector)
    .map((part) => `${part.trim()}${suffix}`)
    .join(',\n')
}

function prefixCardSelector(selector: string, prefix: string, suffix: string): string {
  return splitSelectorList(selector)
    .map((part) => `${prefix} ${part.trim()}${suffix}`)
    .join(',\n')
}

function getCardHoverCSS(engine: string, mode: LayoutMode): string {
  const cardSelector = CARD_SELECTORS[engine]
  if (!cardSelector) return ''

  const cardPseudoSelector = qualifyCardSelector(cardSelector, '::before')
  const cardHoverPseudoSelector = qualifyCardSelector(cardSelector, ':hover::before')
  const scrollingHoverPseudoSelector = prefixCardSelector(
    cardSelector,
    'body.sb-scrolling',
    ':hover::before',
  )
  const reducedMotionCardSelector = mode === 'double'
    ? `${cardSelector},\n${prefixCardSelector(cardSelector, 'body.sb-double-layout', '')}`
    : cardSelector
  const transition = mode === 'double' && engine !== 'google'
    ? 'max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1)'
    : 'none'

  return `
${cardSelector} {
  position: relative !important;
  transition: ${transition} !important;
}
${cardPseudoSelector} {
  content: '';
  position: absolute;
  inset: 0;
  box-sizing: border-box;
  border: 1px solid rgba(248, 195, 135, 0.55);
  border-radius: inherit;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.16s ease;
}
@media (hover: hover) and (pointer: fine) {
  ${cardHoverPseudoSelector} {
    opacity: 1;
  }
  ${scrollingHoverPseudoSelector} {
    opacity: 0 !important;
  }
}
@media (prefers-reduced-motion: reduce) {
  ${reducedMotionCardSelector} {
    transition: none !important;
  }
  ${cardPseudoSelector} {
    transition: none;
  }
}
`
}

const BING_BASE_CSS = `
/* === LuminaSearch Bing Base Header Adjustments === */
#b_header {
  position: relative !important;
  z-index: 1001 !important;
  display: flex !important;
  flex-wrap: wrap !important;
  align-items: center !important;
  padding: 0 24px !important;
  box-sizing: border-box !important;
}
.sa_as {
  flex-wrap: nowrap !important;
}
#sb_form {
  display: flex !important;
  align-items: center !important;
  position: relative !important;
  z-index: 1001 !important;
  order: 2 !important;
  margin-left: 0 !important;
  margin-right: 0 !important;
}
.b_searchboxForm {
  display: inline-flex !important;
  align-items: center !important;
  align-self: center !important;
  flex: 1 1 auto !important;
  min-width: 0 !important;
}
#sw_as {
  position: absolute !important;
  left: 0 !important;
  top: 100% !important;
  width: 100% !important;
}
#est_switch {
  position: static !important;
  order: 1 !important;
  margin-left: auto !important;
  top: auto !important;
  height: auto !important;
  width: auto !important;
  margin-right: 16px !important;
  display: inline-flex !important;
  align-items: center !important;
  flex-shrink: 0 !important;
  border-radius: 20px !important;
  background-color: var(--luminasearch-bg-color, #f1f5f9) !important;
  padding: 4px !important;
  gap: 2px !important;
  z-index: 100 !important;
}
#id_h {
  order: 3 !important;
  position: static !important;
  margin-left: auto !important;
  right: auto !important;
  top: auto !important;
}
.b_scopebar {
  order: 4 !important;
  width: 100% !important;
}
#est_switch_keepH {
  display: none !important;
}
#est_cn, #est_en {
  display: inline-block !important;
  padding: 6px 16px !important;
  margin: 0 !important;
  border-radius: 20px !important;
  font-size: 13px !important;
  font-weight: 500 !important;
  cursor: pointer !important;
  white-space: nowrap !important;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
  line-height: 1.4 !important;
  letter-spacing: 0.3px !important;
  box-sizing: border-box !important;
  color: #333333 !important;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}
#est_cn.est_selected, #est_en.est_selected {
  background: #FEF3E2 !important;
  color: #9A3412 !important;
  box-shadow: inset 0 0 0 1px #F8C387 !important;
  font-weight: 600 !important;
}
#est_cn.est_unselected:hover, #est_en.est_unselected:hover {
  background: rgba(0, 0, 0, 0.05) !important;
  color: #000000 !important;
}
#est_cn:focus-visible, #est_en:focus-visible {
  outline: 2px solid #2563EB !important;
  outline-offset: 2px !important;
}
#est_cn[aria-disabled="true"], #est_en[aria-disabled="true"],
#est_cn[disabled], #est_en[disabled] {
  cursor: not-allowed !important;
  opacity: 0.55 !important;
  pointer-events: none !important;
}
.b_searchboxForm {
  display: inline-flex !important;
  align-items: center !important;
  align-self: center !important;
  flex: 1 1 auto !important;
  min-width: 0 !important;
}
#sb_form_q {
  flex: 1 1 auto !important;
}
.b_logoArea {
  display: inline-flex !important;
  align-items: center !important;
  vertical-align: middle !important;
  flex-shrink: 0 !important;
  margin-right: 16px !important;
  width: auto !important;
}
.b_logoArea h1.b_logo {
  margin: 0 !important;
}
body.b_pinhead .b_scopebar,
body.b_pinhead #est_switch,
body.b_pinhead #b_pole {
  display: none !important;
}
body.b_pinhead #b_header {
  height: 56px !important;
  padding-top: 0 !important;
  display: flex !important;
  align-items: center !important;
}
body.b_pinhead #sb_search {
  display: inline-block !important;
}
`

const BING_NESTED_RICH_CAPTION_CSS = `
/* === Remove Bing's duplicate outer tail from nested rich-result captions === */
#b_results > li.b_algo > .b_caption.b_rich,
#b_results > li.b_ans > .b_caption.b_rich,
#b_results > li.b_ad > .b_caption.b_rich {
  padding-bottom: 0 !important;
}
#b_results > li.b_algo > .b_caption.b_rich:empty,
#b_results > li.b_ans > .b_caption.b_rich:empty,
#b_results > li.b_ad > .b_caption.b_rich:empty {
  padding-top: 0 !important;
}
@media (max-width: 600px) {
  #b_results > :is(li.b_algo, li.b_ans, li.b_ad):has(> .b_caption.b_rich) > .b_imgcap_altitle .b_imgcap_main .tilk,
  #b_results > :is(li.b_algo, li.b_ans, li.b_ad):has(> .b_caption.b_rich) > .b_imgcap_altitle .b_imgcap_main .tptxt,
  #b_results > :is(li.b_algo, li.b_ans, li.b_ad):has(> .b_caption.b_rich) > .b_imgcap_altitle .b_imgcap_main .tpmeta,
  #b_results > :is(li.b_algo, li.b_ans, li.b_ad):has(> .b_caption.b_rich) > .b_imgcap_altitle .b_imgcap_main .b_attribution,
  #b_results > :is(li.b_algo, li.b_ans, li.b_ad):has(> .b_caption.b_rich) > .b_imgcap_altitle .b_imgcap_main cite {
    min-width: 0 !important;
    max-width: 100% !important;
  }
  #b_results > :is(li.b_algo, li.b_ans, li.b_ad):has(> .b_caption.b_rich) > .b_imgcap_altitle .b_imgcap_main .b_attribution {
    width: 100% !important;
  }
  #b_results > :is(li.b_algo, li.b_ans, li.b_ad):has(> .b_caption.b_rich) > .b_imgcap_altitle .b_imgcap_main cite {
    white-space: normal !important;
    overflow-wrap: anywhere !important;
  }
  #b_results > :is(li.b_algo, li.b_ans, li.b_ad):has(> .b_caption.b_rich) > .b_imgcap_altitle .b_imgcap_main :is(.b_tpcn, .tilk, .tptxt) {
    height: auto !important;
    min-height: 0 !important;
  }
}
`

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
  transition: none !important;
  box-sizing: border-box !important;
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
  width: var(--luminasearch-bing-list-width) !important;
  margin: 0 auto !important;
}
body.b_pinhead #sb_form {
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

/* === Size the Google navigation viewport; shared CSS centers its real content === */
.HTOhZ {
  margin-left: auto !important;
  margin-right: auto !important;
  width: var(--luminasearch-google-list-width) !important;
  max-width: var(--luminasearch-google-list-width) !important;
}

/* === Card styling for Google results === */
${GOOGLE_STANDARD_RESULT_SELECTOR} {
  background: #ffffff !important;
  border-radius: 16px !important;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 10px 15px -3px rgba(0, 0, 0, 0.03) !important;
  border: 1px solid rgba(0, 0, 0, 0.04) !important;
  padding: 20px 24px !important;
  margin-bottom: 16px !important;
  transition: none !important;
  box-sizing: border-box !important;
  width: 100% !important;
}
${GOOGLE_FULL_WIDTH_RESULT_SELECTOR} {
  margin-bottom: 16px !important;
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
  transition: none !important;
  box-sizing: border-box !important;
  width: 100% !important;
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
  align-items: start !important;
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
  transition: none !important;
  box-sizing: border-box !important;
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
  width: min(972px, calc(100vw - 48px)) !important;
  margin: 0 auto !important;
}
body.b_pinhead #sb_form {
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
  transition: max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1) !important;
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

/* === Size the Google navigation viewport; shared CSS centers its real content === */
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
  align-items: start !important;
}

/* === Rich, media, question, ad and utility modules keep their native full row === */
${GOOGLE_FULL_WIDTH_RESULT_SELECTOR},
#rso > :not(.MjjYud):not(.ULSxyf) {
  grid-column: 1 / -1 !important;
}
${GOOGLE_FULL_WIDTH_RESULT_SELECTOR} {
  margin-bottom: 0 !important;
}

/* === Card styling for Google results === */
${GOOGLE_STANDARD_RESULT_SELECTOR} {
  background: #ffffff !important;
  border-radius: 16px !important;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 10px 15px -3px rgba(0, 0, 0, 0.03) !important;
  border: 1px solid rgba(0, 0, 0, 0.04) !important;
  padding: 20px 24px !important;
  transition: none !important;
  box-sizing: border-box !important;
  width: 100% !important;
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

/* === Google cards always use natural height in the grid === */
html.sb-double-layout ${GOOGLE_STANDARD_RESULT_SELECTOR} {
  max-height: none !important;
  overflow: visible !important;
  margin-bottom: 0 !important;
  transition: none !important;
}
@media (max-width: 760px) {
  #rso {
    grid-template-columns: minmax(0, 1fr) !important;
  }
  #rso > * {
    grid-column: 1 !important;
  }
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
  transition: none !important;
  box-sizing: border-box !important;
  width: 100% !important;
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
  transition: max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1) !important;
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

export function createLayoutStyle(
  engine: EngineAdapter['name'],
  mode: LayoutMode,
): string {
  let css = ''
  if (engine === 'bing' && mode !== 'original') {
    css += BING_BASE_CSS
    css += BING_NAVIGATION_CSS
    css += BING_NESTED_RICH_CAPTION_CSS
  }
  if (engine === 'google' && mode !== 'original') {
    css += GOOGLE_NAVIGATION_CSS
    css += GOOGLE_RESULT_FLOW_CSS
    css += GOOGLE_COMPACT_HEADER_CSS
  }

  if (mode === 'single') {
    switch (engine) {
      case 'bing':
        css += BING_SINGLE_CSS
        break
      case 'google':
        css += GOOGLE_SINGLE_CSS
        break
      case 'baidu':
        css += BAIDU_SINGLE_CSS
        break
    }
  } else if (mode === 'double') {
    switch (engine) {
      case 'bing':
        css += BING_DOUBLE_CSS
        break
      case 'google':
        css += GOOGLE_DOUBLE_CSS
        break
      case 'baidu':
        css += BAIDU_DOUBLE_CSS
        break
    }
  }
  if (mode !== 'original') {
    css += getCardHoverCSS(engine, mode)
  }
  return css
}

const NAVIGATION_TARGETS: Partial<Record<EngineAdapter['name'], {
  container: string
  content: string
}>> = {
  bing: { container: '.b_scopebar', content: ':scope > ul' },
  google: { container: '.HTOhZ', content: ':scope > .EDblX' },
}

let navigationObserver: MutationObserver | null = null
let navigationTimer: number | null = null
let navigationStartTimer: number | null = null
let navigationContainer: HTMLElement | null = null
let navigationResizeHandler: (() => void) | null = null

function centerNavigation() {
  if (!navigationContainer) return
  navigationContainer.scrollLeft = getCenteredNavigationScrollLeft(
    navigationContainer.clientWidth,
    navigationContainer.scrollWidth,
  )
}

function scheduleNavigationCentering() {
  if (navigationTimer !== null) return
  navigationTimer = window.setTimeout(() => {
    navigationTimer = null
    centerNavigation()
  }, 0)
}

function startNavigationWatcher(engine: EngineAdapter['name']) {
  stopNavigationWatcher()
  const target = NAVIGATION_TARGETS[engine]
  if (!target) return

  const container = document.querySelector<HTMLElement>(target.container)
  const content = container?.querySelector<HTMLElement>(target.content)
  if (!container || !content) {
    navigationStartTimer = window.setTimeout(() => {
      navigationStartTimer = null
      startNavigationWatcher(engine)
    }, 100)
    return
  }

  navigationContainer = container
  navigationObserver = new MutationObserver(scheduleNavigationCentering)
  navigationObserver.observe(content, {
    attributes: true,
    attributeFilter: ['class', 'style', 'aria-hidden', 'aria-expanded'],
    childList: true,
    subtree: true,
  })
  navigationResizeHandler = scheduleNavigationCentering
  window.addEventListener('resize', navigationResizeHandler, { passive: true })
  scheduleNavigationCentering()
}

function stopNavigationWatcher() {
  navigationObserver?.disconnect()
  navigationObserver = null
  if (navigationResizeHandler) {
    window.removeEventListener('resize', navigationResizeHandler)
    navigationResizeHandler = null
  }
  if (navigationStartTimer !== null) {
    window.clearTimeout(navigationStartTimer)
    navigationStartTimer = null
  }
  if (navigationTimer !== null) {
    window.clearTimeout(navigationTimer)
    navigationTimer = null
  }
  navigationContainer = null
}

let doubleLayoutObserver: MutationObserver | null = null
let doubleLayoutTimer: number | null = null
let documentClickBound = false

function handleClickAway(e: Event) {
  const target = e.target as Element | null
  if (target?.closest('.sb-processed')) return

  document.querySelectorAll('.sb-processed.expanded').forEach((el) => {
    const castEl = el as HTMLElement
    castEl.classList.remove('expanded')
    castEl.style.maxHeight = '280px'
  })
}

function bindClickAway() {
  if (documentClickBound) return
  documentClickBound = true
  document.addEventListener('click', handleClickAway)
}

function unbindClickAway() {
  if (!documentClickBound) return
  documentClickBound = false
  document.removeEventListener('click', handleClickAway)
}

function processDoubleLayoutCards(cards: Iterable<HTMLElement>) {
  for (const card of cards) {
    const hasProcessed = card.classList.contains('sb-processed')
    if (hasProcessed && card.classList.contains('can-expand')) continue

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
  }
}

function runDoubleLayoutProcessor(adapter: EngineAdapter) {
  if (currentMode !== 'double') return
  const container = document.querySelector(adapter.selectors.pageContent)
  if (container) {
    processDoubleLayoutCards(
      container.querySelectorAll<HTMLElement>(adapter.selectors.resultItem),
    )
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

function isOwnAddedNode(node: Node): boolean {
  return node.nodeType === 1 && isDoubleLayoutExtendNode(node)
}

function collectDoubleLayoutCards(
  mutations: MutationRecord[],
  itemSelector: string,
): Set<HTMLElement> {
  const cards = new Set<HTMLElement>()

  for (const mutation of mutations) {
    const onlyOwnAddedNodes = mutation.addedNodes.length > 0
      && [...mutation.addedNodes].every(isOwnAddedNode)
    if ((!onlyOwnAddedNodes || mutation.removedNodes.length > 0)
      && mutation.target.nodeType === 1) {
      const parentCard = (mutation.target as Element).closest<HTMLElement>(itemSelector)
      if (parentCard) cards.add(parentCard)
    }

    for (const node of mutation.addedNodes) {
      if (isDoubleLayoutExtendNode(node) || node.nodeType !== 1) continue
      const element = node as HTMLElement
      if (element.matches(itemSelector)) cards.add(element)
      element.querySelectorAll<HTMLElement>(itemSelector).forEach((card) => cards.add(card))
      const parentCard = element.closest<HTMLElement>(itemSelector)
      if (parentCard) cards.add(parentCard)
    }
  }

  return cards
}

function startDoubleLayoutWatcher(adapter: EngineAdapter) {
  stopDoubleLayoutWatcher()
  runDoubleLayoutProcessor(adapter)

  let pendingCards = new Set<HTMLElement>()

  doubleLayoutObserver = new MutationObserver((mutations) => {
    const addedCards = collectDoubleLayoutCards(
      mutations,
      adapter.selectors.resultItem,
    )
    if (addedCards.size === 0) return

    for (const card of addedCards) pendingCards.add(card)

    if (doubleLayoutTimer !== null) {
      clearTimeout(doubleLayoutTimer)
    }
    doubleLayoutTimer = window.setTimeout(() => {
      doubleLayoutTimer = null
      const cards = [...pendingCards]
      pendingCards = new Set<HTMLElement>()
      processDoubleLayoutCards(cards)
      bindClickAway()
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
  unbindClickAway()
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
  const css = createLayoutStyle(engine as EngineAdapter['name'], mode)
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
      updateGoogleCompactHeaderForScroll()
      startNavigationWatcher(adapter.name)
      if (mode === 'double' && adapter.name !== 'google') {
        document.documentElement.classList.add('sb-double-layout')
        startDoubleLayoutWatcher(adapter)
      } else if (mode === 'double') {
        document.documentElement.classList.add('sb-double-layout')
      }
    }
  },

  onConfigChange(config: AppConfig) {
    if (!currentAdapter) return
    const mode = config.engines[currentAdapter.name].layout
    if (mode === currentMode) {
      return
    }

    // Cleanup double layout specific states
    document.documentElement.classList.remove('sb-double-layout')
    stopNavigationWatcher()
    stopDoubleLayoutWatcher()
    cleanDoubleLayoutCards()

    if (mode === 'original') {
      remove()
      document.documentElement.classList.remove(GOOGLE_COMPACT_HEADER_CLASS)
    } else {
      inject(currentAdapter.name, mode)
      updateGoogleCompactHeaderForScroll()
      startNavigationWatcher(currentAdapter.name)
      if (mode === 'double' && currentAdapter.name !== 'google') {
        document.documentElement.classList.add('sb-double-layout')
        startDoubleLayoutWatcher(currentAdapter)
      } else if (mode === 'double') {
        document.documentElement.classList.add('sb-double-layout')
      }
    }
  },

  destroy() {
    currentAdapter = null
    document.documentElement.classList.remove('sb-double-layout')
    document.documentElement.classList.remove(GOOGLE_COMPACT_HEADER_CLASS)
    stopNavigationWatcher()
    stopDoubleLayoutWatcher()
    cleanDoubleLayoutCards()
    remove()
  },
}
