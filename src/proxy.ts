import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { getCookie, deleteCookie } from './ForProxy/getCookie'
import { getNewAccessToken } from './ForProxy/getNewAccessToken'

export type UserRole = 'OWNER' | 'ADMIN' | 'MENTOR'

const PUBLIC_ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/auth/google',
]

const PROTECTED_ROUTES = [
  '/feed',
  '/profile',
  '/admin',
  '/discussions',
  '/sessions',
  '/company'
]

function isPublic(path: string) {
  return PUBLIC_ROUTES.some(r => path === r || path.startsWith(r + '/'))
}

function isProtected(path: string) {
  return PROTECTED_ROUTES.some(r => path === r || path.startsWith(r + '/'))
}

function getRoleFromToken(token: string): UserRole | null {
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET as string
    ) as JwtPayload

    return decoded.role as UserRole
  } catch {
    return null
  }
}

function getDefaultRoute(role: UserRole) {
  if (role === 'ADMIN') return '/admin'
  return '/feed'
}

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // 1. PUBLIC ROUTES → NEVER BLOCK
  if (isPublic(pathname)) {
    return NextResponse.next()
  }

  // 2. Try access token
  let accessToken = await getCookie('accessToken')

  // 3. Try refresh ONLY if needed
  if (!accessToken) {
    const refreshed = await getNewAccessToken()
    if (refreshed?.tokenRefreshed) {
      accessToken = await getCookie('accessToken')
    }
  }

  // 4. No token → login
  if (!accessToken) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  const role = getRoleFromToken(accessToken)

  if (!role) {
    await deleteCookie('accessToken')
    await deleteCookie('refreshToken')
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // 5. Role protection ONLY for app routes
  if (isProtected(pathname)) {
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}