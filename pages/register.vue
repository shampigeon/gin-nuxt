<script setup lang="ts">
useSeoMeta({
  title: 'Регистрация',
  description: 'Создание аккаунта пользователя'
})
</script>

<template>
  <div class="container py-4 py-lg-5 auth-page">
    <div class="row justify-content-center">
      <div class="col-lg-7">
        <AuthRegisterForm />
      </div>
    </div>
  </div>
</template>
