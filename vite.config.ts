import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import os from 'node:os'

function lanOrigin(port: number) {
  const nets = os.networkInterfaces()
  const addresses: string[] = []
  for (const addrs of Object.values(nets)) {
    for (const addr of addrs ?? []) {
      const family = addr.family === 'IPv4' || addr.family === 4
      if (!family || addr.internal) continue
      addresses.push(addr.address)
    }
  }
  const preferred =
    addresses.find((ip) => ip.startsWith('192.168.')) ||
    addresses.find((ip) => ip.startsWith('10.')) ||
    addresses[0]
  return preferred ? `http://${preferred}:${port}` : ''
}

const port = 4900

// https://vitejs/config/
export default defineConfig({
  base: process.env.GITHUB_ACTIONS
    ? `/${process.env.GITHUB_REPOSITORY?.split('/')[1] || 'leylagames'}/`
    : '/',
  define: {
    __DEV_LAN_ORIGIN__: JSON.stringify(lanOrigin(port)),
  },
  plugins: [react()],
  server: {
    host: true,
    port,
    strictPort: true,
    allowedHosts: true,
  },
  preview: {
    host: true,
    port,
    strictPort: true,
    allowedHosts: true,
  },
})
