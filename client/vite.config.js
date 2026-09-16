import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy all API calls and auth routes to Express in dev
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
      '/login': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
      '/auth/github': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
      '/logout': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
