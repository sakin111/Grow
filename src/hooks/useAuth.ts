import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import api from '@/lib/api'

export function useAuth() {
  const { user, setUser, logout, isAuthenticated } = useAuthStore()

  const { isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const res = await api.get('/user/me')
      setUser(res.data.data)
      return res.data.data
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  })

  return { user, isLoading, isAuthenticated, logout }
}
