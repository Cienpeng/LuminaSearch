import type { EngineAdapter } from '../../shared/types'

export const baiduAdapter: EngineAdapter = {
  name: 'baidu',
  match: (url: string) => /\.baidu\.com\//.test(url),
  isSearchPage: (url: string) => /\.baidu\.com\/s\?/.test(url),
  selectors: {
    resultItem: '#content_left .result',
    resultLink: 'h3 a',
    resultTitle: 'h3',
    resultSnippet: '.c-abstract',
    faviconAnchor: '.c-showurl',
    nextPageLink: '#page a.n:last-of-type',
    pageContent: '#content_left',
    sidebar: '#content_right',
  },
}
