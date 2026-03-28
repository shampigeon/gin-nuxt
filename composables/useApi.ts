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

function getApiBase() {
  return useRuntimeConfig().public.apiBase
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
    const part = candidate.part as Record<string, any> | undefined

    return {
      ...candidate.post,
      part: {
        address: part?.address,
        isApartment: part?.isApartment,
        floor: part?.floor,
        rooms: part?.rooms,
        area: part?.area,
        balcony: part?.balcony,
        separateBathroom: part?.separateBathroom,
        renovation: part?.renovation,
        elevator: part?.elevator,
        gas: part?.gas,
        yearConstruction: part?.yearConstruction,
        parking: part?.parking,
        privateTerritory: part?.privateTerritory
      }
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
  const baseURL = getApiBase()

  logApi('request', { path, baseURL, method: 'GET', params: params.toString() })
  const response = await $fetch<PostsListResponse>(path, {
    baseURL,
    params
  })
  logApi('response', { path, total: response.total, listLength: response.list?.length || 0 })

  return { response: normalizePostsResponse(response), limit, page }
}

export async function fetchCategoryPosts(
  categoryId: string | number,
  query: Record<string, string | string[] | undefined>
) {
  const { params, limit, page } = buildPostListQuery(query)
  const path = `/v1/public/category/${categoryId}/items`
  const baseURL = getApiBase()

  logApi('request', { path, baseURL, method: 'GET', params: params.toString() })
  const response = await $fetch<PostsListResponse | { list: ApiFlatListItem[]; total: number }>(
    path,
    {
    baseURL,
    params
    }
  )
  logApi('response', { path, total: response.total, listLength: response.list?.length || 0 })

  return { response: normalizePostsResponse(response), limit, page }
}

export async function fetchPostDetails(postId: string | number) {
  const path = `/v1/public/posts/get-one/${postId}`
  const baseURL = getApiBase()

  logApi('request', { path, baseURL, method: 'GET' })
  const response = await $fetch<PostResponse>(path, {
    baseURL
  })
  logApi('response', { path, hasData: Boolean(response.data), postId })

  return {
    data: normalizePost(response.data)
  }
}

export async function fetchCategoryTree(categoryId = 1) {
  const path = `/v1/public/category/${categoryId}/get-tree`
  const baseURL = getApiBase()

  logApi('request', { path, baseURL, method: 'GET' })
  const response = await $fetch<ApiCategory>(path, {
    baseURL
  })
  logApi('response', { path, categoryId: response.id, childrenCount: response.children?.length || 0 })
  return response
}

export async function fetchCategoryFilters(categoryId: string | number) {
  const path = `/v1/public/category/${categoryId}/filter-fields`
  const baseURL = getApiBase()

  logApi('request', { path, baseURL, method: 'GET' })
  const response = await $fetch<FilterFieldsResponse>(path, {
    baseURL
  })
  logApi('response', { path, fieldsCount: response.fields?.length || 0 })

  return response.fields as FilterField[]
}

export async function fetchCategoryFields(categoryId: string | number) {
  const path = `/v1/public/category/${categoryId}/fields`
  const baseURL = getApiBase()

  logApi('request', { path, baseURL, method: 'GET' })
  const response = await $fetch<FilterFieldsResponse>(path, {
    baseURL
  })
  logApi('response', { path, fieldsCount: response.fields?.length || 0 })

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
