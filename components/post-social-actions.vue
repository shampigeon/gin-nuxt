<script setup lang="ts">
import { authFetch } from '~/composables/useClientAuth'

const props = defineProps<{
  postId: number
  compact?: boolean
}>()

const favoriteActive = ref(false)
const likeActive = ref(false)
const pendingAction = ref<'favorite' | 'like' | null>(null)
const errorMessage = ref('')

async function toggleFavorite() {
  pendingAction.value = 'favorite'
  errorMessage.value = ''

  try {
    const response = await authFetch<{ status: 'added' | 'deleted'; id: number }>(
      `/v1/internal/posts/toggle-favorite/${props.postId}`,
      {
        method: 'POST'
      }
    )

    favoriteActive.value = response.status === 'added'
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Не удалось изменить избранное.'
  } finally {
    pendingAction.value = null
  }
}

async function toggleLike() {
  pendingAction.value = 'like'
  errorMessage.value = ''

  try {
    const response = await authFetch<{ status: 'added' | 'deleted'; id: number }>(
      `/v1/internal/posts/toggle-like/${props.postId}`,
      {
        method: 'POST'
      }
    )

    likeActive.value = response.status === 'added'
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Не удалось изменить лайк.'
  } finally {
    pendingAction.value = null
  }
}
</script>

<template>
  <div>
    <div class="d-flex flex-wrap gap-2" :class="{ 'justify-content-end': compact }">
      <button
        type="button"
        class="btn btn-sm"
        :class="likeActive ? 'btn-primary' : 'btn-outline-primary'"
        :disabled="pendingAction !== null"
        @click="toggleLike"
      >
        {{ pendingAction === 'like' ? '...' : likeActive ? 'Лайк добавлен' : 'Лайк' }}
      </button>
      <button
        type="button"
        class="btn btn-sm"
        :class="favoriteActive ? 'btn-warning' : 'btn-outline-warning'"
        :disabled="pendingAction !== null"
        @click="toggleFavorite"
      >
        {{ pendingAction === 'favorite' ? '...' : favoriteActive ? 'В избранном' : 'В избранное' }}
      </button>
    </div>

    <div v-if="errorMessage" class="small text-danger mt-2">
      {{ errorMessage }}
    </div>
  </div>
</template>
