import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import api from '@/lib/api'

export function useAuth({ skipAuthHandling = false }: { skipAuthHandling?: boolean } = {}) {
  const { user, setUser, logout, isAuthenticated } = useAuthStore()

  const { isLoading } = useQuery({
    queryKey: ['me', skipAuthHandling],
    queryFn: async () => {
      try {
        const res = await api.get('/user/me', { skipAuthHandling })
        setUser(res.data.data)
        return res.data.data
      } catch {
        setUser(null)
        return null
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  })

  return { user, isLoading, isAuthenticated, logout }
}

