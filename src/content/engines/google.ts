import type { EngineAdapter } from '../../shared/types'

export const googleAdapter: EngineAdapter = {
  name: 'google',
  match: (url: string) => /google\.[a-z.]+/.test(url),
  isSearchPage: (url: string) => /google\.[a-z.]+\/search($|\?|\/)/.test(url),
  selectors: {
    resultItem: '#rso .MjjYud:has(a)',
    resultLink: 'h3',
    resultTitle: 'h3',
    resultSnippet: '.VwiC3b',
    faviconAnchor: 'cite',
    nextPageLink: '#pnnext',
    pageContent: '#rso',
    sidebar: '#rhs',
  },
}
