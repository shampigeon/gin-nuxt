import type {
  ApiCategory,
  ApiErrorPayload,
  ApiFlatListItem,
  FilterField,
  FilterFieldsResponse,
  LoginPayload,
  LoginResponse,
  PostsListResponse,
  PostResponse,
  RegisterPayload,
  RegisterResponse
} from '~/types/api'

function getApiBase(): string {
  return useRuntimeConfig().public.apiBase as string
}

function buildUrl(path: string, params?: Record<string, string | undefined>): string {
  const url = new URL(getApiBase() + path)
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== '') {
        url.searchParams.set(key, value)
      }
    }
  }
  return url.toString()
}

async function apiFetch<T>(path: string, params?: Record<string, string | undefined>): Promise<T> {
  return $fetch<T>(buildUrl(path, params))
}

function logApi(label: string, payload: Record<string, any>) {
  console.log(`[useApi] ${label}`, payload)
}

function normalizeQueryValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0]
  }

  return value
}

export function buildPostListQuery(query: Record<string, string | string[] | undefined>) {
  const params = new URLSearchParams()
  const page = Number(normalizeQueryValue(query.page) || '1')
  const limit = 12
  const offset = Math.max(page - 1, 0) * limit

  params.set('limit', String(limit))
  params.set('offset', String(offset))

  const search = normalizeQueryValue(query.search)
  if (search) {
    params.set('search', search)
  }

  const priceFrom = normalizeQueryValue(query.priceFrom)
  if (priceFrom) {
    params.set('priceFrom', priceFrom)
  }

  const priceTo = normalizeQueryValue(query.priceTo)
  if (priceTo) {
    params.set('priceTo', priceTo)
  }

  for (const [key, rawValue] of Object.entries(query)) {
    if (['page', 'search', 'priceFrom', 'priceTo'].includes(key)) {
      continue
    }

    const value = normalizeQueryValue(rawValue)
    if (value) {
      params.set(key, value)
    }
  }

  return { params, limit, page }
}

function extractErrorMessage(error: unknown) {
  const payload = (error as { data?: ApiErrorPayload })?.data
  if (payload?.error?.errors?.length) {
    return payload.error.errors.join(', ')
  }

  if (payload?.error?.message) {
    return payload.error.message
  }

  return 'Не удалось выполнить запрос к API.'
}

function normalizePost(item: unknown) {
  const candidate = item as Record<string, any>

  if (candidate?.post?.id) {
    return {
      ...candidate.post,
      part: candidate.part ?? null
    }
  }

  return candidate
}

function normalizePostsResponse(response: PostsListResponse | { list: ApiFlatListItem[]; total: number }) {
  return {
    list: (response.list || []).map(normalizePost),
    total: response.total || 0
  }
}

export async function fetchPublicPosts(query: Record<string, string | string[] | undefined>) {
  const { params, limit, page } = buildPostListQuery(query)
  const path = '/v1/public/posts/list'
  const response = await apiFetch<PostsListResponse>(path, Object.fromEntries(params))
  return { response: normalizePostsResponse(response), limit, page }
}

export async function fetchCategoryPosts(
  categoryId: string | number,
  query: Record<string, string | string[] | undefined>
) {
  const { params, limit, page } = buildPostListQuery(query)
  const path = `/v1/public/category/${categoryId}/items`
  const response = await apiFetch<PostsListResponse>(path, Object.fromEntries(params))
  return { response: normalizePostsResponse(response), limit, page }
}

export async function fetchRecentCategoryPosts(categoryId: number, limit: number) {
  const path = `/v1/public/category/${categoryId}/items`
  const response = await apiFetch<PostsListResponse>(path, { limit: String(limit), offset: '0', recursive: 'true' })
  return (response.list || []).map(normalizePost)
}

export async function fetchPostDetails(postId: string | number) {
  const path = `/v1/public/posts/get-one/${postId}`
  const response = await apiFetch<PostResponse>(path)
  return { data: normalizePost(response.data) }
}

export async function fetchCategoryTree(categoryId = 1) {
  const path = `/v1/public/category/${categoryId}/get-tree`
  return apiFetch<ApiCategory>(path)
}

export async function fetchCategoryFilters(categoryId: string | number) {
  const response = await apiFetch<FilterFieldsResponse>(`/v1/public/category/${categoryId}/filter-fields`)
  return response.fields as FilterField[]
}

export async function fetchCategoryFields(categoryId: string | number) {
  const response = await apiFetch<FilterFieldsResponse>(`/v1/public/category/${categoryId}/fields`)
  return response.fields as FilterField[]
}

export async function login(payload: LoginPayload) {
  const path = '/v1/public/auth/login'
  const baseURL = getApiBase()

  try {
    logApi('request', { path, baseURL, method: 'POST', body: payload })
    const response = await $fetch<LoginResponse>(path, {
      baseURL,
      method: 'POST',
      body: payload
    })
    logApi('response', { path, hasAccessToken: Boolean(response.accessToken) })
    return response
  } catch (error) {
    logApi('error', { path, message: extractErrorMessage(error), error })
    throw new Error(extractErrorMessage(error))
  }
}

export async function register(payload: RegisterPayload) {
  const path = '/v1/public/auth/register'
  const baseURL = getApiBase()

  try {
    logApi('request', { path, baseURL, method: 'POST', body: payload })
    const response = await $fetch<RegisterResponse>(path, {
      baseURL,
      method: 'POST',
      body: payload
    })
    logApi('response', { path, registeredId: response.id })
    return response
  } catch (error) {
    logApi('error', { path, message: extractErrorMessage(error), error })
    throw new Error(extractErrorMessage(error))
  }
}
