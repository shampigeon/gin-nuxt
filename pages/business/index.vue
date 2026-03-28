<script setup lang="ts">
import { fetchCategoryTree, fetchCategoryFilters, fetchCategoryPosts } from '~/composables/useApi'
import { formatPrice, formatDate } from '~/utils/format'
import type { ApiCategory } from '~/types/api'

const BUSINESS_ROOT_ID = 52

const route = useRoute()
const router = useRouter()
const { isGrid } = useModuleDisplay('business')

const activeCategoryId = computed(() =>
  Number(route.query.categoryId) || BUSINESS_ROOT_ID
)

const { data, error } = await useAsyncData(
  () => `business-listing:${route.fullPath}`,
  async () => {
    const query = { ...route.query, recursive: 'true' }
    const [tree, fields, posts] = await Promise.all([
      fetchCategoryTree(BUSINESS_ROOT_ID),
      fetchCategoryFilters(activeCategoryId.value),
      fetchCategoryPosts(activeCategoryId.value, query)
    ])
    const categories: ApiCategory[] = [
      { id: BUSINESS_ROOT_ID, label: 'Все', value: BUSINESS_ROOT_ID },
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
  if (id === BUSINESS_ROOT_ID) {
    delete query.categoryId
  } else {
    query.categoryId = String(id)
  }
  router.push({ path: route.path, query })
}
</script>

<template>
  <div class="container py-4">
    <div class="row g-4">
      <!-- Sidebar -->
      <aside class="col-lg-3">
        <div class="item-card mb-3">
          <h6 class="fw-semibold mb-3" style="color: var(--color-text-muted); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em;">Категории</h6>
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
            {{ data?.categories?.find(c => c.id === activeCategoryId)?.label ?? 'Бизнес' }}
          </h1>
          <span style="color: var(--color-text-muted); font-size: 0.85rem;">{{ data?.total ?? 0 }} объявлений</span>
        </div>

        <div v-if="!data?.list?.length" class="item-card text-center py-5">
          <p style="color: var(--color-text-muted);">Объявлений не найдено</p>
        </div>

        <template v-else>
          <!-- Сетка карточками -->
          <div v-if="isGrid" class="items-grid">
            <NuxtLink
              v-for="post in data.list"
              :key="post.id"
              :to="`/business/${post.id}`"
              class="item-card text-decoration-none"
            >
              <div class="d-flex justify-content-between align-items-start mb-2">
                <span v-if="post.part?.industry" class="badge-industry">{{ post.part.industry }}</span>
                <span class="item-price ms-auto">{{ formatPrice(post.price) }}</span>
              </div>
              <div class="item-title mb-1">{{ post.title }}</div>
              <div class="item-meta mb-2" style="-webkit-line-clamp:2; display:-webkit-box; -webkit-box-orient:vertical; overflow:hidden;">
                {{ post.description }}
              </div>
              <div v-if="post.part?.companyName" class="item-meta">
                {{ post.part.companyName }}
                <span v-if="post.part?.website"> · {{ post.part.website }}</span>
              </div>
            </NuxtLink>
          </div>

          <!-- Список строками -->
          <div v-else class="items-list">
            <NuxtLink
              v-for="post in data.list"
              :key="post.id"
              :to="`/business/${post.id}`"
              class="item-card text-decoration-none d-flex align-items-center gap-3"
            >
              <div class="flex-grow-1 overflow-hidden">
                <div class="d-flex align-items-center gap-2 mb-1">
                  <span v-if="post.part?.industry" class="badge-industry">{{ post.part.industry }}</span>
                  <div class="item-title">{{ post.title }}</div>
                </div>
                <div class="item-meta text-truncate">{{ post.description }}</div>
              </div>
              <div class="text-end flex-shrink-0">
                <div class="item-price">{{ formatPrice(post.price) }}</div>
                <div v-if="post.part?.companyName" class="item-meta mt-1">{{ post.part.companyName }}</div>
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
