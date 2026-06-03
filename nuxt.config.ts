export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: true },
  modules: ['@nuxtjs/google-fonts'],
  css: ['~/assets/css/main.css'],
  googleFonts: {
    families: {
      Inter: [400, 500, 600, 700, 800],
      Fredoka: [500, 600]
    },
    display: 'swap'
  },
  runtimeConfig: {
    mysql: {
      host: process.env.MYSQL_HOST || '127.0.0.1',
      port: Number(process.env.MYSQL_PORT || 3306),
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || 'casitaiedis',
      connectionLimit: Number(process.env.MYSQL_CONNECTION_LIMIT || 10)
    },
    sessionSecret: process.env.SESSION_SECRET || 'change-me-before-production',
    googleClientId: process.env.GOOGLE_CLIENT_ID || '',
    public: {
      appName: 'Husky Pass Daycare',
      googleClientId: process.env.GOOGLE_CLIENT_ID || '',
      pasePlatformUrl: process.env.NUXT_PUBLIC_PASE_PLATFORM_URL || '',
      richmondUrl: 'https://resources.richmondelt.com/student/droplets/'
    }
  },
  app: {
    head: {
      htmlAttrs: { lang: 'es' },
      title: 'Husky Pass Daycare',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Husky Pass CRM fase guardería' }
      ]
    }
  },
  typescript: {
    strict: true,
    typeCheck: true
  }
})
