<script setup lang="ts">
useSeoMeta({
  title: 'Избранное',
  description: 'Избранные объявления'
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
        <div class="card border-0 shadow-sm">
          <div class="card-body p-4">
            <h1 class="h3 mb-3">Избранное</h1>
            <div class="alert alert-warning mb-0">
              Список избранного пока нельзя отрисовать по данным API:
              `GET /v1/internal/posts/list-favorite` в `gin-content` не реализован и не возвращает рабочий контракт.
              Кнопки добавления и удаления избранного уже работают на карточках и странице объявления.
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
