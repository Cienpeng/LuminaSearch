import type { AppConfig } from './types'
import { createDefaultConfig, defaultConfig } from './defaults'

const STORAGE_KEY = 'luminasearch_config'
export const CONFIG_UPDATED_MESSAGE = 'luminasearch-config-updated'

export async function loadConfig(): Promise<AppConfig> {
  const result = await chrome.storage.sync.get(STORAGE_KEY)
  if (result[STORAGE_KEY]) {
    return mergeConfig(defaultConfig, result[STORAGE_KEY])
  }
  return createDefaultConfig()
}

export async function saveConfig(config: AppConfig): Promise<void> {
  await chrome.storage.sync.set({ [STORAGE_KEY]: config })
}

export function getConfigFingerprint(config: AppConfig): string {
  return JSON.stringify(config)
}

export function onConfigChanged(callback: (config: AppConfig) => void): () => void {
  const handler = (
    changes: Record<string, chrome.storage.StorageChange>,
    areaName: string,
  ) => {
    if (areaName === 'sync' && changes[STORAGE_KEY]) {
      const newConfig = mergeConfig(defaultConfig, changes[STORAGE_KEY].newValue ?? {})
      callback(newConfig)
    }
  }
  chrome.storage.onChanged.addListener(handler)
  return () => chrome.storage.onChanged.removeListener(handler)
}

export function mergeConfig(defaults: AppConfig, overrides: unknown): AppConfig {
  return deepMerge(defaults, isObject(overrides) ? overrides : {})
}

function deepMerge<T extends object>(defaults: T, overrides: Record<string, unknown>): T {
  const result = {} as Record<string, unknown>
  const defaultRecord = defaults as Record<string, unknown>
  for (const key of Object.keys(defaultRecord)) {
    const dv = defaultRecord[key]
    const ov = overrides[key]
    if (isObject(dv)) {
      result[key] = deepMerge(
        dv,
        isObject(ov) ? ov : {},
      )
    } else if (ov !== undefined) {
      result[key] = ov
    } else {
      result[key] = dv
    }
  }

  // Preserve forward-compatible keys that are not in the current defaults.
  for (const key of Object.keys(overrides)) {
    if (!(key in defaultRecord) && overrides[key] !== undefined) {
      result[key] = overrides[key]
    }
  }
  return result as T
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
