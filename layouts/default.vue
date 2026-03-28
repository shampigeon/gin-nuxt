<template>
  <div class="d-flex flex-column min-vh-100 app-shell">
    <header class="app-header border-bottom">
      <nav class="navbar navbar-expand-lg">
        <div class="container">
          <NuxtLink to="/" class="navbar-brand fw-bold text-light">
            GIN Nuxt
          </NuxtLink>

          <div class="navbar-nav ms-auto flex-row gap-3">
            <NuxtLink to="/" class="nav-link px-0 text-light-emphasis">Каталог</NuxtLink>
            <NuxtLink to="/login" class="nav-link px-0 text-light-emphasis">Вход</NuxtLink>
            <NuxtLink to="/register" class="btn btn-primary btn-sm">Регистрация</NuxtLink>
          </div>
        </div>
      </nav>
    </header>

    <main class="flex-grow-1 app-main">
      <slot />
    </main>

    <footer class="app-footer border-top mt-auto">
      <div class="container py-4 d-flex flex-column flex-md-row justify-content-between gap-2">
        <div>
          <div class="fw-semibold text-light">GIN Nuxt</div>
          <div class="text-light-emphasis small">SSR-клиент без старой Bootstrap-темы.</div>
        </div>
        <div class="text-light-emphasis small">
          API: {{ useRuntimeConfig().public.apiBase }}
        </div>
      </div>
    </footer>
  </div>
</template>
