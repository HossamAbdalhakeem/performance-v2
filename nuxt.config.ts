import Aura from '@primevue/themes/aura';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/content',
    '@nuxt/eslint',
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss',
    '@primevue/nuxt-module',
    '@vee-validate/nuxt',
    '@nuxtjs/robots',
    '@nuxtjs/sitemap',
    'nuxt-schema-org',
  ],
  css: ['~/assets/css/tailwind.css'],
  vite: {
    optimizeDeps: {
      include: ['cropperjs'],
    },
  },
  app: {
    head: {
      htmlAttrs: { class: 'app-dark', lang: 'ar', dir: 'rtl' },
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'shortcut icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', href: '/favicon.ico' },
      ],
      meta: [
        { name: 'google-site-verification', content: 'p8nu92PVNlSJHyCctN8Da3D6FhUDqxycWVSR15lqUl8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
    },
  },
  primevue: {
    options: {
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: '.app-dark',
        },
      },
    },
  },
  experimental: {
    payloadExtraction: false,
  },
  ssr: false,
  routeRules: {
    '/**': { ssr: false },
  },
  devtools: { enabled: true },
  compatibilityDate: '2024-04-03',
  // Site config used by @nuxtjs/robots & @nuxtjs/sitemap
  // (NUXT_PUBLIC_SITE_URL comes from .env, set the real domain in production)
  site: {
    url: process.env.NUXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'http://localhost:8000',
  },
  devServer: {
    port: 8000,
  },
  robots: {
    // Only /login is blocked from crawlers
    disallow: ['/login'],
  },
  runtimeConfig: {
    public: {
      baseUrl: process.env.NUXT_ENV_BASE_URL || 'http://localhost:8000',
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL,
      paymentScreenshotMaxBytes: Number(
        process.env.NUXT_PUBLIC_PAYMENT_SCREENSHOT_MAX_BYTES || 204800,
      ),
    },
  },

})