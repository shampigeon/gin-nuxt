<script setup lang="ts">
import { fetchPostDetails } from '~/composables/useApi'
import { formatDate, formatPrice, getFlatAttributes, getPrimaryImage } from '~/utils/format'

const route = useRoute()
const postId = route.params.id as string

const { data, error } = await useAsyncData(`post:${postId}`, () => fetchPostDetails(postId))

if (error.value || !data.value?.data) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Объявление не найдено'
  })
}

const post = computed(() => data.value!.data)
const flatAttributes = computed(() => getFlatAttributes(post.value.part))

useSeoMeta({
  title: post.value.title,
  description: post.value.description
})
</script>

<template>
  <div class="container py-4 py-lg-5">
    <div class="mb-4">
      <NuxtLink to="/" class="text-decoration-none">← Назад к каталогу</NuxtLink>
    </div>

    <div class="row g-4">
      <div class="col-lg-7">
        <div class="card border-0 shadow-sm">
          <img :src="getPrimaryImage(post.files)" :alt="post.title" class="post-detail-image" />
        </div>
      </div>

      <div class="col-lg-5">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-body p-4">
            <div class="d-flex justify-content-between gap-3 mb-3">
              <h1 class="h2 mb-0">{{ post.title }}</h1>
              <span class="badge text-bg-light border align-self-start">
                {{ post.category?.label || 'Объявление' }}
              </span>
            </div>

            <div class="display-6 fw-semibold text-primary mb-3">
              {{ formatPrice(post.price) }}
            </div>

            <div class="text-secondary mb-4">
              <div>{{ post.region?.name || 'Регион не указан' }}</div>
              <div>Создано: {{ formatDate(post.createdAt) }}</div>
              <div>Обновлено: {{ formatDate(post.updatedAt) }}</div>
            </div>

            <div class="mb-4">
              <PostSocialActions :post-id="post.id" />
            </div>

            <p class="mb-0">{{ post.description }}</p>
          </div>
        </div>
      </div>
    </div>

    <section class="row g-4 mt-1">
      <div class="col-lg-8">
        <div class="card border-0 shadow-sm">
          <div class="card-body p-4">
            <h2 class="h4 mb-3">Описание</h2>
            <p class="mb-0">{{ post.description }}</p>
          </div>
        </div>
      </div>

      <div class="col-lg-4">
        <div class="card border-0 shadow-sm" v-if="flatAttributes.length">
          <div class="card-body p-4">
            <h2 class="h4 mb-3">Параметры объекта</h2>
            <dl class="row mb-0">
              <template v-for="[label, value] in flatAttributes" :key="label">
                <dt class="col-7 text-secondary">{{ label }}</dt>
                <dd class="col-5 text-end">{{ value }}</dd>
              </template>
            </dl>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
