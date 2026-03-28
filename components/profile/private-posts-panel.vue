<script setup lang="ts">
import type { ApiPost } from '~/types/api'
import { authFetch } from '~/composables/useClientAuth'
import { formatPrice } from '~/utils/format'

const statuses = [
  { value: '1', label: 'Черновики' },
  { value: '2', label: 'Опубликованные' },
  { value: '3', label: 'Снятые с публикации' },
  { value: '4', label: 'Отклоненные' }
]

const activeStatus = ref('1')
const posts = ref<ApiPost[]>([])
const pending = ref(false)
const actionPendingId = ref<number | null>(null)
const errorMessage = ref('')
const currentPage = ref(1)
const limit = 10
const total = ref(0)

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / limit)))

async function loadPosts() {
  pending.value = true
  errorMessage.value = ''

  try {
    const response = await authFetch<{ list: ApiPost[]; total: number }>('/v1/internal/posts/list', {
      query: {
        status: activeStatus.value,
        limit,
        offset: (currentPage.value - 1) * limit
      }
    })

    posts.value = response.list || []
    total.value = response.total || 0
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Не удалось загрузить объявления.'
  } finally {
    pending.value = false
  }
}

function nextStatusFor(post: ApiPost) {
  if (post.status === 2) {
    return 3
  }

  return 2
}

function nextStatusLabel(post: ApiPost) {
  if (post.status === 2) {
    return 'Снять с публикации'
  }

  return 'Опубликовать'
}

async function changeStatus(post: ApiPost) {
  actionPendingId.value = post.id
  errorMessage.value = ''

  try {
    await authFetch(`/v1/internal/posts/change-status/${post.id}`, {
      method: 'POST',
      body: {
        status: nextStatusFor(post)
      }
    })

    await loadPosts()
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Не удалось изменить статус.'
  } finally {
    actionPendingId.value = null
  }
}

async function deletePost(post: ApiPost) {
  if (!window.confirm(`Удалить объявление "${post.title}"?`)) {
    return
  }

  actionPendingId.value = post.id
  errorMessage.value = ''

  try {
    await authFetch(`/v1/internal/posts/delete/${post.id}`, {
      method: 'DELETE'
    })

    await loadPosts()
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Не удалось удалить объявление.'
  } finally {
    actionPendingId.value = null
  }
}

watch(activeStatus, async () => {
  currentPage.value = 1
  await loadPosts()
})

watch(currentPage, async () => {
  await loadPosts()
})

onMounted(async () => {
  await loadPosts()
})
</script>

<template>
  <div class="card border-0 shadow-sm">
    <div class="card-body p-4">
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h1 class="h3 mb-1">Мои объявления</h1>
          <p class="text-secondary mb-0">Внутренняя ручка `GET /v1/internal/posts/list`.</p>
        </div>
        <NuxtLink to="/profile/posts/create" class="btn btn-primary">
          Создать объявление
        </NuxtLink>
      </div>

      <ul class="nav nav-tabs mb-4">
        <li v-for="status in statuses" :key="status.value" class="nav-item">
          <button
            type="button"
            class="nav-link"
            :class="{ active: activeStatus === status.value }"
            @click="activeStatus = status.value"
          >
            {{ status.label }}
          </button>
        </li>
      </ul>

      <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
      <div v-else-if="pending" class="text-secondary">Загрузка объявлений...</div>
      <div v-else-if="!posts.length" class="alert alert-light border mb-0">
        Объявления в этом статусе не найдены.
      </div>
      <div v-else class="table-responsive">
        <table class="table align-middle">
          <thead>
            <tr>
              <th>Название</th>
              <th>Цена</th>
              <th>Регион</th>
              <th>Обновлено</th>
              <th class="text-end">Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="post in posts" :key="post.id">
              <td>{{ post.title }}</td>
              <td>{{ formatPrice(post.price) }}</td>
              <td>{{ post.region?.name || 'Не указан' }}</td>
              <td>{{ post.updatedAt || 'Не указано' }}</td>
              <td class="text-end">
                <div class="d-inline-flex gap-2 flex-wrap justify-content-end">
                  <button
                    type="button"
                    class="btn btn-sm btn-outline-primary"
                    :disabled="actionPendingId === post.id"
                    @click="changeStatus(post)"
                  >
                    {{ actionPendingId === post.id ? '...' : nextStatusLabel(post) }}
                  </button>
                  <button
                    type="button"
                    class="btn btn-sm btn-outline-danger"
                    :disabled="actionPendingId === post.id"
                    @click="deletePost(post)"
                  >
                    Удалить
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="small text-secondary mt-3">
        Редактирование пока не добавлено: в `gin-content` нет внутренней ручки чтения одного объявления,
        поэтому безопасно подгрузить черновик в форму нельзя.
      </div>

      <div v-if="totalPages > 1" class="mt-3 d-flex gap-2 flex-wrap">
        <button
          v-for="page in totalPages"
          :key="page"
          type="button"
          class="btn btn-sm"
          :class="page === currentPage ? 'btn-primary' : 'btn-outline-secondary'"
          @click="currentPage = page"
        >
          {{ page }}
        </button>
      </div>
    </div>
  </div>
</template>
