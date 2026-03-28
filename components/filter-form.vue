<script setup lang="ts">
import type { FilterField } from '~/types/api'

const props = defineProps<{
  fields: FilterField[]
}>()

const route = useRoute()
const router = useRouter()

const formState = reactive<Record<string, string>>({})

for (const [key, value] of Object.entries(route.query)) {
  if (typeof value === 'string') {
    formState[key] = value
  }
}

function applyFilters() {
  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(formState)) {
    if (value !== '') {
      params.set(key, value)
    }
  }

  params.delete('page')
  const queryString = params.toString()
  router.push(queryString ? `${route.path}?${queryString}` : route.path)
}

function resetFilters() {
  for (const field of props.fields) {
    formState[field.name] = ''
  }
  const keepSearch = typeof route.query.search === 'string' ? `?search=${encodeURIComponent(route.query.search)}` : ''
  router.push(`${route.path}${keepSearch}`)
}

function isChecked(name: string) {
  return formState[name] === 'true'
}
</script>

<template>
  <aside class="card border-0 shadow-sm">
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h2 class="h5 mb-0">Фильтры</h2>
        <button type="button" class="btn btn-sm btn-link text-decoration-none px-0" @click="resetFilters">
          Сбросить
        </button>
      </div>

      <div class="d-grid gap-3">
        <div v-for="field in fields" :key="field.name">
          <label class="form-label fw-semibold">{{ field.fieldName }}</label>

          <input
            v-if="field.input === 'text'"
            v-model="formState[field.name]"
            type="text"
            class="form-control"
          />

          <select
            v-else-if="field.input === 'select'"
            v-model="formState[field.name]"
            class="form-select"
          >
            <option value="">Не выбрано</option>
            <option v-for="(label, value) in field.values" :key="String(value)" :value="String(value)">
              {{ label }}
            </option>
          </select>

          <div v-else-if="field.input === 'checkbox'" class="form-check">
            <input
              :id="field.name"
              class="form-check-input"
              type="checkbox"
              :checked="isChecked(field.name)"
              @change="formState[field.name] = ($event.target as HTMLInputElement).checked ? 'true' : ''"
            />
            <label :for="field.name" class="form-check-label">Да</label>
          </div>
        </div>
      </div>

      <button type="button" class="btn btn-primary w-100 mt-4" @click="applyFilters">
        Применить
      </button>
    </div>
  </aside>
</template>
