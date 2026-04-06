import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/dealerships': 'http://127.0.0.1:8000',
      '/cars': 'http://127.0.0.1:8000',
      '/export': 'http://127.0.0.1:8000',
      '/import': 'http://127.0.0.1:8000',
    },
  },
})
