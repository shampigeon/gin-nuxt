<template>
  <div style="min-height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; background:#0f1117; color:#e8eaf0; font-family:system-ui,sans-serif; text-align:center; padding:2rem;">
    <div style="font-size:3rem; font-weight:700; color:#4f8ef7; margin-bottom:0.5rem;">
      {{ error.statusCode || '?' }}
    </div>
    <h1 style="font-size:1.25rem; font-weight:600; margin-bottom:0.75rem;">{{ title }}</h1>
    <p style="color:#8892a4; max-width:400px; margin-bottom:2rem; line-height:1.6;">{{ message }}</p>
    <button
      style="background:#4f8ef7; color:#fff; border:none; border-radius:8px; padding:0.5rem 1.5rem; font-size:0.9rem; cursor:pointer;"
      @click="clearError({ redirect: '/' })"
    >
      На главную
    </button>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ error: { statusCode?: number; statusMessage?: string } }>()

const title = computed(() => {
  const code = props.error.statusCode
  if (code === 404) return 'Страница не найдена'
  if (code && code >= 500) return 'Сервис недоступен'
  return 'Что-то пошло не так'
})

const message = computed(() => {
  const code = props.error.statusCode
  if (code && code >= 500) return 'Не удалось подключиться к серверу. Попробуйте обновить страницу через несколько минут.'
  if (code === 404) return 'Запрошенная страница не существует или была удалена.'
  return props.error.statusMessage || 'Произошла неожиданная ошибка.'
})
</script>
