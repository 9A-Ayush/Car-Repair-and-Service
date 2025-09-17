import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    port: 3000,
    host: 'localhost',
    open: true
  },
  define: {
    'process.env.VITE_API_URL': JSON.stringify('http://localhost:5001')
  },
  build: {
    rollupOptions: {
      external: ['react-toastify']
    }
  }
})
