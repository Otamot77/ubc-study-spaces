import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Phone uses Vite's Network URL; requests remain same-origin to the browser.
      '/api': 'http://127.0.0.1:8787',
    },
  },
})
