import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // This ensures that '@' points to your src folder for clean imports
      '@': path.resolve(__dirname, './src'),
    },
  },
  // R3F optimization: ensures heavy dependencies are pre-bundled
  optimizeDeps: {
    include: ['three', '@react-three/fiber', '@react-three/drei'],
  },
})