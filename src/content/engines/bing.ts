import type { EngineAdapter } from '../../shared/types'

interface BingLazyFaviconAttributes {
  dataSrc: string | null
  dataClass: string | null
  dataAlt: string | null
  dataWidth: string | null
  dataHeight: string | null
}

export interface BingFaviconImageAttributes {
  src: string
  className: string
  alt: string
  width: number | null
  height: number | null
}

function parsePositiveDimension(value: string | null): number | null {
  if (!value) return null
  const dimension = Number(value)
  return Number.isFinite(dimension) && dimension > 0 ? dimension : null
}

export function normalizeBingFaviconAttributes(
  attributes: BingLazyFaviconAttributes,
  responseUrl: string,
): BingFaviconImageAttributes | null {
  const source = attributes.dataSrc?.trim()
  if (!source) return null

  let baseUrl: URL
  let url: URL
  try {
    baseUrl = new URL(responseUrl)
    url = new URL(source, baseUrl)
  } catch {
    return null
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
  if (baseUrl.protocol === 'https:' && url.protocol !== 'https:') return null

  return {
    src: url.href,
    className: attributes.dataClass?.trim() || 'rms_img',
    alt: attributes.dataAlt ?? '',
    width: parsePositiveDimension(attributes.dataWidth),
    height: parsePositiveDimension(attributes.dataHeight),
  }
}

function activateBingImportedFavicons(results: HTMLElement[], responseUrl: string) {
  for (const result of results) {
    const placeholders = result.querySelectorAll<HTMLElement>(
      '.cico.siteicon > .rms_iac[data-src]',
    )
    for (const placeholder of placeholders) {
      const imageAttributes = normalizeBingFaviconAttributes({
        dataSrc: placeholder.getAttribute('data-src'),
        dataClass: placeholder.getAttribute('data-class'),
        dataAlt: placeholder.getAttribute('data-alt'),
        dataWidth: placeholder.getAttribute('data-width'),
        dataHeight: placeholder.getAttribute('data-height'),
      }, responseUrl)
      if (!imageAttributes || !placeholder.parentNode) continue

      const fallback = placeholder.cloneNode(true)
      const image = placeholder.ownerDocument.createElement('img')
      image.className = imageAttributes.className
      image.alt = imageAttributes.alt
      if (imageAttributes.width !== null) image.width = imageAttributes.width
      if (imageAttributes.height !== null) image.height = imageAttributes.height

      const handleLoad = () => image.removeEventListener('error', handleError)
      const handleError = () => {
        image.removeEventListener('load', handleLoad)
        image.replaceWith(fallback)
      }
      image.addEventListener('load', handleLoad, { once: true })
      image.addEventListener('error', handleError, { once: true })
      image.src = imageAttributes.src
      placeholder.replaceWith(image)
    }
  }
}

export const bingAdapter: EngineAdapter = {
  name: 'bing',
  match: (url: string) => /\.bing\.com\//.test(url),
  isSearchPage: (url: string) => /\.bing\.com\/search($|\?|\/)/.test(url),
  selectors: {
    resultItem: '#b_results > li.b_algo, #b_results > li.b_ans, #b_results > li.b_ad',
    resultLink: 'h2 > a',
    resultTitle: 'h2',
    resultSnippet: '.b_caption p',
    faviconAnchor: '.b_attribution cite',
    nextPageLink: 'a.sb_pagN',
    pageContent: '#b_results',
    sidebar: '#b_context, .richrswrapper, [aria-label="相关搜索"]',
  },
  prepareImportedResults: activateBingImportedFavicons,
}
