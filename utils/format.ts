import type { ApiFile, ApiPostFlatPart } from '~/types/api'

export function formatPrice(value?: number | null) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 'Цена не указана'
  }

  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0
  }).format(value)
}

export function getFileUrl(file?: ApiFile | null) {
  if (!file) {
    return null
  }

  return file.URL || file.url || null
}

export function getPrimaryImage(files?: ApiFile[]) {
  const firstFile = files?.[0]
  return getFileUrl(firstFile) || '/images/placeholder-post.svg'
}

export function formatDate(value?: string) {
  if (!value) {
    return 'Дата не указана'
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'medium'
  }).format(parsed)
}

export function formatBoolean(value?: boolean | null) {
  if (value === null || typeof value === 'undefined') {
    return 'Не указано'
  }

  return value ? 'Да' : 'Нет'
}

export function getFlatAttributes(part?: ApiPostFlatPart | null) {
  if (!part) {
    return []
  }

  return [
    ['Адрес', part.address || 'Не указан'],
    ['Комнат', part.rooms ?? 'Не указано'],
    ['Площадь', part.area ? `${part.area} м²` : 'Не указана'],
    ['Этаж', part.floor ?? 'Не указан'],
    ['Апартаменты', formatBoolean(part.isApartment)],
    ['Балкон', formatBoolean(part.balcony)],
    ['Раздельный санузел', formatBoolean(part.separateBathroom)],
    ['Лифт', formatBoolean(part.elevator)],
    ['Газ', formatBoolean(part.gas)],
    ['Год постройки', part.yearConstruction ?? 'Не указан']
  ]
}
