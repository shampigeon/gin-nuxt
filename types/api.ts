export type ApiErrorPayload = {
  error?: {
    code?: number
    message?: string
    errors?: string[]
  }
}

export type ApiFile = {
  id?: number
  url?: string
  URL?: string
  type?: number
}

export type ApiRegion = {
  id?: number
  name?: string
}

export type ApiCategory = {
  id: number
  value?: number
  label: string
  search_name?: string
  parentID?: number | null
  children?: ApiCategory[]
}

export type ApiPost = {
  id: number
  title: string
  description: string
  price: number
  status?: number
  categoryID?: number
  category?: ApiCategory | null
  regionID?: number | null
  region?: ApiRegion | null
  files?: ApiFile[]
  createdAt?: string
  updatedAt?: string
}

export type ApiPostFlatPart = {
  address?: string
  isApartment?: boolean | null
  floor?: number | null
  rooms?: number | null
  area?: number | null
  balcony?: boolean | null
  separateBathroom?: boolean | null
  renovation?: number | null
  elevator?: boolean | null
  gas?: boolean | null
  yearConstruction?: number | null
  parking?: number | null
  privateTerritory?: boolean | null
}

export type ApiPostDetails = ApiPost & {
  part?: ApiPostFlatPart | null
}

export type ApiFlatListItem = {
  post?: ApiPost
} & ApiPostFlatPart

export type PostsListResponse = {
  list: ApiPost[]
  total: number
}

export type PostResponse = {
  data: ApiPostDetails
}

export type FilterField = {
  name: string
  fieldName: string
  input: 'text' | 'textarea' | 'checkbox' | 'select'
  dataType: 'string' | 'number' | 'bool'
  binding?: string
  values?: Record<string, string> | Record<number, string>
}

export type FilterFieldsResponse = {
  fields: FilterField[]
}

export type LoginPayload = {
  nickname: string
  password: string
}

export type RegisterPayload = {
  firstName: string
  lastName: string
  phone: string
  nickname: string
  password: string
  confirmPassword: string
}

export type LoginResponse = {
  accessToken: string
  refreshToken: string
}

export type RegisterResponse = {
  id: number
}

export type CategoryFieldsCreateResponse = {
  fields: FilterField[]
}
