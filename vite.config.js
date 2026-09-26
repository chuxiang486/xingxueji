import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    proxy: {
      '/music': {
        target: 'http://music.026924.xyz',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/music/, ''),
      },
    },
  },
})
