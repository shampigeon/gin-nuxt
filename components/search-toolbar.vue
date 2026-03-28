<script setup lang="ts">
import type { ApiCategory } from '~/types/api'

const props = defineProps<{
  categories?: ApiCategory | null
  initialSearch?: string
  currentCategoryId?: string | null
}>()

const router = useRouter()
const route = useRoute()
const search = ref(props.initialSearch || '')

const categoryLinks = computed(() => props.categories?.children || [])

function submit() {
  const query = new URLSearchParams()

  if (search.value.trim()) {
    query.set('search', search.value.trim())
  }

  const targetPath = props.currentCategoryId ? `/category/${props.currentCategoryId}` : '/'
  const queryString = query.toString()

  router.push(queryString ? `${targetPath}?${queryString}` : targetPath)
}

function clearSearch() {
  search.value = ''
  const targetPath = props.currentCategoryId ? `/category/${props.currentCategoryId}` : route.path
  router.push(targetPath)
}
</script>

<template>
  <section class="card border-0 shadow-sm mb-4">
    <div class="card-body p-4">
      <div class="row g-3 align-items-end">
        <div class="col-lg-7">
          <label for="search" class="form-label fw-semibold">Поиск по объявлениям</label>
          <input
            id="search"
            v-model="search"
            type="search"
            class="form-control form-control-lg"
            placeholder="Например: квартира, ноутбук, Volkswagen"
            @keyup.enter="submit"
          />
        </div>
        <div class="col-lg-5">
          <div class="d-flex gap-2">
            <button type="button" class="btn btn-primary btn-lg flex-grow-1" @click="submit">
              Найти
            </button>
            <button type="button" class="btn btn-outline-secondary btn-lg" @click="clearSearch">
              Сброс
            </button>
          </div>
        </div>
      </div>

      <div v-if="categoryLinks.length" class="mt-4">
        <div class="small text-uppercase text-secondary mb-2">Категории</div>
        <div class="d-flex flex-wrap gap-2">
          <NuxtLink to="/" class="btn btn-sm" :class="currentCategoryId ? 'btn-outline-secondary' : 'btn-dark'">
            Все
          </NuxtLink>
          <NuxtLink
            v-for="category in categoryLinks"
            :key="category.id"
            :to="`/category/${category.id}`"
            class="btn btn-sm"
            :class="String(category.id) === currentCategoryId ? 'btn-dark' : 'btn-outline-secondary'"
          >
            {{ category.label }}
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>
