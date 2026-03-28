<template>
  <div class="d-flex flex-column min-vh-100">
    <header class="site-header">
      <nav class="navbar navbar-expand-lg">
        <div class="container">
          <NuxtLink to="/" class="navbar-brand">
            {{ siteName }}
          </NuxtLink>

          <div class="navbar-nav mx-auto flex-row gap-3 d-none d-lg-flex">
            <NuxtLink v-if="hasBusiness" to="/business" class="nav-link" active-class="active">Бизнес</NuxtLink>
            <NuxtLink v-if="hasWork"     to="/work"     class="nav-link" active-class="active">Работа</NuxtLink>
            <NuxtLink v-if="hasFlats"    to="/flats"    class="nav-link" active-class="active">Квартиры</NuxtLink>
          </div>

          <div class="d-flex align-items-center gap-2">
            <NuxtLink to="/profile/posts/create" class="btn btn-primary btn-sm header-post-btn">
              Подать объявление
            </NuxtLink>
            <template v-if="isLoggedIn">
              <NuxtLink to="/profile" class="btn btn-outline-secondary btn-sm">Профиль</NuxtLink>
              <button class="btn btn-link btn-sm header-logout-btn" @click="logout">Выйти</button>
            </template>
            <NuxtLink v-else to="/login" class="btn btn-outline-primary btn-sm">Войти</NuxtLink>
          </div>
        </div>
      </nav>

      <div v-if="hasBusiness || hasWork || hasFlats" class="d-lg-none border-top py-2">
        <div class="container d-flex gap-3">
          <NuxtLink v-if="hasBusiness" to="/business" class="nav-link" active-class="active">Бизнес</NuxtLink>
          <NuxtLink v-if="hasWork"     to="/work"     class="nav-link" active-class="active">Работа</NuxtLink>
          <NuxtLink v-if="hasFlats"    to="/flats"    class="nav-link" active-class="active">Квартиры</NuxtLink>
        </div>
      </div>
    </header>

    <main class="flex-grow-1">
      <slot />
    </main>

    <footer class="site-footer">
      <div class="container d-flex flex-column flex-md-row justify-content-between gap-2">
        <div class="fw-semibold">{{ siteName }}</div>
        <div>API: {{ useRuntimeConfig().public.apiBase }}</div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { MODULE_BUSINESS, MODULE_WORK, MODULE_FLATS, MODULE_ALL } from '~/constants/modules'

const runtimeConfig = useRuntimeConfig()
const profile = runtimeConfig.public.buildProfile as string

const hasModule = (m: string) =>
  profile === MODULE_ALL || profile.split(',').map(s => s.trim()).includes(m)

const hasBusiness = hasModule(MODULE_BUSINESS)
const hasWork     = hasModule(MODULE_WORK)
const hasFlats    = hasModule(MODULE_FLATS)

const siteName = hasBusiness ? 'BizPortal' : 'Classifieds'

const isLoggedIn = ref(false)
const router = useRouter()

onMounted(() => {
  isLoggedIn.value = Boolean(localStorage.getItem('token'))
})

function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('refreshToken')
  isLoggedIn.value = false
  router.push('/')
}
</script>
