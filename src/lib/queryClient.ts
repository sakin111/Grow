import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        if (error?.response?.status === 401) return false
        if (error?.response?.status === 404) return false
        return failureCount < 2
      },
      staleTime: 30 * 1000,
    },
    mutations: {
      onError: (error: any) => {
        // Handled by api interceptor
      }
    }
  }
})
