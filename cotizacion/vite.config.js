import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '192.168.0.104', // Cambia a la IP que quieras usar
    port: 4001,             // Cambia al puerto que prefieras
  },
})
