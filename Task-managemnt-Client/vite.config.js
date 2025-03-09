import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8082',  // Make sure this points to the correct backend port
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')  // Remove the /api prefix when making the request to the backend
      }
    }
  }
});
