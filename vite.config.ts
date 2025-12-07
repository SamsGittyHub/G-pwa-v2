import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  // Load .env variables for dev/prod
  const env = loadEnv(mode, process.cwd(), '');

  const BACKEND_URL =
    mode === 'development'
      ? 'http://localhost:3000'
      : 'https://backend.tripleg.cloud';

  const GENIUS_URL =
    mode === 'development'
      ? 'http://localhost:8000/v1/chat/completions'
      : 'https://jupyter.tripleg.cloud/v1/chat/completions';

  return {
    server: {
      host: '::',
      port: 8080,
      allowedHosts: [
        'localhost',
        '127.0.0.1',
        'g-pwa-v2-production.up.railway.app', // Railway fix
      ],
    },

    define: {
      __BACKEND_URL__: JSON.stringify(BACKEND_URL),
      __GENIUS_URL__: JSON.stringify(GENIUS_URL),
    },

    plugins: [
      react(),

      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: [
          'favicon.png',
          'robots.txt',
          'pwa-192x192.png',
          'pwa-512x512.png',
        ],
        manifest: {
          name: 'TripleG Genius',
          short_name: 'TripleG',
          description:
            'Your intelligent AI chat assistant powered by custom AI models',
          theme_color: '#1a1a2e',
          background_color: '#1a1a2e',
          display: 'standalone',
          orientation: 'portrait',
          scope: '/',
          start_url: '/',
          id: '/',
          categories: ['productivity', 'utilities'],
          icons: [
            { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
            { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },

        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
          navigateFallback: '/index.html',
          navigateFallbackAllowlist: [/^(?!\/__).*/],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-webfonts',
                expiration: {
                  maxEntries: 30,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
      }),
    ],

    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  };
});
