import { fileURLToPath } from 'node:url'
import { defineNuxtConfig } from 'nuxt/config'

const appManifestStub = fileURLToPath(new URL('./stubs/nuxt-app-manifest.mjs', import.meta.url))

export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: false },
  experimental: {
    appManifest: false
  },
  alias: {
    '#app-manifest': appManifestStub
  },
  modules: ['@nuxtjs/google-fonts'],
  css: ['~/assets/css/main.css'],
  googleFonts: {
    families: {
      Montserrat: [600],
      Fredoka: [600]
    },
    display: 'swap',
    download: false,
    useStylesheet: true
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
    attendanceMysql: {
      host: process.env.ATTENDANCE_MYSQL_HOST || process.env.DB_ATTENDANCE_HOST || process.env.MYSQL_HOST || '127.0.0.1',
      port: Number(process.env.ATTENDANCE_MYSQL_PORT || process.env.DB_ATTENDANCE_PORT || process.env.MYSQL_PORT || 3306),
      user: process.env.ATTENDANCE_MYSQL_USER || process.env.DB_ATTENDANCE_USER || process.env.MYSQL_USER || 'root',
      password: process.env.ATTENDANCE_MYSQL_PASSWORD || process.env.DB_ATTENDANCE_PASSWORD || process.env.MYSQL_PASSWORD || '',
      database: process.env.ATTENDANCE_MYSQL_DATABASE || process.env.DB_ATTENDANCE_NAME || 'control_coordinaciones',
      connectionLimit: Number(process.env.ATTENDANCE_MYSQL_CONNECTION_LIMIT || process.env.MYSQL_CONNECTION_LIMIT || 5)
    },
    sipae: {
      apiBaseUrl: process.env.SIPAE_API_BASE_URL || 'https://the-sipae-api.casitaapps.com',
      timeoutMs: Number(process.env.SIPAE_API_TIMEOUT_MS || 10000)
    },
    externalUpload: {
      url: process.env.EXPEDIENTE_UPLOAD_URL || 'https://expediente.casitaapps.com'
    },
    passwordRecovery: {
      baseUrl: process.env.PASSWORD_RECOVERY_BASE_URL || '',
      tokenTtlMinutes: Number(process.env.PASSWORD_RECOVERY_TOKEN_TTL_MINUTES || 30),
      emailMode: process.env.PASSWORD_RECOVERY_EMAIL_MODE || 'gmail',
      fromEmail: process.env.PASSWORD_RECOVERY_FROM_EMAIL || '',
      fromName: process.env.PASSWORD_RECOVERY_FROM_NAME || 'Husky Pass',
      googleServiceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '',
      googleServiceAccountPrivateKey: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || '',
      googleDelegatedUser: process.env.GOOGLE_WORKSPACE_DELEGATED_USER || process.env.GOOGLE_GMAIL_DELEGATED_USER || ''
    },
    sessionSecret: process.env.SESSION_SECRET || 'change-me-before-production',
    googleClientId: process.env.GOOGLE_CLIENT_ID || '',
    public: {
      appName: 'Husky Pass CRM',
      googleClientId: process.env.GOOGLE_CLIENT_ID || '',
      pasePlatformUrl: process.env.NUXT_PUBLIC_PASE_PLATFORM_URL || '',
      richmondUrl: 'https://resources.richmondelt.com/student/droplets/'
    }
  },
  app: {
    head: {
      htmlAttrs: { lang: 'es' },
      title: 'Husky Pass CRM',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Husky Pass CRM para guardería y Personas Autorizadas' }
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/brand/husky-pass-logo.png' },
        { rel: 'apple-touch-icon', href: '/brand/husky-pass-logo.png' }
      ]
    }
  },
  typescript: {
    strict: true,
    typeCheck: true
  },
  vite: {
    resolve: {
      alias: {
        '#app-manifest': appManifestStub
      }
    },
    server: {
      watch: {
        ignored: ['**/artifacts/**', '**/.output/**', '**/.vercel/**']
      }
    },
    build: {
      reportCompressedSize: false
    }
  },
  hooks: {
    'nitro:config'(nitroConfig) {
      const preset = process.env.NITRO_PRESET || (process.env.VERCEL ? 'vercel' : undefined)
      if (preset) nitroConfig.preset = preset
      nitroConfig.serverAssets = [
        ...(nitroConfig.serverAssets || []),
        { baseName: 'marbete-templates', dir: '../data/marbete-templates' },
        { baseName: 'personas-config', dir: '../data/personas-autorizadas' },
        { baseName: 'hp-fonts', dir: '../public/fonts' }
      ]
    }
  }
})
