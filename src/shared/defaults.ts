import type { AppConfig, EngineConfig, GlobalConfig } from './types'

export const defaultGlobalConfig: GlobalConfig = {
  lang: 'en',
}

export const defaultEngineConfig: EngineConfig = {
  enabled: true,
  layout: 'original',
  fontSize: 16,
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

export function createDefaultEngineConfig(): EngineConfig {
  return {
    ...defaultEngineConfig,
    eyeProtection: { ...defaultEngineConfig.eyeProtection },
  }
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

export function createDefaultConfig(): AppConfig {
  return {
    global: { ...defaultGlobalConfig },
    engines: {
      baidu: createDefaultEngineConfig(),
      google: createDefaultEngineConfig(),
      bing: createDefaultEngineConfig(),
    },
  }
}

export const defaultConfig: AppConfig = createDefaultConfig()
