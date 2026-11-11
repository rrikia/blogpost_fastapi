// Everything that talks to the FastAPI backend lives in this file.

const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:8000').replace(/\/$/, '')
const TOKEN_KEY = 'blogpost_token'

// ---- Types (mirror app/schemas.py) ----

export type User = { id: number; email: string; created_at: string }

export type Post = {
  id: number
  title: string
  content: string
  published: boolean
  created_at: string
  owner_id: number
  owner: User
}

// GET /posts and GET /posts/{id} return { Post: {...}, votes: n }
export type PostWithVotes = { Post: Post; votes: number }

export type Comment = {
  id: number
  content: string
  created_at: string
  post_id: number
  owner_id: number
  owner: User
}

export type PostInput = { title: string; content: string; published: boolean }

// ---- Token storage ----

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (token: string) => localStorage.setItem(TOKEN_KEY, token)
export const clearToken = () => localStorage.removeItem(TOKEN_KEY)

// Read user_id out of the JWT payload so the UI knows which posts are yours.
// (This is only for showing/hiding buttons; the backend still checks ownership.)
export function currentUserId(): number | null {
  const token = getToken()
  if (!token) return null
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    if (payload.exp && payload.exp * 1000 < Date.now()) return null
    return Number(payload.user_id)
  } catch {
    return null
  }
}

// ---- Request helper ----

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

// Called when the backend answers 401 (token missing or expired)
let onUnauthorized: () => void = () => {}
export const setUnauthorizedHandler = (fn: () => void) => (onUnauthorized = fn)

// Render's free tier sleeps; the first request can take ~1 minute.
// Listeners get told when a request is slow so the UI can explain why.
type SlowListener = (slow: boolean) => void
const slowListeners = new Set<SlowListener>()
export const onSlowRequest = (fn: SlowListener) => {
  slowListeners.add(fn)
  return () => slowListeners.delete(fn)
}
let pending = 0

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)
  const token = getToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)
  if (options.body && !(options.body instanceof URLSearchParams)) {
    headers.set('Content-Type', 'application/json')
  }

  pending++
  const timer = setTimeout(() => slowListeners.forEach((fn) => fn(true)), 3000)
  try {
    const res = await fetch(`${API_URL}${path}`, { ...options, headers })
    if (res.status === 401) onUnauthorized()
    if (!res.ok) {
      const body = await res.json().catch(() => null)
      const detail = body?.detail
      const message =
        typeof detail === 'string'
          ? detail
          : Array.isArray(detail)
            ? detail.map((d: { msg: string }) => d.msg).join(', ')
            : `Request failed (${res.status})`
      throw new ApiError(res.status, message)
    }
    if (res.status === 204) return undefined as T
    return (await res.json()) as T
  } finally {
    clearTimeout(timer)
    if (--pending === 0) slowListeners.forEach((fn) => fn(false))
  }
}

// ---- Endpoints ----

export const api = {
  register: (email: string, password: string) =>
    request<User>('/users/', { method: 'POST', body: JSON.stringify({ email, password }) }),

  // /login uses OAuth2PasswordRequestForm: form-encoded, email goes in "username"
  login: (email: string, password: string) =>
    request<{ access_token: string; token_type: string }>('/login', {
      method: 'POST',
      body: new URLSearchParams({ username: email, password }),
    }),

  getPosts: (search = '', limit = 10, skip = 0) =>
    request<PostWithVotes[]>(
      `/posts/?${new URLSearchParams({ search, limit: String(limit), skip: String(skip) })}`,
    ),
  getPost: (id: number) => request<PostWithVotes>(`/posts/${id}`),
  createPost: (data: PostInput) =>
    request<Post>('/posts/', { method: 'POST', body: JSON.stringify(data) }),
  updatePost: (id: number, data: PostInput) =>
    request<Post>(`/posts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePost: (id: number) => request<void>(`/posts/${id}`, { method: 'DELETE' }),

  vote: (postId: number, dir: 0 | 1) =>
    request<{ message: string }>('/vote/', {
      method: 'POST',
      body: JSON.stringify({ post_id: postId, dir }),
    }),

  getComments: (postId: number) => request<Comment[]>(`/posts/${postId}/comments`),
  addComment: (postId: number, content: string) =>
    request<Comment>(`/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),
  deleteComment: (id: number) => request<void>(`/comments/${id}`, { method: 'DELETE' }),
}
