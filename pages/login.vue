<script setup lang="ts">
useSeoMeta({
  title: 'Вход',
  description: 'Авторизация пользователя'
})
</script>

<template>
  <div class="container py-4 py-lg-5 auth-page">
    <div class="row justify-content-center">
      <div class="col-lg-5">
        <AuthLoginForm />
      </div>
    </div>
  </div>
</template>
