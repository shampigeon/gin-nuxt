<script setup lang="ts">
useSeoMeta({
  title: 'Профиль',
  description: 'Личный кабинет пользователя'
})
</script>

<template>
  <div class="container py-4 py-lg-5">
    <div class="row g-4">
      <div class="col-lg-3">
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <h2 class="h5 mb-3">Кабинет</h2>
            <div class="nav flex-column gap-2">
              <NuxtLink to="/profile" class="btn btn-outline-secondary text-start">Мои объявления</NuxtLink>
              <NuxtLink to="/profile/posts/create" class="btn btn-outline-secondary text-start">Создать объявление</NuxtLink>
              <NuxtLink to="/profile/favorites" class="btn btn-outline-secondary text-start">Избранное</NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-9">
        <ProfilePrivatePostsPanel />
      </div>
    </div>
  </div>
</template>
