import { MODULE_FLATS, MODULE_BUSINESS, MODULE_WORK, MODULE_ALL } from './constants/modules'

const buildProfile = process.env.BUILD_PROFILE ?? MODULE_ALL

const hasModule = (module: string): boolean => {
  if (buildProfile === MODULE_ALL) return true
  return buildProfile.split(',').map(m => m.trim()).includes(module)
}

export const buildConfig = {
  profile:     buildProfile,
  hasFlats:    hasModule(MODULE_FLATS),
  hasBusiness: hasModule(MODULE_BUSINESS),
  hasWork:     hasModule(MODULE_WORK),
}

// MODULE_VIEW=flats:grid,work:list,business:list
// Возможные значения: grid | list. Дефолты: flats=grid, work=list, business=list
const moduleViewDefaults: Record<string, string> = {
  [MODULE_FLATS]:    'grid',
  [MODULE_WORK]:     'list',
  [MODULE_BUSINESS]: 'list',
}
const moduleView: Record<string, string> = { ...moduleViewDefaults }
const moduleViewRaw = process.env.MODULE_VIEW ?? ''
if (moduleViewRaw) {
  for (const part of moduleViewRaw.split(',')) {
    const [mod, view] = part.trim().split(':')
    if (mod && (view === 'grid' || view === 'list')) {
      moduleView[mod.trim()] = view
    }
  }
}

export default defineNuxtConfig({
  compatibilityDate: '2024-07-02',
  ssr: true,
  devtools: { enabled: true },
  experimental: { appManifest: false },
  css: [
    '~/assets/css/main.css',
    ...(buildConfig.hasBusiness || buildConfig.hasWork ? ['~/assets/css/themes/business.css'] : []),
    ...(buildConfig.hasFlats ? ['~/assets/css/themes/classifieds.css'] : []),
  ],
  runtimeConfig: {
    public: {
      apiBase:      process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:7070',
      buildProfile: buildProfile,
      moduleView:   moduleView,
    }
  },
  hooks: {
    'pages:extend'(pages) {
      const removeAll = (path: string) => {
        let i = pages.length
        while (i--) {
          if (pages[i].file?.includes(path)) pages.splice(i, 1)
        }
      }

      if (!buildConfig.hasBusiness) removeAll('/pages/business/')
      if (!buildConfig.hasWork)     removeAll('/pages/work/')
      if (!buildConfig.hasFlats)    removeAll('/pages/flats/')
    }
  },
  app: {
    head: {
      title: buildConfig.hasBusiness ? 'BizPortal' : 'Classifieds',
      titleTemplate: '%s | ' + (buildConfig.hasBusiness ? 'BizPortal' : 'Classifieds'),
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'gin-content powered frontend' }
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
