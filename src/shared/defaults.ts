import type { AppConfig, EngineConfig, GlobalConfig } from './types'

export const defaultGlobalConfig: GlobalConfig = {
  lang: 'en',
}

export const defaultEngineConfig: EngineConfig = {
  enabled: true,
  layout: 'original',
  favicon: false,
  autoPagination: false,
  eyeProtection: {
    enabled: false,
    color: '#c8e6c9',
    opacity: 0.15,
  },
  hideSidebar: false,
  backgroundOptimize: true,
}

export const engineLabels: Record<string, string> = {
  baidu: '百度',
  google: 'Google',
  bing: 'Bing',
}

export const engineIcons: Record<string, string> = {
  baidu: 'icons/baidu.svg',
  google: 'icons/google.svg',
  bing: 'icons/Bing.svg',
}

export const defaultConfig: AppConfig = {
  global: { ...defaultGlobalConfig },
  engines: {
    baidu: { ...defaultEngineConfig },
    google: { ...defaultEngineConfig },
    bing: { ...defaultEngineConfig },
  },
}
