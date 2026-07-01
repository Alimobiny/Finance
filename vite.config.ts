import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// base باید با نام ریپوی گیت‌هاب یکی باشد چون آدرس نهایی
// https://<user>.github.io/<repo>/ خواهد بود؛ در Milestone راه‌اندازی گیت اصلاح می‌شود.
const repoBase = process.env.VITE_BASE_PATH ?? '/qotbnama-app/'

export default defineConfig({
  base: repoBase,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/favicon.png'],
      manifest: {
        id: '/',
        name: 'قطب‌نما',
        short_name: 'قطب‌نما',
        description: 'سیستم مدیریت مالی، معاملاتی و برنامه روزانه شخصی',
        lang: 'fa',
        dir: 'rtl',
        start_url: '.',
        scope: '.',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#F3F1EC',
        theme_color: '#1A5276',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icons/maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // فقط شل اپ (JS/CSS/فونت/آیکون) پیش‌کش می‌شود؛ تماس‌های Drive/Google
        // هرگز نباید کش شوند چون توکن و داده زنده هستند.
        globPatterns: ['**/*.{js,css,html,woff,woff2,png,svg,ico}'],
        navigateFallbackDenylist: [/^\/?api\//],
        runtimeCaching: [],
      },
    }),
  ],
})
