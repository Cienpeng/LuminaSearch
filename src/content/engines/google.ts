import type { EngineAdapter, ResultLayoutKind } from '../../shared/types'

export interface GoogleResultSignals {
  isDirectChild: boolean
  isRichWrapper: boolean
  hasLink: boolean
  hasTitle: boolean
  hasSnippet: boolean
  hasOrganicVideoBody: boolean
  hasKnowledgePanel: boolean
  hasTextAd: boolean
}

export function classifyGoogleResultSignals(
  signals: GoogleResultSignals,
): ResultLayoutKind {
  if (!signals.isDirectChild || !signals.hasLink) return 'ignore'
  if (
    signals.isRichWrapper
    || !signals.hasTitle
    || (!signals.hasSnippet && !signals.hasOrganicVideoBody)
    || signals.hasKnowledgePanel
    || signals.hasTextAd
  ) return 'full-width'
  return 'standard'
}

export function classifyGoogleResult(result: Element): ResultLayoutKind {
  return classifyGoogleResultSignals({
    isDirectChild: result.parentElement?.id === 'rso',
    isRichWrapper: result.classList.contains('ULSxyf'),
    hasLink: Boolean(result.querySelector('a')),
    hasTitle: Boolean(result.querySelector('h3')),
    hasSnippet: Boolean(result.querySelector('.VwiC3b')),
    hasOrganicVideoBody: Boolean(result.querySelector('.iHxmLe .ITZIwc')),
    hasKnowledgePanel: Boolean(result.querySelector('.kp-blk')),
    hasTextAd: result.hasAttribute('data-text-ad')
      || Boolean(result.querySelector('[data-text-ad]')),
  })
}

export const GOOGLE_RESULT_ITEM_SELECTOR = [
  '#rso > .MjjYud:has(a)',
  '#rso > .ULSxyf:has(a)',
].join(', ')

export const GOOGLE_STANDARD_RESULT_SELECTOR = [
  '#rso > .MjjYud:has(h3)',
  ':is(:has(.VwiC3b), :has(.iHxmLe .ITZIwc))',
  ':not(:has(.kp-blk))',
  ':not([data-text-ad])',
  ':not(:has([data-text-ad]))',
].join('')

export const GOOGLE_FULL_WIDTH_RESULT_SELECTOR = [
  '#rso > .ULSxyf',
  '#rso > .MjjYud:not(:has(h3))',
  '#rso > .MjjYud:not(:has(.VwiC3b)):not(:has(.iHxmLe .ITZIwc))',
  '#rso > .MjjYud:has(.kp-blk)',
  '#rso > .MjjYud[data-text-ad]',
  '#rso > .MjjYud:has([data-text-ad])',
].join(',\n')

export const GOOGLE_AI_OVERVIEW_SELECTOR = '#rso > .ULSxyf:has(.SePcAf .h7Tj7e)'

const GOOGLE_PLACEHOLDER_GIF = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='
const GOOGLE_IMPORTED_MEDIA_SELECTOR = [
  '.kb0PBd.LnCrMe .uhHOwf img[data-deferred]',
  '.iHxmLe .uhHOwf.BYbUcd img[data-deferred]',
  '.ULSxyf img[data-src]',
].join(', ')

function decodeGoogleScriptString(value: string): string {
  return value.replace(/\\(x[0-9a-f]{2}|u[0-9a-f]{4}|[\\'"nrtbfv])/gi, (match, escape) => {
    if (escape[0].toLowerCase() === 'x') {
      return String.fromCharCode(Number.parseInt(escape.slice(1), 16))
    }
    if (escape[0].toLowerCase() === 'u') {
      return String.fromCharCode(Number.parseInt(escape.slice(1), 16))
    }
    const characters: Record<string, string> = {
      '\\': '\\',
      "'": "'",
      '"': '"',
      n: '\n',
      r: '\r',
      t: '\t',
      b: '\b',
      f: '\f',
      v: '\v',
    }
    return characters[escape] ?? match
  })
}

export function extractGoogleHydratedMediaSources(
  scripts: Iterable<string>,
): Map<string, string> {
  const sources = new Map<string, string>()
  const assignmentPattern = /var s='((?:\\.|[^'])*)';var ii=\[([^\]]+)\];_setImagesSrc\(ii,s\)/g
  for (const script of scripts) {
    for (const match of script.matchAll(assignmentPattern)) {
      const source = decodeGoogleScriptString(match[1])
      for (const idMatch of match[2].matchAll(/['"]([^'"]+)['"]/g)) {
        sources.set(idMatch[1], source)
      }
    }
  }
  return sources
}

export function normalizeGoogleImportedMediaSource(
  source: string | null | undefined,
  responseUrl: string,
  allowMappedRasterData = false,
): string | null {
  const candidate = source?.trim()
  if (!candidate || candidate === GOOGLE_PLACEHOLDER_GIF) return null

  if (candidate.startsWith('data:')) {
    if (!allowMappedRasterData) return null
    return /^data:image\/(?:jpeg|png|webp);base64,[a-z0-9+/=\s]{256,}$/i.test(candidate)
      ? candidate
      : null
  }

  let baseUrl: URL
  let url: URL
  try {
    baseUrl = new URL(responseUrl)
    url = new URL(candidate, baseUrl)
  } catch {
    return null
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
  if (baseUrl.protocol === 'https:' && url.protocol !== 'https:') return null
  return url.href
}

interface GoogleMediaCandidate {
  dataSrc: string | null
  videoUrl: string | null
  hydratedSource: string | null
}

export function chooseGoogleImportedMediaSource(
  candidate: GoogleMediaCandidate,
  responseUrl: string,
): string | null {
  return normalizeGoogleImportedMediaSource(candidate.dataSrc, responseUrl)
    ?? normalizeGoogleImportedMediaSource(candidate.hydratedSource, responseUrl, true)
    ?? normalizeGoogleImportedMediaSource(candidate.videoUrl, responseUrl)
}

function activateGoogleImportedMedia(
  results: HTMLElement[],
  responseUrl: string,
  sourceDocument: Document,
) {
  const hydrationSources = extractGoogleHydratedMediaSources(
    [...sourceDocument.scripts].map((script) => script.textContent || ''),
  )

  for (const result of results) {
    const images = result.querySelectorAll<HTMLImageElement>(GOOGLE_IMPORTED_MEDIA_SELECTOR)
    for (const image of images) {
      const source = chooseGoogleImportedMediaSource({
        dataSrc: image.getAttribute('data-src'),
        videoUrl: image.closest('.AZJdrc')
          ?.querySelector<HTMLElement>('.VYkpsb[data-url]')
          ?.getAttribute('data-url') ?? null,
        hydratedSource: image.id ? hydrationSources.get(image.id) ?? null : null,
      }, responseUrl)
      if (!source || !image.parentNode) continue

      const fallback = image.cloneNode(true) as HTMLImageElement
      const handleLoad = () => image.removeEventListener('error', handleError)
      const handleError = () => {
        image.removeEventListener('load', handleLoad)
        image.replaceWith(fallback)
      }
      image.addEventListener('load', handleLoad, { once: true })
      image.addEventListener('error', handleError, { once: true })
      image.decoding = 'async'
      image.setAttribute('data-deferred', '2')
      image.src = source
    }
  }
}

export const googleAdapter: EngineAdapter = {
  name: 'google',
  match: (url: string) => /google\.[a-z.]+/.test(url),
  isSearchPage: (url: string) => /google\.[a-z.]+\/search($|\?|\/)/.test(url),
  selectors: {
    resultItem: GOOGLE_RESULT_ITEM_SELECTOR,
    standardResultItem: GOOGLE_STANDARD_RESULT_SELECTOR,
    resultLink: 'h3',
    resultTitle: 'h3',
    resultSnippet: '.VwiC3b',
    faviconAnchor: 'cite',
    nextPageLink: '#pnnext',
    pageContent: '#rso',
    sidebar: '#rhs',
  },
  classifyResult: classifyGoogleResult,
  prepareImportedResults: activateGoogleImportedMedia,
}
