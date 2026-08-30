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
  ssr: true,
  // routeRules: {
  //   // '/': { ssr: true },
  //   '/privacy': { ssr: false },
  //   // '/creators': { ssr: true },
  //   // '/notifications': { ssr: true },
  // },
  devtools: { enabled: true },
  compatibilityDate: '2024-04-03',
  runtimeConfig: {
    public: {
      baseUrl: process.env.NUXT_ENV_BASE_URL,
      organizationId: process.env.NUXT_ENV_ORGANIZATION_ID,
      fundraiserId: process.env.NUXT_ENV_FUNDRAISER_ID,
    },
  },

})