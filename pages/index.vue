<script setup lang="ts">
import { fetchCategoryTree, fetchPublicPosts } from '~/composables/useApi'

useSeoMeta({
  title: 'Главная',
  description: 'Публичный каталог объявлений'
})

const route = useRoute()

const { data, error } = await useAsyncData(`home:${JSON.stringify(route.query)}`, async () => {
  const [categories, posts] = await Promise.all([
    fetchCategoryTree(),
    fetchPublicPosts(route.query)
  ])

  return {
    categories,
    ...posts
  }
})

if (error.value) {
  throw createError({
    statusCode: 500,
    statusMessage: 'Не удалось загрузить каталог объявлений'
  })
}
</script>

<template>
  <div class="container py-4 py-lg-5">
    <SearchToolbar
      :categories="data?.categories"
      :initial-search="typeof route.query.search === 'string' ? route.query.search : ''"
    />

    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3 mb-4">
      <div>
        <h1 class="h2 mb-1">Каталог объявлений</h1>
        <p class="text-secondary mb-0">
          Найдено объявлений: {{ data?.response.total || 0 }}
        </p>
      </div>
    </div>

    <div v-if="data?.response.list.length" class="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4">
      <div v-for="post in data?.response.list" :key="post.id" class="col">
        <PostCard :post="post" />
      </div>
    </div>
    <div v-else class="alert alert-light border">
      По этому запросу объявлений не найдено.
    </div>

    <div class="mt-4">
      <AppPagination
        :total="data?.response.total || 0"
        :limit="data?.limit || 12"
        :current-page="data?.page || 1"
      />
    </div>
  </div>
</template>
