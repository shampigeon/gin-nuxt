<script setup lang="ts">
const props = defineProps<{
  total: number
  limit: number
  currentPage: number
}>()

const route = useRoute()

const totalPages = computed(() => Math.max(1, Math.ceil((props.total || 0) / props.limit)))

function buildPageLink(page: number) {
  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(route.query)) {
    if (typeof value === 'string' && value.length > 0) {
      params.set(key, value)
    }
  }

  if (page <= 1) {
    params.delete('page')
  } else {
    params.set('page', String(page))
  }

  const query = params.toString()
  return query ? `${route.path}?${query}` : route.path
}
</script>

<template>
  <nav v-if="totalPages > 1" aria-label="Пагинация">
    <ul class="pagination mb-0">
      <li class="page-item" :class="{ disabled: currentPage <= 1 }">
        <NuxtLink class="page-link" :to="buildPageLink(currentPage - 1)">Назад</NuxtLink>
      </li>
      <li
        v-for="page in totalPages"
        :key="page"
        class="page-item"
        :class="{ active: page === currentPage }"
      >
        <NuxtLink class="page-link" :to="buildPageLink(page)">{{ page }}</NuxtLink>
      </li>
      <li class="page-item" :class="{ disabled: currentPage >= totalPages }">
        <NuxtLink class="page-link" :to="buildPageLink(currentPage + 1)">Вперед</NuxtLink>
      </li>
    </ul>
  </nav>
</template>
