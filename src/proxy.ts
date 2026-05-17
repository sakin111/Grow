import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password']
const ADMIN_ROUTES = ['/admin']

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const accessToken = request.cookies.get('accessToken')?.value
  const isPublic = PUBLIC_ROUTES.some(r => pathname.startsWith(r))

  // Unauthenticated user hitting a protected route
  if (!accessToken && !isPublic) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Authenticated user hitting an auth page
  if (accessToken && isPublic) {
    return NextResponse.redirect(new URL('/feed', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
