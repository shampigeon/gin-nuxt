<script setup lang="ts">
import { fetchPostDetails } from '~/composables/useApi'
import { formatPrice, formatDate } from '~/utils/format'

const route = useRoute()
const postId = route.params.id as string

const { data, error } = await useAsyncData(`business-post:${postId}`, () => fetchPostDetails(postId))

if (error.value || !data.value?.data) {
  throw createError({ statusCode: 404, statusMessage: 'Объявление не найдено' })
}

const post = computed(() => data.value!.data)

useSeoMeta({ title: post.value.title, description: post.value.description })
</script>

<template>
  <div class="container py-4" style="max-width: 800px;">
    <NuxtLink to="/business" class="btn btn-sm btn-outline-secondary mb-4">← Назад</NuxtLink>

    <div class="item-card">
      <div class="d-flex justify-content-between align-items-start mb-3">
        <span class="item-price">{{ formatPrice(post.price) }}</span>
      </div>

      <h1 class="h4 fw-bold mb-1">{{ post.title }}</h1>

      <hr style="border-color: var(--color-border);">
      <p style="white-space: pre-wrap; line-height: 1.7;">{{ post.description }}</p>

      <template v-if="post.part">
        <hr style="border-color: var(--color-border);">
        <PartDetails :category-id="post.categoryID" :part="post.part" />
      </template>

      <hr style="border-color: var(--color-border);">
      <div class="item-meta">Опубликовано: {{ formatDate(post.createdAt) }}</div>
    </div>
  </div>
</template>
