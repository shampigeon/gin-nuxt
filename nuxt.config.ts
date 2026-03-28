export default defineNuxtConfig({
  compatibilityDate: '2024-07-02',
  ssr: true,
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:7070'
    }
  },
  app: {
    head: {
      title: 'GIN Nuxt',
      titleTemplate: '%s | GIN Nuxt',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: 'Nuxt SSR frontend for classifieds backed by gin-content.'
        }
      ],
      link: [
        {
          rel: 'stylesheet',
          href: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css'
        }
      ]
    }
  }
})
