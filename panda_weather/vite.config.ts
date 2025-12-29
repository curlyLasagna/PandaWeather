import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
    server: {
    allowedHosts: ['1fd7a091a5b1.ngrok-free.app'],
    port: 5173 // Optional: specify port
  }
})
