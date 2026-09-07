import Aura from '@primevue/themes/aura';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/content',
    '@nuxt/eslint',
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss',
    '@primevue/nuxt-module',
  ],
  css: ['~/assets/css/tailwind.css'],
  app: {
    head: {
      htmlAttrs: { class: 'app-dark' },
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
  // ssr: true,
  routeRules: {
    '/': { ssr: true },
    '/privacy': { prerender: true },
    '/products/**': { isr: 3600 },
    '/shop/**': { prerender: true },
    '/how/**': { prerender: true },
    '/features/**': { prerender: true },
    '/products/preview/**': { ssr: true },
    // Creators list stays ISR (cached, rebuilt hourly), while creator
    // detail pages render on the server: the details component fetches
    // the web-clients API through useFetch and Nuxt waits for it during
    // SSR before sending the HTML
    '/creators': { isr: 3600 },
    '/creators/**': { ssr: true },
    '/notifications': { ssr: true },
  },
  devtools: { enabled: true },
  compatibilityDate: '2024-04-03',
  runtimeConfig: {
    public: {
      baseUrl: process.env.NUXT_ENV_BASE_URL || process.env.BASE_URL,
      organizationId: process.env.NUXT_ENV_ORGANIZATION_ID || process.env.ORGANIZATION_ID,
      fundraiserId: process.env.NUXT_ENV_FUNDRAISER_ID || process.env.FUNDRAISER_ID,
    },
  },

})