import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.json'

export default defineConfig({
  base: './',
  build: {
    modulePreload: false,
  },
  plugins: [
    vue(),
    crx({ manifest }),
  ],
})
