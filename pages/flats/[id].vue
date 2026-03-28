<script setup lang="ts">
import { fetchPostDetails } from '~/composables/useApi'
import { formatDate, formatPrice, getPrimaryImage } from '~/utils/format'

const route = useRoute()
const postId = route.params.id as string

const { data, error } = await useAsyncData(`post:${postId}`, () => fetchPostDetails(postId))

if (error.value || !data.value?.data) {
  throw createError({ statusCode: 404, statusMessage: 'Объявление не найдено' })
}

const post = computed(() => data.value!.data)

useSeoMeta({ title: post.value.title, description: post.value.description })
</script>

<template>
  <div class="container py-4" style="max-width: 860px;">
    <NuxtLink to="/flats" class="btn btn-sm btn-outline-secondary mb-4">← Назад</NuxtLink>

    <div v-if="post" class="item-card">
      <div class="d-flex justify-content-between align-items-start mb-3">
        <span class="item-meta">{{ post.category?.label }}</span>
        <span class="item-price">{{ formatPrice(post.price) }}</span>
      </div>

      <h1 class="h4 fw-bold mb-1">{{ post.title }}</h1>
      <div class="item-meta mb-3">{{ post.region?.name }}</div>

      <img v-if="getPrimaryImage(post.files)" :src="getPrimaryImage(post.files)" :alt="post.title" style="width:100%; border-radius:8px; margin-bottom:1rem; max-height:400px; object-fit:cover;" />

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
