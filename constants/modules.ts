// Названия модулей — должны совпадать с константами бэкенда (registry.Module*)
export const MODULE_FLATS    = 'flats'
export const MODULE_BUSINESS = 'business'
export const MODULE_WORK     = 'work'
export const MODULE_ALL      = 'all'

export type BuildModule = typeof MODULE_FLATS | typeof MODULE_BUSINESS | typeof MODULE_WORK | typeof MODULE_ALL
