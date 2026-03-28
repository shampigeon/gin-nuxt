<script setup lang="ts">
import { fetchCategoryFields } from '~/composables/useApi'
import type { FilterField } from '~/types/api'

const props = defineProps<{
  categoryId: number | string
  part: Record<string, any> | null | undefined
}>()

// Базовые поля поста — не показываем в секции part-деталей
const BASE_FIELDS = new Set(['title', 'description', 'price', 'regionID'])

const { data: fields } = await useAsyncData(
  `part-fields:${props.categoryId}`,
  () => fetchCategoryFields(props.categoryId)
)

const partFields = computed<FilterField[]>(() =>
  (fields.value ?? []).filter(f => !BASE_FIELDS.has(f.name))
)

function formatValue(field: FilterField, raw: any): string {
  if (raw === null || raw === undefined || raw === '') return '—'

  if (field.input === 'checkbox') {
    return raw ? 'Да' : 'Нет'
  }

  if (field.input === 'select' && field.values) {
    return (field.values as Record<string | number, string>)[raw] ?? String(raw)
  }

  return String(raw)
}
</script>

<template>
  <dl v-if="part && partFields.length" class="row mb-0 part-details">
    <template v-for="field in partFields" :key="field.name">
      <dt class="col-6 item-meta">{{ field.fieldName }}</dt>
      <dd class="col-6 text-end">{{ formatValue(field, part[field.name]) }}</dd>
    </template>
  </dl>
</template>
