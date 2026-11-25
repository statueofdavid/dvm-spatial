import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production'

  return {
    plugins: [react()],

    resolve: {
      alias: {
        // Updated to use import.meta.dirname for Vite 8 ESM compliance
        '@': path.resolve(import.meta.dirname, './src'),
      },
    },

    // Pre-bundles heavy Three.js dependencies in dev
    optimizeDeps: {
      include: ['three', '@react-three/fiber', '@react-three/drei'],
      exclude: ['@electric-sql/pglite'],
    },

    // Local Development Proxy to backend on port 3000
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
        },
      },
    },

    // Production Build Hardening powered by Rolldown & Oxc
    build: {
      outDir: 'dist',
      sourcemap: false,
      chunkSizeWarningLimit: 1500,

      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) {
              return; // Keep your application code in app/entry chunks
            }

            // Group 3D graphics stack
            if (
              id.includes('three') ||
              id.includes('@react-three/fiber') ||
              id.includes('@react-three/drei')
            ) {
              return 'vendor-three';
            }

            // Group React engine
            if (
              id.includes('node_modules/react/') ||
              id.includes('node_modules/react-dom/') ||
              id.includes('scheduler')
            ) {
              return 'vendor-react';
            }

            // Isolate in-browser Postgres engine
            if (id.includes('@electric-sql/pglite')) {
              return 'vendor-pglite';
            }
          },
          entryFileNames: 'assets/[hash].js',
          chunkFileNames: 'assets/[hash].js',
          assetFileNames: 'assets/[hash].[ext]',
        },
      },
    }
  }
})