import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
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
        // toast.error(message) // Assuming sonner toast will be imported and used
    }
    return Promise.reject(error)
  }
)

export default api
