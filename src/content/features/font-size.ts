import type { AppConfig, EngineAdapter, Feature, LayoutMode } from '../../shared/types'
import { splitSelectorList } from './selector-list'

const STYLE_ID = 'luminasearch-font-size'
const DEFAULT_FONT_SIZE = 16
const MIN_FONT_SIZE = 12
const MAX_FONT_SIZE = 20

const TITLE_SCALE: Record<EngineAdapter['name'], number> = {
  baidu: 1.125,
  google: 1.25,
  bing: 1.25,
}
const AUXILIARY_SCALE = 0.875
const BASE_LINE_HEIGHT = 22
const TITLE_LINE_HEIGHT = 26
const CARD_PADDING_Y = 14
const CARD_MARGIN_BOTTOM = 16
const BING_COMPOUND_GAP = 48

let currentAdapter: EngineAdapter | null = null
let currentFontSize: number | null = null
let currentLayout: LayoutMode | null = null

function clampFontSize(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_FONT_SIZE
  return Math.max(MIN_FONT_SIZE, Math.min(MAX_FONT_SIZE, value))
}

export function getFontSizeScale(value: number): number {
  return clampFontSize(value) / DEFAULT_FONT_SIZE
}

function qualifySelector(parentSelector: string, childSelector: string): string {
  return splitSelectorList(parentSelector)
    .map((selector) => `${selector.trim()} ${childSelector}`)
    .join(',\n')
}

export function getFontSizeSelectors(adapter: EngineAdapter) {
  const cardSelector = adapter.selectors.standardResultItem
    ?? adapter.selectors.resultItem
  const googleTextSelector = adapter.name === 'google'
    ? [
      qualifySelector(cardSelector, 'h3'),
      qualifySelector(cardSelector, 'h3 *'),
      qualifySelector(cardSelector, '.VwiC3b'),
      qualifySelector(cardSelector, '.VwiC3b *'),
      qualifySelector(cardSelector, '.VuuXrf'),
      qualifySelector(cardSelector, 'cite'),
      qualifySelector(cardSelector, '.eFM0qc'),
      qualifySelector(cardSelector, '.ITZIwc'),
      qualifySelector(cardSelector, '.ITZIwc *'),
    ].join(',\n')
    : ''
  return {
    card: cardSelector,
    title: qualifySelector(cardSelector, adapter.selectors.resultTitle),
    snippet: qualifySelector(cardSelector, adapter.selectors.resultSnippet),
    auxiliary: adapter.name === 'bing'
      ? [
        qualifySelector(cardSelector, '.b_attribution'),
        qualifySelector(cardSelector, '.tptt'),
      ].join(',\n')
      : qualifySelector(cardSelector, adapter.selectors.faviconAnchor),
    siteLabel: adapter.name === 'bing'
      ? qualifySelector(cardSelector, '.tptt')
      : '',
    text: googleTextSelector || qualifySelector(
        cardSelector,
        ':where(*:not(img):not(svg):not(video):not(canvas))',
      ),
    favicon: qualifySelector(cardSelector, 'img.luminasearch-favicon'),
    expandButton: qualifySelector(cardSelector, '.sb-expand-btn'),
    compound: adapter.name === 'bing'
      ? [
        qualifySelector(cardSelector, '.b_deep'),
        qualifySelector(cardSelector, '.b_vlist2col'),
        qualifySelector(cardSelector, '.b_vList2col'),
      ].join(',\n')
      : '',
    deepLink: adapter.name === 'bing'
      ? qualifySelector(cardSelector, '.b_deep a:not(.b_moreLink)')
      : '',
    deepMoreLink: adapter.name === 'bing'
      ? [
        qualifySelector(cardSelector, '.b_deep.b_moreLink'),
        qualifySelector(cardSelector, '.b_deep a.b_moreLink'),
      ].join(',\n')
      : '',
    deepSnippet: adapter.name === 'bing'
      ? qualifySelector(cardSelector, '.b_deep p')
      : '',
  }
}

export function createFontSizeStyle(config: AppConfig, adapter: EngineAdapter): string {
  const fontSize = clampFontSize(config.engines[adapter.name].fontSize)
  const scale = getFontSizeScale(fontSize)
  const scalesCustomLayout = config.engines[adapter.name].layout !== 'original'
  const selectors = getFontSizeSelectors(adapter)

  return `
${selectors.card} {
  --luminasearch-result-font-size: ${fontSize}px;
  --luminasearch-result-scale: ${scale};
  --luminasearch-result-line-height: calc(${BASE_LINE_HEIGHT}px * var(--luminasearch-result-scale));
  --luminasearch-result-title-size: calc(var(--luminasearch-result-font-size) * ${TITLE_SCALE[adapter.name]});
  --luminasearch-result-title-line-height: calc(${TITLE_LINE_HEIGHT}px * var(--luminasearch-result-scale));
  --luminasearch-result-auxiliary-size: clamp(10px, calc(var(--luminasearch-result-font-size) * ${AUXILIARY_SCALE}), 18px);
  --luminasearch-result-card-padding-y: calc(${CARD_PADDING_Y}px * var(--luminasearch-result-scale));
  --luminasearch-result-card-margin-bottom: calc(${CARD_MARGIN_BOTTOM}px * var(--luminasearch-result-scale));
}
${selectors.card},
${selectors.text} {
  font-size: var(--luminasearch-result-font-size) !important;
  line-height: var(--luminasearch-result-line-height) !important;
}
${scalesCustomLayout ? `${selectors.card} {
  padding-top: var(--luminasearch-result-card-padding-y) !important;
  padding-bottom: var(--luminasearch-result-card-padding-y) !important;
  margin-bottom: var(--luminasearch-result-card-margin-bottom) !important;
}` : ''}
${selectors.title},
${qualifySelector(selectors.title, '*')} {
  font-size: var(--luminasearch-result-title-size) !important;
  line-height: var(--luminasearch-result-title-line-height) !important;
}
${selectors.snippet},
${qualifySelector(selectors.snippet, '*')} {
  font-size: var(--luminasearch-result-font-size) !important;
  line-height: var(--luminasearch-result-line-height) !important;
}
${selectors.auxiliary ? `${selectors.auxiliary},\n${qualifySelector(selectors.auxiliary, '*')} {\n  font-size: var(--luminasearch-result-auxiliary-size) !important;\n  line-height: var(--luminasearch-result-line-height) !important;\n}` : ''}
${scalesCustomLayout && selectors.compound ? `${selectors.compound} {\n  gap: calc(${BING_COMPOUND_GAP}px * var(--luminasearch-result-scale)) !important;\n  row-gap: calc(${BING_COMPOUND_GAP}px * var(--luminasearch-result-scale)) !important;\n  column-gap: calc(${BING_COMPOUND_GAP}px * var(--luminasearch-result-scale)) !important;\n}` : ''}
${selectors.deepLink ? `${selectors.deepLink} {\n  font-size: calc(var(--luminasearch-result-font-size) * 1.125) !important;\n  line-height: var(--luminasearch-result-line-height) !important;\n}` : ''}
${selectors.deepMoreLink ? `${selectors.deepMoreLink} {\n  font-size: var(--luminasearch-result-auxiliary-size) !important;\n  line-height: var(--luminasearch-result-line-height) !important;\n}` : ''}
${selectors.deepSnippet ? `${selectors.deepSnippet} {\n  font-size: var(--luminasearch-result-auxiliary-size) !important;\n  line-height: var(--luminasearch-result-line-height) !important;\n  ${scalesCustomLayout ? 'block-size: calc(44px * var(--luminasearch-result-scale)) !important;' : ''}\n}` : ''}
${selectors.siteLabel ? `${selectors.siteLabel} {\n  ${scalesCustomLayout ? 'block-size: calc(18px * var(--luminasearch-result-scale)) !important;' : ''}\n}` : ''}
${selectors.deepMoreLink ? `${selectors.deepMoreLink} {\n  ${scalesCustomLayout ? 'padding-bottom: calc(10px * var(--luminasearch-result-scale)) !important;' : ''}\n}` : ''}
${selectors.favicon} {
  width: clamp(16px, calc(20px * var(--luminasearch-result-scale)), 20px) !important;
  height: clamp(16px, calc(20px * var(--luminasearch-result-scale)), 20px) !important;
  padding: clamp(2px, calc(3px * var(--luminasearch-result-scale)), 3px) !important;
  margin-right: max(4px, calc(8px * var(--luminasearch-result-scale))) !important;
}
${selectors.expandButton} {
  width: clamp(24px, calc(26px * var(--luminasearch-result-scale)), 26px) !important;
  height: clamp(24px, calc(26px * var(--luminasearch-result-scale)), 26px) !important;
  bottom: max(8px, calc(10px * var(--luminasearch-result-scale))) !important;
  right: max(10px, calc(14px * var(--luminasearch-result-scale))) !important;
}
${qualifySelector(selectors.expandButton, 'svg')} {
  width: clamp(14px, calc(16px * var(--luminasearch-result-scale)), 16px) !important;
  height: clamp(14px, calc(16px * var(--luminasearch-result-scale)), 16px) !important;
}
`
}

function getStyleElement(): HTMLStyleElement {
  const existing = document.getElementById(STYLE_ID)
  if (existing instanceof HTMLStyleElement) return existing
  existing?.remove()

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.setAttribute('data-luminasearch', 'font-size')
  const container = document.head || document.documentElement
  container.appendChild(style)
  return style
}

function removeStyle() {
  document.getElementById(STYLE_ID)?.remove()
}

export const fontSizeFeature: Feature = {
  name: 'font-size',

  init(config: AppConfig, adapter: EngineAdapter) {
    currentAdapter = adapter
    currentFontSize = clampFontSize(config.engines[adapter.name].fontSize)
    currentLayout = config.engines[adapter.name].layout
    getStyleElement().textContent = createFontSizeStyle(config, adapter)
  },

  onConfigChange(config: AppConfig) {
    const adapter = currentAdapter
    if (!adapter) return
    const nextFontSize = clampFontSize(config.engines[adapter.name].fontSize)
    const nextLayout = config.engines[adapter.name].layout
    if (
      currentFontSize === nextFontSize
      && currentLayout === nextLayout
      && document.getElementById(STYLE_ID)
    ) return
    currentFontSize = nextFontSize
    currentLayout = nextLayout
    getStyleElement().textContent = createFontSizeStyle(config, adapter)
  },

  destroy() {
    currentAdapter = null
    currentFontSize = null
    currentLayout = null
    removeStyle()
  },
}
