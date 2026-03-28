<script setup lang="ts">
import { register } from '~/composables/useApi'

const router = useRouter()

const form = reactive({
  firstName: '',
  lastName: '',
  phone: '',
  nickname: '',
  password: '',
  confirmPassword: ''
})

const pending = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

async function submit() {
  pending.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const response = await register(form)
    successMessage.value = `Пользователь создан, id: ${response.id}.`
    await router.push('/login')
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Не удалось завершить регистрацию.'
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <form class="card border-0 shadow-sm" @submit.prevent="submit">
    <div class="card-body p-4">
      <h1 class="h3 mb-3">Регистрация</h1>
      <p class="text-secondary">
        Используется реальный контракт `POST /v1/public/auth/register`.
      </p>

      <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
      <div v-if="successMessage" class="alert alert-success">{{ successMessage }}</div>

      <div class="row g-3">
        <div class="col-md-6">
          <label class="form-label" for="firstName">Имя</label>
          <input id="firstName" v-model="form.firstName" class="form-control" />
        </div>
        <div class="col-md-6">
          <label class="form-label" for="lastName">Фамилия</label>
          <input id="lastName" v-model="form.lastName" class="form-control" />
        </div>
        <div class="col-md-6">
          <label class="form-label" for="phone">Телефон</label>
          <input id="phone" v-model="form.phone" class="form-control" placeholder="+79991234567" />
        </div>
        <div class="col-md-6">
          <label class="form-label" for="nickname">Никнейм</label>
          <input id="nickname" v-model="form.nickname" class="form-control" required />
        </div>
        <div class="col-md-6">
          <label class="form-label" for="password">Пароль</label>
          <input id="password" v-model="form.password" type="password" class="form-control" required />
        </div>
        <div class="col-md-6">
          <label class="form-label" for="confirmPassword">Подтвердите пароль</label>
          <input
            id="confirmPassword"
            v-model="form.confirmPassword"
            type="password"
            class="form-control"
            required
          />
        </div>
      </div>

      <button type="submit" class="btn btn-primary w-100 mt-4" :disabled="pending">
        {{ pending ? 'Регистрируем...' : 'Создать аккаунт' }}
      </button>
    </div>
  </form>
</template>
