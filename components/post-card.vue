<script setup lang="ts">
import type { ApiPost } from '~/types/api'
import { formatDate, formatPrice, getPrimaryImage } from '~/utils/format'

defineProps<{
  post: ApiPost
}>()
</script>

<template>
  <article class="card h-100 shadow-sm border-0">
    <img :src="getPrimaryImage(post.files)" :alt="post.title" class="card-img-top post-card-image" />
    <div class="card-body d-flex flex-column">
      <div class="d-flex justify-content-between align-items-start gap-3 mb-2">
        <h3 class="h5 mb-0">{{ post.title }}</h3>
        <span class="fw-semibold text-nowrap">{{ formatPrice(post.price) }}</span>
      </div>

      <p class="text-secondary small mb-3 line-clamp-3">
        {{ post.description }}
      </p>

      <div class="small text-secondary mb-3">
        <div>{{ post.region?.name || 'Регион не указан' }}</div>
        <div>Обновлено: {{ formatDate(post.updatedAt) }}</div>
      </div>

      <div class="mb-3">
        <PostSocialActions :post-id="post.id" compact />
      </div>

      <NuxtLink :to="`/posts/${post.id}`" class="btn btn-outline-primary mt-auto">
        Открыть объявление
      </NuxtLink>
    </div>
  </article>
</template>
