import type { EngineAdapter } from '../../shared/types'

export const googleAdapter: EngineAdapter = {
  name: 'google',
  match: (url: string) => /\.google\.com\//.test(url),
  isSearchPage: (url: string) => /\.google\.com\/search\?/.test(url),
  selectors: {
    resultItem: '#rso .MjjYud',
    resultLink: 'h3',
    resultTitle: 'h3',
    resultSnippet: '.VwiC3b',
    faviconAnchor: 'cite',
    nextPageLink: '#pnnext',
    pageContent: '#rso',
    sidebar: '#rhs',
  },
}
