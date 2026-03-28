<script setup lang="ts">
import { login } from '~/composables/useApi'

const router = useRouter()

const form = reactive({
  nickname: '',
  password: ''
})

const pending = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

async function submit() {
  pending.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const response = await login(form)

    if (process.client) {
      localStorage.setItem('token', response.accessToken)
      localStorage.setItem('refreshToken', response.refreshToken)
    }

    successMessage.value = 'Вход выполнен. Токены сохранены в localStorage.'
    await router.push('/')
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Не удалось выполнить вход.'
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <form class="card border-0 shadow-sm" @submit.prevent="submit">
    <div class="card-body p-4">
      <h1 class="h3 mb-3">Вход</h1>
      <p class="text-secondary">
        Используется реальный контракт `POST /v1/public/auth/login`.
      </p>

      <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
      <div v-if="successMessage" class="alert alert-success">{{ successMessage }}</div>

      <div class="mb-3">
        <label class="form-label" for="nickname">Никнейм</label>
        <input id="nickname" v-model="form.nickname" class="form-control" required />
      </div>

      <div class="mb-4">
        <label class="form-label" for="password">Пароль</label>
        <input id="password" v-model="form.password" type="password" class="form-control" required />
      </div>

      <button type="submit" class="btn btn-primary w-100" :disabled="pending">
        {{ pending ? 'Входим...' : 'Войти' }}
      </button>
    </div>
  </form>
</template>
