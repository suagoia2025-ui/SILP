import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Aumentar el límite de advertencia de tamaño de chunk a 1000KB
    // Esto es normal para aplicaciones React con Material-UI y ReactFlow
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Separar vendor chunks para mejor caching
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'mui-vendor': ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
          'graph-vendor': ['reactflow', 'd3-force', 'dagre'],
        },
      },
    },
  },
})
