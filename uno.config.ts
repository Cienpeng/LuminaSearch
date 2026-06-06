import { defineConfig, presetWind, presetAttributify, presetIcons } from 'unocss'

export default defineConfig({
  presets: [
    presetWind(),
    presetAttributify(),
    presetIcons(),
  ],
  shortcuts: {
    'card': 'bg-white rounded-xl shadow-sm border border-gray-100 p-5',
    'toggle-label': 'text-sm font-medium text-gray-700 select-none',
    'section-title': 'text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3',
  },
  theme: {
    colors: {
      primary: {
        50: '#f0f4ff',
        100: '#dbe4ff',
        200: '#bac8ff',
        300: '#91a7ff',
        400: '#748ffc',
        500: '#5c7cfa',
        600: '#4c6ef5',
        700: '#4263eb',
        800: '#3b5bdb',
        900: '#364fc7',
      },
    },
  },
})
