import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const target = env.VITE_PROXY_TARGET || env.PROXY_TARGET || 'http://localhost:4000'

  return {
    plugins: [react()],
    build: {
      cssMinify: false
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target,
          changeOrigin: true,
          secure: false
        },
        '/uploads': {
          target,
          changeOrigin: true,
          secure: false
        }
      }
    }
  }
})
