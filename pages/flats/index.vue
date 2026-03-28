<script setup lang="ts">
import { fetchCategoryTree, fetchPublicPosts } from '~/composables/useApi'
import { formatPrice, formatDate, getPrimaryImage } from '~/utils/format'

useSeoMeta({ title: 'Квартиры' })

const route = useRoute()
const { isGrid, hasPhoto } = useModuleDisplay('flats')

const { data, error } = await useAsyncData(`flats:${JSON.stringify(route.query)}`, async () => {
  const [categories, posts] = await Promise.all([
    fetchCategoryTree(),
    fetchPublicPosts(route.query)
  ])
  return { categories, ...posts }
})

if (error.value) {
  throw createError({ statusCode: 500, statusMessage: 'Не удалось загрузить каталог объявлений' })
}
</script>

<template>
  <div class="container py-4 py-lg-5">
    <SearchToolbar
      :categories="data?.categories"
      :initial-search="typeof route.query.search === 'string' ? route.query.search : ''"
    />

    <div class="d-flex justify-content-between align-items-end gap-3 mb-4">
      <div>
        <h1 class="h2 mb-1">Каталог объявлений</h1>
        <p class="text-secondary mb-0">Найдено объявлений: {{ data?.response.total || 0 }}</p>
      </div>
    </div>

    <template v-if="data?.response.list.length">
      <!-- Сетка с фото -->
      <div v-if="isGrid" class="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4">
        <div v-for="post in data.response.list" :key="post.id" class="col">
          <PostCard :post="post" />
        </div>
      </div>

      <!-- Список строками -->
      <div v-else class="items-list">
        <NuxtLink
          v-for="post in data.response.list"
          :key="post.id"
          :to="`/posts/${post.id}`"
          class="item-card text-decoration-none d-flex align-items-center gap-3"
        >
          <img v-if="hasPhoto" :src="getPrimaryImage(post.files)" :alt="post.title" class="home-list-avatar" />
          <div class="flex-grow-1 overflow-hidden">
            <div class="item-title">{{ post.title }}</div>
            <div class="item-meta mt-1">{{ post.region?.name || '' }}</div>
          </div>
          <div class="text-end flex-shrink-0">
            <div class="item-price">{{ formatPrice(post.price) }}</div>
            <div class="item-meta mt-1">{{ formatDate(post.updatedAt) }}</div>
          </div>
        </NuxtLink>
      </div>
    </template>

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
