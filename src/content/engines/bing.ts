import type { EngineAdapter } from '../../shared/types'

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
}
