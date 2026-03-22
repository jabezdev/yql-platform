import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    VitePWA({
      // Disabled in dev — service worker caching makes it hard to see changes.
      // Automatically active on production builds (bun run build / docker build).
      disable: mode === 'development',
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['YQL_LOGO.svg', 'YQL_LOGO_WHITE.svg'],
      manifest: {
        name: 'YQL — Young Quantum Leaders',
        short_name: 'YQL',
        description: 'The Young Quantum Leaders internal platform.',
        theme_color: '#0a1630',
        background_color: '#f0f9ff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/dashboard/overview',
        icons: [
          {
            src: '/YQL_LOGO.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
          // Add 192.png and 512.png to /public for full cross-browser icon support.
          // Generate from YQL_LOGO.svg at https://realfavicongenerator.net
        ],
      },
      workbox: {
        // Precache all built JS / CSS / HTML (app shell)
        globPatterns: ['**/*.{js,css,html,svg,ico,woff2}'],

        runtimeCaching: [
          {
            // Convex file storage — images and attachments uploaded by users
            urlPattern: /^https:\/\/.*\.convex\.cloud\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'convex-storage',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Google Fonts stylesheet (changes rarely)
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-css',
              expiration: { maxEntries: 10, maxAgeSeconds: 365 * 24 * 60 * 60 },
            },
          },
          {
            // Google Fonts binary files (immutable)
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-files',
              expiration: { maxEntries: 30, maxAgeSeconds: 365 * 24 * 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
}))
