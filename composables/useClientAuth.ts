import type { ApiErrorPayload } from '~/types/api'

type StoredTokens = {
  token: string
  refreshToken: string
}

function logAuth(label: string, payload: Record<string, any>) {
  console.log(`[useClientAuth] ${label}`, payload)
}

function parseJwt(token: string) {
  const base64Url = token.split('.')[1]
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map((char) => `%${(`00${char.charCodeAt(0).toString(16)}`).slice(-2)}`)
      .join('')
  )

  return JSON.parse(jsonPayload) as { exp?: number }
}

function getStoredTokens(): StoredTokens | null {
  if (!process.client) {
    return null
  }

  const token = localStorage.getItem('token')
  const refreshToken = localStorage.getItem('refreshToken')

  if (!token || !refreshToken) {
    return null
  }

  return { token, refreshToken }
}

function extractError(error: unknown) {
  const payload = (error as { data?: ApiErrorPayload })?.data
  if (payload?.error?.errors?.length) {
    return payload.error.errors.join(', ')
  }

  return payload?.error?.message || 'Не удалось выполнить авторизованный запрос.'
}

export async function getValidAccessToken() {
  const config = useRuntimeConfig()
  const router = useRouter()
  const stored = getStoredTokens()

  if (!stored) {
    logAuth('missing_tokens', { redirectTo: '/login' })
    await router.push('/login')
    return null
  }

  const payload = parseJwt(stored.token)
  const currentTime = Math.floor(Date.now() / 1000)

  if (payload.exp && payload.exp > currentTime + 30) {
    logAuth('token_valid', { exp: payload.exp, currentTime })
    return stored.token
  }

  try {
    const path = '/v1/public/auth/refresh-tokens'

    logAuth('request', {
      path,
      baseURL: config.public.apiBase,
      method: 'POST',
      body: { refreshToken: stored.refreshToken }
    })
    const refreshed = await $fetch<{ accessToken: string; refreshToken: string }>(
      path,
      {
        baseURL: config.public.apiBase,
        method: 'POST',
        body: {
          refreshToken: stored.refreshToken
        }
      }
    )

    logAuth('response', { path, hasAccessToken: Boolean(refreshed.accessToken) })
    localStorage.setItem('token', refreshed.accessToken)
    localStorage.setItem('refreshToken', refreshed.refreshToken)
    return refreshed.accessToken
  } catch (error) {
    logAuth('error', { path: '/v1/public/auth/refresh-tokens', error })
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    await router.push('/login')
    return null
  }
}

export async function authFetch<T>(path: string, options: Parameters<typeof $fetch<T>>[1] = {}) {
  const token = await getValidAccessToken()
  if (!token) {
    throw new Error('Не выполнен вход в систему.')
  }

  try {
    const baseURL = useRuntimeConfig().public.apiBase

    logAuth('request', {
      path,
      baseURL,
      method: options.method || 'GET',
      body: options.body,
      params: options.params
    })
    const response = await $fetch<T>(path, {
      ...options,
      baseURL,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`
      }
    })
    logAuth('response', { path, method: options.method || 'GET' })
    return response
  } catch (error) {
    logAuth('error', { path, method: options.method || 'GET', message: extractError(error), error })
    throw new Error(extractError(error))
  }
}
