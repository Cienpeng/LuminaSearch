import type { EngineAdapter, ResultLayoutKind } from '../../shared/types'

export interface GoogleResultSignals {
  isDirectChild: boolean
<<<<<<< HEAD
  isRichWrapper: boolean
  hasLink: boolean
  hasTitle: boolean
  hasSnippet: boolean
=======
  isOrganicResult: boolean
  isRichWrapper: boolean
  hasLink: boolean
  hasTitle: boolean
>>>>>>> develop
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
<<<<<<< HEAD
    || (!signals.hasSnippet && !signals.hasOrganicVideoBody)
=======
    || (!signals.isOrganicResult && !signals.hasOrganicVideoBody)
>>>>>>> develop
    || signals.hasKnowledgePanel
    || signals.hasTextAd
  ) return 'full-width'
  return 'standard'
}

export function classifyGoogleResult(result: Element): ResultLayoutKind {
  return classifyGoogleResultSignals({
    isDirectChild: result.parentElement?.id === 'rso',
<<<<<<< HEAD
    isRichWrapper: result.classList.contains('ULSxyf'),
    hasLink: Boolean(result.querySelector('a')),
    hasTitle: Boolean(result.querySelector('h3')),
    hasSnippet: Boolean(result.querySelector('.VwiC3b')),
=======
    isOrganicResult: result.matches(GOOGLE_ORGANIC_RESULT_SELECTOR),
    isRichWrapper: result.classList.contains('ULSxyf'),
    hasLink: Boolean(result.querySelector('a')),
    hasTitle: Boolean(result.querySelector('h3')),
>>>>>>> develop
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

<<<<<<< HEAD
export const GOOGLE_STANDARD_RESULT_SELECTOR = [
  '#rso > .MjjYud:has(h3)',
  ':is(:has(.VwiC3b), :has(.iHxmLe .ITZIwc))',
=======
/**
 * Google keeps ordinary results in an A6K0A result slot, then wraps the
 * rendered result body in a wHYlTd element. The title is the semantic anchor
 * that survives snippet-less, media, and hydrated result variants.
 */
export const GOOGLE_ORGANIC_RESULT_SELECTOR =
  '#rso > .MjjYud:has(> .A6K0A .wHYlTd h3)'

export const GOOGLE_STANDARD_RESULT_SELECTOR = [
  GOOGLE_ORGANIC_RESULT_SELECTOR,
>>>>>>> develop
  ':not(:has(.kp-blk))',
  ':not([data-text-ad])',
  ':not(:has([data-text-ad]))',
].join('')

export const GOOGLE_FULL_WIDTH_RESULT_SELECTOR = [
  '#rso > .ULSxyf',
<<<<<<< HEAD
  '#rso > .MjjYud:not(:has(h3))',
  '#rso > .MjjYud:not(:has(.VwiC3b)):not(:has(.iHxmLe .ITZIwc))',
=======
  `#rso > .MjjYud:not(:has(> .A6K0A .wHYlTd h3))`,
>>>>>>> develop
  '#rso > .MjjYud:has(.kp-blk)',
  '#rso > .MjjYud[data-text-ad]',
  '#rso > .MjjYud:has([data-text-ad])',
].join(',\n')

export const GOOGLE_AI_OVERVIEW_SELECTOR = '#rso > .ULSxyf:has(.SePcAf .h7Tj7e)'

<<<<<<< HEAD
const GOOGLE_PLACEHOLDER_GIF = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='
const GOOGLE_IMPORTED_MEDIA_SELECTOR = [
  '.kb0PBd.LnCrMe .uhHOwf img[data-deferred]',
  '.iHxmLe .uhHOwf.BYbUcd img[data-deferred]',
  '.ULSxyf img[data-src]',
].join(', ')

=======
export const GOOGLE_PLACEHOLDER_GIF = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='
const GOOGLE_MEDIA_PROCESSED_ATTRIBUTE = 'data-luminasearch-google-media-processed'
export const GOOGLE_IMPORTED_MEDIA_SELECTOR = [
  '.uhHOwf img[data-deferred], .uhHOwf img[data-src], .uhHOwf img[data-srcset], .uhHOwf img[data-lazy-src]',
  '.uhHOwf source[data-src], .uhHOwf source[data-srcset], .uhHOwf video[data-src], .uhHOwf video[data-poster]',
  '.kb0PBd.LnCrMe .uhHOwf img[data-deferred]',
  '.iHxmLe .uhHOwf.BYbUcd img[data-deferred]',
  '.ULSxyf img[data-src], .ULSxyf img[data-srcset], .ULSxyf source[data-srcset]',
].join(', ')

export function isGooglePlaceholderMediaSource(source: string | null | undefined): boolean {
  return !source || source.trim() === GOOGLE_PLACEHOLDER_GIF
}

interface GoogleMediaLoadState {
  currentSrc: string | null
  src: string | null
  complete: boolean
  naturalWidth: number
}

export function shouldRestoreGoogleImportedMedia(state: GoogleMediaLoadState): boolean {
  return isGooglePlaceholderMediaSource(state.currentSrc || state.src)
    || !state.complete
    || state.naturalWidth === 0
}

>>>>>>> develop
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

<<<<<<< HEAD
=======
export function normalizeGoogleImportedMediaSrcset(
  source: string | null | undefined,
  responseUrl: string,
): string | null {
  if (!source?.trim()) return null

  const candidates = source.split(',').map((candidate) => {
    const match = candidate.trim().match(/^(\S+)(\s+.*)?$/)
    if (!match) return null
    const url = normalizeGoogleImportedMediaSource(match[1], responseUrl, true)
    return url ? `${url}${match[2] ?? ''}` : null
  }).filter((candidate): candidate is string => Boolean(candidate))

  return candidates.length > 0 ? candidates.join(', ') : null
}

>>>>>>> develop
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

<<<<<<< HEAD
=======
function getGoogleMediaDataSource(element: Element): string | null {
  return element.getAttribute('data-src')
    ?? element.getAttribute('data-lazy-src')
    ?? element.getAttribute('data-original')
    ?? element.getAttribute('data-iurl')
    ?? element.getAttribute('data-url')
}

function getGoogleMediaVideoSource(element: Element): string | null {
  return element.closest('.AZJdrc')
    ?.querySelector<HTMLElement>('.VYkpsb[data-url]')
    ?.getAttribute('data-url') ?? null
}

function markGoogleMediaProcessed(element: Element) {
  element.setAttribute(GOOGLE_MEDIA_PROCESSED_ATTRIBUTE, '1')
}

function activateGoogleMediaElement(
  element: Element,
  responseUrl: string,
  hydrationSources: Map<string, string>,
) {
  if (element.getAttribute(GOOGLE_MEDIA_PROCESSED_ATTRIBUTE) === '1') return

  const hydratedSource = element.id ? hydrationSources.get(element.id) ?? null : null
  const dataSrc = getGoogleMediaDataSource(element)
  const srcset = normalizeGoogleImportedMediaSrcset(
    element.getAttribute('data-srcset'),
    responseUrl,
  )
  const isImage = element instanceof HTMLImageElement
  const isSource = element instanceof HTMLSourceElement
  const isVideo = element instanceof HTMLVideoElement

  if (isSource) {
    if (srcset) element.setAttribute('srcset', srcset)
    const source = chooseGoogleImportedMediaSource({
      dataSrc,
      videoUrl: getGoogleMediaVideoSource(element),
      hydratedSource,
    }, responseUrl)
    if (source) element.setAttribute('src', source)
    markGoogleMediaProcessed(element)
    return
  }

  if (isVideo) {
    const source = chooseGoogleImportedMediaSource({
      dataSrc,
      videoUrl: getGoogleMediaVideoSource(element),
      hydratedSource,
    }, responseUrl)
    if (source && (!element.getAttribute('poster') || element.getAttribute('data-poster'))) {
      element.setAttribute('poster', source)
    }
    markGoogleMediaProcessed(element)
    return
  }

  if (!isImage) {
    markGoogleMediaProcessed(element)
    return
  }

  const imageState = {
    currentSrc: element.currentSrc,
    src: element.getAttribute('src'),
    complete: element.complete,
    naturalWidth: element.naturalWidth,
  }
  if (!srcset && !shouldRestoreGoogleImportedMedia(imageState)) {
    markGoogleMediaProcessed(element)
    return
  }

  if (srcset) element.setAttribute('srcset', srcset)

  const source = chooseGoogleImportedMediaSource({
    dataSrc,
    videoUrl: getGoogleMediaVideoSource(element),
    hydratedSource,
  }, responseUrl)
  if (!source) {
    markGoogleMediaProcessed(element)
    return
  }

  const fallback = element.cloneNode(true) as HTMLImageElement
  fallback.setAttribute(GOOGLE_MEDIA_PROCESSED_ATTRIBUTE, '1')
  const handleLoad = () => element.removeEventListener('error', handleError)
  const handleError = () => {
    element.removeEventListener('load', handleLoad)
    element.replaceWith(fallback)
  }
  element.addEventListener('load', handleLoad, { once: true })
  element.addEventListener('error', handleError, { once: true })
  element.decoding = 'async'
  if (!element.getAttribute('loading')) element.loading = 'lazy'
  element.setAttribute('data-deferred', '2')
  element.setAttribute('src', source)
  markGoogleMediaProcessed(element)
}

>>>>>>> develop
function activateGoogleImportedMedia(
  results: HTMLElement[],
  responseUrl: string,
  sourceDocument: Document,
) {
  const hydrationSources = extractGoogleHydratedMediaSources(
    [...sourceDocument.scripts].map((script) => script.textContent || ''),
  )

  for (const result of results) {
<<<<<<< HEAD
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
=======
    const media = result.querySelectorAll(GOOGLE_IMPORTED_MEDIA_SELECTOR)
    for (const element of media) {
      activateGoogleMediaElement(element, responseUrl, hydrationSources)
>>>>>>> develop
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
