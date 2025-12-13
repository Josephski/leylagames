import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/leylagames/' : '/',
  plugins: [react()],
  server: {
    host: true,
    port: 4900,
    strictPort: true,
  },
  preview: {
    host: true,
    port: 4900,
    strictPort: true,
  },
})
