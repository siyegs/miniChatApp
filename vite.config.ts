// vite.config.ts

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // This will inject the necessary links into your index.html
      injectRegister: 'auto',
      
      // Caching strategies
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      },

      // The manifest file defines your PWA
      manifest: {
        name: 'ISK Chat Room',
        short_name: 'ISK Chat',
        description: 'A real-time chat application with private and global rooms.',
        theme_color: '#743fc9',
        background_color: '#2d3748',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ]
})