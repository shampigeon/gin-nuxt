export type ViewMode = 'grid' | 'list'

export interface ModuleDisplay {
  viewMode: ViewMode
  isGrid: boolean
  hasPhoto: boolean
  homeLimit: number
}

// Наличие фото — свойство типа модуля, не настраивается
const MODULE_HAS_PHOTO: Record<string, boolean> = {
  flats:    true,
  work:     true,
  business: false,
}

export function useModuleDisplay(module: string): ModuleDisplay {
  const runtimeConfig = useRuntimeConfig()
  const moduleView = runtimeConfig.public.moduleView as Record<string, string>

  const viewMode = (moduleView[module] ?? 'list') as ViewMode
  const isGrid   = viewMode === 'grid'
  const hasPhoto = MODULE_HAS_PHOTO[module] ?? false
  // В сетке показываем кратно колонкам (3), в списке — чуть больше (5)
  const homeLimit = isGrid ? 3 : 5

  return { viewMode, isGrid, hasPhoto, homeLimit }
}
