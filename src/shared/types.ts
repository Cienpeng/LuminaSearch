export type EngineName = 'baidu' | 'google' | 'bing'

export type LayoutMode = 'original' | 'single' | 'double' | 'triple'

export type DarkModeSetting = 'auto' | 'on' | 'off'

export interface EyeProtectionConfig {
  enabled: boolean
  color: string
  opacity: number
}

export interface EngineConfig {
  enabled: boolean
  layout: LayoutMode
  favicon: boolean
  autoPagination: boolean
  eyeProtection: EyeProtectionConfig
  hideSidebar: boolean
  backgroundOptimize: boolean
}

export interface GlobalConfig {
  darkMode: DarkModeSetting
}

export interface AppConfig {
  global: GlobalConfig
  engines: Record<EngineName, EngineConfig>
}

export interface EngineAdapter {
  name: EngineName
  match: (url: string) => boolean
  isSearchPage: (url: string) => boolean
  selectors: {
    resultItem: string
    resultLink: string
    resultTitle: string
    resultSnippet: string
    faviconAnchor: string
    nextPageLink: string
    pageContent: string
    sidebar: string
  }
}

export interface Feature {
  name: string
  init?: (config: AppConfig, adapter: EngineAdapter) => void | Promise<void>
  processResults?: (results: HTMLElement[], adapter: EngineAdapter) => void
  onConfigChange?: (config: AppConfig) => void
  destroy?: () => void
}
