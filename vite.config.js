import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { localCatalog } from './scripts/local-catalog.js'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react(), localCatalog()],
  server: {
    proxy: {
      '/music': {
        target: 'http://music.026924.xyz',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/music/, ''),
        headers: { Referer: 'http://music.026924.xyz/' },
      },
    },
  },
})

