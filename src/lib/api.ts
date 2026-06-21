/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios'
import { toast } from 'sonner'

/**
 * Determine the correct base URL:
 * - Client-side (browser): Use /api/proxy which forwards to backend with httpOnly cookies
 * - Server-side (SSR/server actions): Use the backend URL directly (cookies are handled manually)
 */
const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    // Client-side: proxy through Next.js to forward httpOnly cookies
    return '/api/v1'
  }
  // Server-side: direct backend access (cookies forwarded manually)
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'
  return `${backendUrl}`
}
const api = axios.create({
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use(config => {
  config.baseURL = getBaseURL()
  return config
})

let isRefreshing = false
let failedQueue: any[] = []

const processQueue = (error: any) => {
  failedQueue.forEach(prom => error ? prom.reject(error) : prom.resolve())
  failedQueue = []
}

api.interceptors.response.use(
  res => res,
  async error => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(() => api(original))
      }
      original._retry = true
      isRefreshing = true
      try {
        await api.post('/auth/refresh-token')
        processQueue(null)
        return api(original)
      } catch (err) {
        processQueue(err)
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }
    
    // Global error toast logic can be added here
    if (error.response?.status !== 401 && typeof window !== 'undefined') {
        const message = error.response?.data?.message || 'Something went wrong'
        toast.error(message) 
    }
    return Promise.reject(error)
  }
)

export default api

