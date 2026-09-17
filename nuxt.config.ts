// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: {
    enabled: true
  },
  modules: ['@nuxtjs/color-mode', 'nuxt-auth-utils', '@vee-validate/nuxt'],
  colorMode: {
    preference: 'light',
    fallback: 'dark',
    storage: 'cookie',
    storageKey: 'color-mode',
  },
  imports: {
    dirs: ['validation']
  },
  components: [
    {path: '~/components/auth', pathPrefix: false}
  ],
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [
      tailwindcss(),
    ]
  }
})