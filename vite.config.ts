import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({
  plugins: [react()],
  server: {
    // Listen on all interfaces so phones/tablets on the same LAN can open the dev URL
    host: true,
  },
})
