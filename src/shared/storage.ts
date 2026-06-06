import type { AppConfig } from './types'
import { defaultConfig } from './defaults'

const STORAGE_KEY = 'searchbeauti_config'

export async function loadConfig(): Promise<AppConfig> {
  const result = await chrome.storage.sync.get(STORAGE_KEY)
  if (result[STORAGE_KEY]) {
    return deepMerge(defaultConfig, result[STORAGE_KEY])
  }
  return { ...defaultConfig }
}

export async function saveConfig(config: AppConfig): Promise<void> {
  await chrome.storage.sync.set({ [STORAGE_KEY]: config })
}

export function onConfigChanged(callback: (config: AppConfig) => void): () => void {
  const handler = (
    changes: Record<string, chrome.storage.StorageChange>,
    areaName: string,
  ) => {
    if (areaName === 'sync' && changes[STORAGE_KEY]) {
      const newConfig = deepMerge(defaultConfig, changes[STORAGE_KEY].newValue ?? {})
      callback(newConfig)
    }
  }
  chrome.storage.onChanged.addListener(handler)
  return () => chrome.storage.onChanged.removeListener(handler)
}

function deepMerge<T extends Record<string, unknown>>(defaults: T, overrides: T): T {
  const result = { ...defaults } as Record<string, unknown>
  for (const key of Object.keys(overrides)) {
    const dv = defaults[key]
    const ov = overrides[key]
    if (isObject(dv) && isObject(ov)) {
      result[key] = deepMerge(dv as Record<string, unknown>, ov as Record<string, unknown>)
    } else if (ov !== undefined) {
      result[key] = ov
    }
  }
  return result as T
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
