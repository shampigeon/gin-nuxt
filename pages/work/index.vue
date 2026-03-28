<script setup lang="ts">
import { fetchCategoryTree, fetchCategoryFilters, fetchCategoryPosts } from '~/composables/useApi'
import { formatPrice, formatDate, getPrimaryImage } from '~/utils/format'
import type { ApiCategory } from '~/types/api'

const WORK_ROOT_ID = 60

const route = useRoute()
const router = useRouter()
const { isGrid, hasPhoto } = useModuleDisplay('work')

const activeCategoryId = computed(() =>
  Number(route.query.categoryId) || WORK_ROOT_ID
)

const { data, error } = await useAsyncData(
  () => `work-listing:${route.fullPath}`,
  async () => {
    const query = { ...route.query, recursive: 'true' }
    const [tree, fields, posts] = await Promise.all([
      fetchCategoryTree(WORK_ROOT_ID),
      fetchCategoryFilters(activeCategoryId.value),
      fetchCategoryPosts(activeCategoryId.value, query)
    ])
    const categories: ApiCategory[] = [
      { id: WORK_ROOT_ID, label: 'Все', value: WORK_ROOT_ID },
      ...(tree?.children ?? [])
    ]
    return { categories, fields, list: posts.response.list, total: posts.response.total, limit: posts.limit, page: posts.page }
  },
  { watch: [() => route.fullPath] }
)

if (error.value) {
  throw createError({ statusCode: 500, statusMessage: 'Не удалось загрузить раздел' })
}

function selectCategory(id: number) {
  const query = { ...route.query }
  delete query.page
  if (id === WORK_ROOT_ID) {
    delete query.categoryId
  } else {
    query.categoryId = String(id)
  }
  router.push({ path: route.path, query })
}

function employmentLabel(type: number): string {
  const map: Record<number, string> = { 1: 'Полная', 2: 'Частичная', 3: 'Проектная' }
  return map[type] ?? ''
}
</script>

<template>
  <div class="container py-4">
    <div class="row g-4">
      <!-- Sidebar -->
      <aside class="col-lg-3">
        <div class="item-card mb-3">
          <h6 class="fw-semibold mb-3" style="color: var(--color-text-muted); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em;">Раздел</h6>
          <div class="d-flex flex-column gap-1">
            <button
              v-for="cat in data?.categories"
              :key="cat.id"
              class="btn btn-sm text-start"
              :class="activeCategoryId === cat.id ? 'btn-primary' : 'btn-outline-secondary'"
              @click="selectCategory(cat.id)"
            >
              {{ cat.label }}
            </button>
          </div>
        </div>

        <FilterForm :fields="data?.fields ?? []" />
      </aside>

      <!-- Main -->
      <div class="col-lg-9">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h1 class="h5 fw-bold mb-0">
            {{ data?.categories?.find(c => c.id === activeCategoryId)?.label ?? 'Работа' }}
          </h1>
          <span style="color: var(--color-text-muted); font-size: 0.85rem;">{{ data?.total ?? 0 }} объявлений</span>
        </div>

        <div v-if="!data?.list?.length" class="item-card text-center py-5">
          <p style="color: var(--color-text-muted);">Объявлений не найдено</p>
        </div>

        <template v-else>
          <!-- Список строками -->
          <div v-if="!isGrid" class="items-list">
            <NuxtLink
              v-for="post in data.list"
              :key="post.id"
              :to="`/work/${post.id}`"
              class="item-card text-decoration-none d-flex gap-4 align-items-start"
            >
              <img v-if="hasPhoto" :src="getPrimaryImage(post.files)" :alt="post.title" class="home-list-avatar" />
              <div class="flex-grow-1">
                <div class="item-title mb-1">{{ post.title }}</div>
                <div v-if="post.part?.position" class="item-meta mb-2">{{ post.part.position }}</div>
                <div class="item-meta mb-2" style="-webkit-line-clamp:2; display:-webkit-box; -webkit-box-orient:vertical; overflow:hidden;">
                  {{ post.description }}
                </div>
                <div class="d-flex gap-2 flex-wrap">
                  <span v-if="post.part?.employment" class="badge-employment">{{ employmentLabel(post.part.employment) }}</span>
                  <span v-if="post.part?.isRemote" class="badge-remote">Удалённо</span>
                </div>
              </div>
              <div class="text-end flex-shrink-0">
                <div class="item-price">{{ formatPrice(post.price) }}</div>
                <div class="item-meta mt-1">{{ formatDate(post.createdAt) }}</div>
              </div>
            </NuxtLink>
          </div>

          <!-- Сетка карточками -->
          <div v-else class="items-grid">
            <NuxtLink
              v-for="post in data.list"
              :key="post.id"
              :to="`/work/${post.id}`"
              class="item-card text-decoration-none"
            >
              <img v-if="hasPhoto" :src="getPrimaryImage(post.files)" :alt="post.title" class="home-list-avatar mb-2" />
              <div class="item-title mb-1">{{ post.title }}</div>
              <div v-if="post.part?.position" class="item-meta mb-2">{{ post.part.position }}</div>
              <div class="d-flex gap-2 flex-wrap mb-2">
                <span v-if="post.part?.employment" class="badge-employment">{{ employmentLabel(post.part.employment) }}</span>
                <span v-if="post.part?.isRemote" class="badge-remote">Удалённо</span>
              </div>
              <div class="d-flex justify-content-between align-items-center mt-auto">
                <div class="item-price">{{ formatPrice(post.price) }}</div>
                <div class="item-meta">{{ formatDate(post.createdAt) }}</div>
              </div>
            </NuxtLink>
          </div>
        </template>

        <div class="mt-4">
          <AppPagination
            :total="data?.total ?? 0"
            :limit="data?.limit ?? 12"
            :current-page="data?.page ?? 1"
          />
        </div>
      </div>
    </div>
  </div>
</template>
