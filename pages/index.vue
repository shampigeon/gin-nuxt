<script setup lang="ts">
import { fetchRecentCategoryPosts, fetchCategoryTree } from '~/composables/useApi'
import { formatPrice, formatDate, getPrimaryImage } from '~/utils/format'
import { MODULE_BUSINESS, MODULE_WORK, MODULE_FLATS, MODULE_ALL } from '~/constants/modules'
import type { ApiCategory } from '~/types/api'

const runtimeConfig = useRuntimeConfig()
const profile = runtimeConfig.public.buildProfile as string

const hasModule = (m: string) =>
  profile === MODULE_ALL || profile.split(',').map(s => s.trim()).includes(m)

const hasBusiness = hasModule(MODULE_BUSINESS)
const hasWork     = hasModule(MODULE_WORK)
const hasFlats    = hasModule(MODULE_FLATS)

const SECTION_DEFS = [
  { module: MODULE_BUSINESS, enabled: hasBusiness, to: '/business', label: 'Бизнес',       rootId: 52 },
  { module: MODULE_WORK,     enabled: hasWork,     to: '/work',     label: 'Работа',       rootId: 60 },
  { module: MODULE_FLATS,    enabled: hasFlats,    to: '/flats',    label: 'Недвижимость', rootId: 11 },
]
  .filter(s => s.enabled)
  .map(s => ({ ...s, ...useModuleDisplay(s.module) }))

if (SECTION_DEFS.length === 1) {
  await navigateTo(SECTION_DEFS[0].to)
}

useSeoMeta({ title: 'Главная' })

const { data } = await useAsyncData('home', async () => {
  const [postsResults, treeResults] = await Promise.all([
    Promise.allSettled(SECTION_DEFS.map(s => fetchRecentCategoryPosts(s.rootId, s.homeLimit))),
    Promise.allSettled(SECTION_DEFS.map(s => fetchCategoryTree(s.rootId)))
  ])

  return {
    posts: Object.fromEntries(
      SECTION_DEFS.map((s, i) => [
        s.module,
        postsResults[i].status === 'fulfilled' ? (postsResults[i] as PromiseFulfilledResult<any>).value : []
      ])
    ),
    trees: Object.fromEntries(
      SECTION_DEFS.map((s, i) => [
        s.module,
        treeResults[i].status === 'fulfilled' ? (treeResults[i] as PromiseFulfilledResult<any>).value : null
      ])
    )
  }
})

const toolbarItems = computed(() => {
  const items: { label: string; to: string }[] = []
  for (const s of SECTION_DEFS) {
    const tree = data.value?.trees?.[s.module] as ApiCategory | null
    const children = tree?.children ?? []
    if (children.length) {
      for (const child of children) {
        items.push({ label: child.label, to: `/category/${child.id}` })
      }
    } else {
      items.push({ label: s.label, to: s.to })
    }
  }
  return items
})
</script>

<template>
  <div>
    <!-- Category Toolbar -->
    <div class="home-toolbar">
      <div class="container">
        <div class="home-toolbar-inner">
          <NuxtLink to="/" class="toolbar-chip toolbar-chip--active">Все</NuxtLink>
          <NuxtLink
            v-for="item in toolbarItems"
            :key="item.to"
            :to="item.to"
            class="toolbar-chip"
          >
            {{ item.label }}
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Sections -->
    <div class="container py-4">
      <div class="d-flex flex-column gap-5">
        <section v-for="s in SECTION_DEFS" :key="s.module">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h2 class="h5 fw-bold mb-0">{{ s.label }}</h2>
            <NuxtLink :to="s.to" class="home-see-all">Все объявления →</NuxtLink>
          </div>

          <!-- Недвижимость: сетка с фото -->
          <div v-if="s.isGrid" class="home-grid">
            <NuxtLink
              v-for="post in data?.posts?.[s.module]"
              :key="post.id"
              :to="`${s.to}/${post.id}`"
              class="item-card item-card--photo text-decoration-none"
            >
              <img :src="getPrimaryImage(post.files)" :alt="post.title" class="home-card-img" />
              <div class="home-card-body">
                <div class="item-price">{{ formatPrice(post.price) }}</div>
                <div class="item-title mt-1">{{ post.title }}</div>
                <div class="item-meta mt-1">{{ post.region?.name || '' }} · {{ formatDate(post.createdAt) }}</div>
              </div>
            </NuxtLink>
          </div>

          <!-- Работа: список с аватаром -->
          <div v-else-if="s.hasPhoto" class="items-list">
            <NuxtLink
              v-for="post in data?.posts?.[s.module]"
              :key="post.id"
              :to="`${s.to}/${post.id}`"
              class="item-card text-decoration-none d-flex align-items-center gap-3"
            >
              <img :src="getPrimaryImage(post.files)" :alt="post.title" class="home-list-avatar" />
              <div class="flex-grow-1 overflow-hidden">
                <div class="item-title">{{ post.title }}</div>
                <div class="item-meta mt-1 text-truncate">{{ post.description }}</div>
              </div>
              <div class="text-end flex-shrink-0">
                <div class="item-price" style="font-size: 0.95rem;">{{ formatPrice(post.price) }}</div>
                <div class="item-meta mt-1">{{ formatDate(post.createdAt) }}</div>
              </div>
            </NuxtLink>
          </div>

          <!-- Бизнес: список без фото -->
          <div v-else class="items-list">
            <NuxtLink
              v-for="post in data?.posts?.[s.module]"
              :key="post.id"
              :to="`${s.to}/${post.id}`"
              class="item-card text-decoration-none d-flex align-items-center gap-3"
            >
              <div class="flex-grow-1 overflow-hidden">
                <div class="item-title">{{ post.title }}</div>
                <div class="item-meta mt-1 text-truncate">{{ post.description }}</div>
              </div>
              <div class="text-end flex-shrink-0">
                <div class="item-price" style="font-size: 0.95rem;">{{ formatPrice(post.price) }}</div>
                <div class="item-meta mt-1">{{ formatDate(post.createdAt) }}</div>
              </div>
            </NuxtLink>
          </div>

          <p v-if="!data?.posts?.[s.module]?.length" class="item-meta mb-0">Нет объявлений</p>
        </section>
      </div>
    </div>
  </div>
</template>
