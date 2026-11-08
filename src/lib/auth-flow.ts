import axios from 'axios'
import { getDefaultDashboardRoute, isValidRedirectForRole } from '@/lib/auth-utils'
import type { User } from '@/types'

export function getPostLoginDestination(
  user: Pick<User, 'role' | 'company'>,
  requestedPath?: string
) {
  const isSafeLocalPath =
    typeof requestedPath === 'string' &&
    requestedPath.startsWith('/') &&
    !requestedPath.startsWith('//')
  const isCompanySetup = requestedPath === '/company'

  if (
    isSafeLocalPath &&
    (!isCompanySetup || user.role === 'OWNER') &&
    isValidRedirectForRole(requestedPath, user.role)
  ) {
    return requestedPath
  }

  if (user.role === 'OWNER' && !user.company) {
    return '/company'
  }

  return getDefaultDashboardRoute(user.role)
}

export function getCompanyCreationError(error: unknown) {
  const status = axios.isAxiosError(error) ? error.response?.status : undefined
  const responseData: unknown = axios.isAxiosError(error)
    ? error.response?.data
    : undefined
  const serverMessage =
    typeof responseData === 'object' &&
    responseData !== null &&
    'message' in responseData &&
    typeof responseData.message === 'string'
      ? responseData.message
      : undefined

  if (
    status === 401 ||
    (status === 403 &&
      serverMessage !== undefined &&
      /token|unauthori[sz]ed|authenticat/i.test(serverMessage))
  ) {
    return {
      requiresLogin: true,
      message: 'Your session is missing or expired. Please log in again.',
    }
  }

  if (status === 403) {
    return {
      requiresLogin: false,
      message: 'Creating a company requires an OWNER account.',
    }
  }

  return {
    requiresLogin: false,
    message: serverMessage || 'Failed to create company. Please try again.',
  }
}
