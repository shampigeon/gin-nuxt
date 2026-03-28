<script setup lang="ts">
import { fetchCategoryFilters, fetchCategoryPosts, fetchCategoryTree } from '~/composables/useApi'

const route = useRoute()
const categoryId = computed(() => route.params.categoryId as string)

const { data, error } = await useAsyncData(
  () => `category-page:${categoryId.value}:${JSON.stringify(route.query)}`,
  async () => {
    const [categories, fields, posts] = await Promise.all([
      fetchCategoryTree(),
      fetchCategoryFilters(categoryId.value),
      fetchCategoryPosts(categoryId.value, route.query)
    ])

    return {
      categories,
      fields,
      ...posts
    }
  },
  {
    watch: [categoryId, () => route.fullPath],
    default: () => ({
      categories: null,
      fields: [],
      response: {
        list: [],
        total: 0
      },
      limit: 12,
      page: 1
    })
  }
)

if (error.value) {
  throw createError({
    statusCode: 500,
    statusMessage: 'Не удалось загрузить объявления категории'
  })
}

const activeCategory = computed(() =>
  data.value?.categories?.children?.find((item) => String(item.id) === categoryId.value) || null
)

useSeoMeta({
  title: activeCategory.value?.label || 'Категория',
  description: 'Каталог объявлений по категории'
})
</script>

<template>
  <div class="container py-4 py-lg-5">
    <SearchToolbar
      :categories="data?.categories"
      :initial-search="typeof route.query.search === 'string' ? route.query.search : ''"
      :current-category-id="categoryId"
    />

    <div class="d-flex justify-content-between align-items-start gap-3 mb-4">
      <div>
        <h1 class="h2 mb-1">{{ activeCategory?.label || 'Категория' }}</h1>
        <p class="text-secondary mb-0">
          Найдено объявлений: {{ data?.response.total || 0 }}
        </p>
      </div>
    </div>

    <div class="row g-4">
      <div class="col-lg-3">
        <FilterForm :fields="data?.fields || []" />
      </div>
      <div class="col-lg-9">
        <div v-if="data?.response.list.length" class="row row-cols-1 row-cols-md-2 g-4">
          <div v-for="post in data?.response.list" :key="post.id" class="col">
            <PostCard :post="post" />
          </div>
        </div>
        <div v-else class="alert alert-light border">
          По этому запросу объявлений нет.
        </div>

        <div class="mt-4">
          <AppPagination
            :total="data?.response.total || 0"
            :limit="data?.limit || 12"
            :current-page="data?.page || 1"
          />
        </div>
      </div>
    </div>
  </div>
</template>
