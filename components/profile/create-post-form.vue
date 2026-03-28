<script setup lang="ts">
import type { ApiCategory, FilterField } from '~/types/api'
import { fetchCategoryFields, fetchCategoryTree } from '~/composables/useApi'
import { authFetch } from '~/composables/useClientAuth'

type CategoryOption = {
  id: number
  label: string
}

const categories = ref<CategoryOption[]>([])
const selectedCategoryId = ref('')
const fields = ref<FilterField[]>([])
const fieldValues = reactive<Record<string, any>>({})
const pending = ref(false)
const loadingFields = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const createdPostId = ref<number | null>(null)
const uploadedFiles = ref<File[]>([])
const filePreviews = ref<string[]>([])
const touchedFields = reactive<Record<string, boolean>>({})

function flattenCategories(root?: ApiCategory | null) {
  if (!root) {
    return []
  }

  const result: CategoryOption[] = []
  const stack = (root.children || []).map((item) => ({
    node: item,
    parents: [] as string[]
  }))

  while (stack.length) {
    const current = stack.shift()!
    const item = current.node
    const fullLabel = [...current.parents, item.label].join(' / ')

    result.push({
      id: item.id,
      label: fullLabel
    })

    if (item.children?.length) {
      stack.unshift(
        ...item.children.map((child) => ({
          node: child,
          parents: [...current.parents, item.label]
        }))
      )
    }
  }

  return result
}

function resetFields() {
  for (const key of Object.keys(fieldValues)) {
    delete fieldValues[key]
  }

  for (const key of Object.keys(touchedFields)) {
    delete touchedFields[key]
  }
}

async function loadCategories() {
  const tree = await fetchCategoryTree()
  categories.value = flattenCategories(tree)
}

async function loadFields() {
  if (!selectedCategoryId.value) {
    fields.value = []
    resetFields()
    return
  }

  loadingFields.value = true
  errorMessage.value = ''

  try {
    fields.value = await fetchCategoryFields(selectedCategoryId.value)
    resetFields()
    createdPostId.value = null
    successMessage.value = ''
    for (const field of fields.value) {
      fieldValues[field.name] = field.input === 'checkbox' ? false : ''
    }
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Не удалось загрузить поля формы.'
  } finally {
    loadingFields.value = false
  }
}

function asNumber(value: any) {
  if (value === '' || value === null || typeof value === 'undefined') {
    return undefined
  }

  const numberValue = Number(value)
  return Number.isNaN(numberValue) ? undefined : numberValue
}

function isRequired(field: FilterField) {
  return field.binding?.split(',').includes('required') || false
}

function getFieldError(field: FilterField) {
  if (!touchedFields[field.name]) {
    return ''
  }

  const value = fieldValues[field.name]

  if (!isRequired(field)) {
    return ''
  }

  if (field.input === 'checkbox') {
    return ''
  }

  if (field.dataType === 'number') {
    if (value === '' || value === null || typeof value === 'undefined') {
      return 'Поле обязательно.'
    }

    return Number.isNaN(Number(value)) ? 'Нужно указать число.' : ''
  }

  return String(value || '').trim() ? '' : 'Поле обязательно.'
}

function validateForm() {
  let hasErrors = false

  for (const field of fields.value) {
    touchedFields[field.name] = true

    if (getFieldError(field)) {
      hasErrors = true
    }
  }

  if (!selectedCategoryId.value) {
    errorMessage.value = 'Сначала выберите категорию.'
    return false
  }

  if (hasErrors) {
    errorMessage.value = 'Заполните обязательные поля формы.'
    return false
  }

  return true
}

function buildPayload() {
  const post = {
    title: fieldValues.title,
    description: fieldValues.description,
    status: 1,
    price: asNumber(fieldValues.price),
    categoryID: Number(selectedCategoryId.value),
    regionID: asNumber(fieldValues.region)
  }

  const part = {
    address: fieldValues.address || '',
    isApartment: fieldValues.isApartment || false,
    floor: asNumber(fieldValues.floor),
    rooms: asNumber(fieldValues.rooms),
    area: asNumber(fieldValues.area),
    balcony: fieldValues.balcony || false,
    separateBathroom: fieldValues.separateBathroom || false,
    renovation: asNumber(fieldValues.renovation),
    elevator: fieldValues.elevator || false,
    gas: fieldValues.gas || false,
    yearConstruction: asNumber(fieldValues.yearConstruction),
    parking: asNumber(fieldValues.parking),
    privateTerritory: fieldValues.privateTerritory || false
  }

  return {
    ...post,
    post,
    part,
    ...part
  }
}

async function uploadImages(postId: number) {
  if (!uploadedFiles.value.length) {
    return
  }

  const formData = new FormData()
  uploadedFiles.value.forEach((file, index) => {
    formData.append(`images${index + 1}`, file)
  })
  formData.append('postID', String(postId))

  await authFetch('/v1/internal/files/upload', {
    method: 'POST',
    body: formData
  })
}

async function submit() {
  if (!validateForm()) {
    return
  }

  pending.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const response = await authFetch<{
      id?: number
      data?: {
        id?: number
        post?: { id?: number }
      }
    }>(
      `/v1/internal/category/${selectedCategoryId.value}/create`,
      {
        method: 'POST',
        body: buildPayload()
      }
    )

    const postId = response.data?.post?.id ?? response.data?.id ?? response.id
    if (postId) {
      createdPostId.value = postId
      await uploadImages(postId)
    }

    successMessage.value = postId
      ? `Объявление создано, ID: ${postId}.`
      : 'Объявление создано.'
    uploadedFiles.value = []
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Не удалось создать объявление.'
  } finally {
    pending.value = false
  }
}

function updateFilePreviews(files: File[]) {
  filePreviews.value.forEach((url) => URL.revokeObjectURL(url))
  filePreviews.value = files.map((file) => URL.createObjectURL(file))
}

function setTouched(name: string) {
  touchedFields[name] = true
}

watch(uploadedFiles, (files) => {
  updateFilePreviews(files)
})

onMounted(async () => {
  await loadCategories()
})

watch(selectedCategoryId, async () => {
  await loadFields()
})

onBeforeUnmount(() => {
  filePreviews.value.forEach((url) => URL.revokeObjectURL(url))
})
</script>

<template>
  <div class="card border-0 shadow-sm">
    <div class="card-body p-4">
      <div class="mb-4">
        <h1 class="h3 mb-1">Новое объявление</h1>
        <p class="text-secondary mb-0">
          Объявление создается через legacy backend route
          `POST /v1/internal/category/:category_id/create`, которая внутри создает `post` и category-specific part.
        </p>
      </div>

      <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
      <div v-if="successMessage" class="alert alert-success">{{ successMessage }}</div>

      <div class="mb-4">
        <label class="form-label">Категория</label>
        <select v-model="selectedCategoryId" class="form-select">
          <option value="">Выберите категорию</option>
          <option v-for="category in categories" :key="category.id" :value="String(category.id)">
            {{ category.label }}
          </option>
        </select>
      </div>

      <div v-if="loadingFields" class="text-secondary">Загрузка полей...</div>
      <div v-else-if="fields.length" class="row g-3">
        <div v-for="field in fields" :key="field.name" class="col-md-6" :class="{ 'col-md-12': field.input === 'textarea' }">
          <label class="form-label">
            {{ field.fieldName || field.name }}
            <span v-if="isRequired(field)" class="text-danger">*</span>
          </label>

          <textarea
            v-if="field.input === 'textarea'"
            v-model="fieldValues[field.name]"
            class="form-control"
            :class="{ 'is-invalid': getFieldError(field) }"
            rows="4"
            @blur="setTouched(field.name)"
          />

          <input
            v-else-if="field.input === 'text'"
            v-model="fieldValues[field.name]"
            class="form-control"
            :class="{ 'is-invalid': getFieldError(field) }"
            :type="field.dataType === 'number' ? 'number' : 'text'"
            @blur="setTouched(field.name)"
          />

          <select
            v-else-if="field.input === 'select'"
            v-model="fieldValues[field.name]"
            class="form-select"
            :class="{ 'is-invalid': getFieldError(field) }"
            @change="setTouched(field.name)"
          >
            <option value="">Не выбрано</option>
            <option v-for="(label, value) in field.values" :key="String(value)" :value="String(value)">
              {{ label }}
            </option>
          </select>

          <div v-else-if="field.input === 'checkbox'" class="form-check mt-2">
            <input :id="field.name" v-model="fieldValues[field.name]" class="form-check-input" type="checkbox" @change="setTouched(field.name)" />
            <label :for="field.name" class="form-check-label">Да</label>
          </div>

          <div v-if="getFieldError(field)" class="invalid-feedback d-block">
            {{ getFieldError(field) }}
          </div>
        </div>

        <div class="col-md-12">
          <label class="form-label">Фотографии</label>
          <input
            class="form-control"
            type="file"
            multiple
            accept="image/*"
            @change="uploadedFiles = Array.from(($event.target as HTMLInputElement).files || [])"
          />
          <div v-if="filePreviews.length" class="row row-cols-2 row-cols-md-4 g-3 mt-1">
            <div v-for="(preview, index) in filePreviews" :key="preview" class="col">
              <div class="border rounded overflow-hidden bg-light">
                <img :src="preview" :alt="`Предпросмотр ${index + 1}`" class="w-100 object-fit-cover preview-image" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        class="btn btn-primary mt-4"
        :disabled="pending || !selectedCategoryId || !fields.length"
        @click="submit"
      >
        {{ pending ? 'Создаем...' : 'Создать объявление' }}
      </button>

      <div v-if="createdPostId" class="mt-3">
        <NuxtLink :to="`/posts/${createdPostId}`" class="btn btn-outline-secondary">
          Открыть созданное объявление
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.preview-image {
  aspect-ratio: 4 / 3;
  object-fit: cover;
}
</style>
