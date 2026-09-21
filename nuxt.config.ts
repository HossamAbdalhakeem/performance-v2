import { definePreset } from '@primevue/themes';
import Aura from '@primevue/themes/aura';

/** Brand gold — #f5af52 as the primary 500 stop */
const brandPrimary = {
  50: '#fef8ee',
  100: '#fcefd9',
  200: '#f9ddb2',
  300: '#f7c882',
  400: '#f6bb6a',
  500: '#f5af52',
  600: '#e09a3a',
  700: '#bc7d2c',
  800: '#976328',
  900: '#7a5124',
  950: '#422a11',
};

const BlackAura = definePreset(Aura, {
  semantic: {
    primary: brandPrimary,
    colorScheme: {
      dark: {
        surface: {
          0: '#ffffff',
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0a0a0a',
        },
        primary: {
          color: '{primary.400}',
          contrastColor: '#171717',
          hoverColor: '{primary.300}',
          activeColor: '{primary.200}',
        },
      },
      light: {
        primary: {
          color: '{primary.500}',
          contrastColor: '#171717',
          hoverColor: '{primary.600}',
          activeColor: '{primary.700}',
        },
      },
    },
  },
});

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/content',
    '@nuxt/eslint',
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss',
    '@primevue/nuxt-module',
    '@vee-validate/nuxt',
    'nuxt-security',
    '@nuxt/fonts',
  ],
  css: ['primeicons/primeicons.css', '~/assets/css/tailwind.css'],
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
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
    },
  },
  primevue: {
    options: {
      theme: {
        preset: BlackAura,
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

  devServer: {
    port: 8000,
  },

  runtimeConfig: {
    public: {
      baseUrl: process.env.NUXT_ENV_BASE_URL || 'http://localhost:8000',
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL,
      paymentScreenshotMaxBytes: Number(
        process.env.NUXT_PUBLIC_PAYMENT_SCREENSHOT_MAX_BYTES || 409600,
      ),
    },
  },
});