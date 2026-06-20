/* eslint-disable @typescript-eslint/no-explicit-any */
import jwt, { JwtPayload } from 'jsonwebtoken'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getDefaultDashboardRoute, getRouteOwner, isAuthRoute, UserRole } from './lib/auth-utils'
import { getNewAccessToken } from './ForProxy/getNewAccessToken'
import { deleteCookie, getCookie } from './ForProxy/getCookie'
import { nomad } from './env.auto'

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const hasTokenRefreshedParam = request.nextUrl.searchParams.has('tokenRefreshed')

  if (hasTokenRefreshedParam) {
    const url = request.nextUrl.clone()
    url.searchParams.delete('tokenRefreshed')
    return NextResponse.redirect(url)
  }

  const tokenRefreshResult = await getNewAccessToken()

  if (tokenRefreshResult?.tokenRefreshed) {
    const url = request.nextUrl.clone()
    url.searchParams.set('tokenRefreshed', 'true')
    return NextResponse.redirect(url)
  }

  const accessToken = (await getCookie('accessToken')) || null

  let userRole: UserRole | null = null

  if (accessToken) {
    try {
      const verifiedToken = jwt.verify(
        accessToken,
        nomad.JWT_ACCESS_SECRET
      ) as JwtPayload

      userRole = verifiedToken.role
    } catch (error: any) {
      await deleteCookie('accessToken')

      const tokenRefreshResult = await getNewAccessToken()

      if (tokenRefreshResult?.tokenRefreshed) {
        const url = request.nextUrl.clone()
        url.searchParams.set('tokenRefreshed', 'true')
        return NextResponse.redirect(url)
      }
      if (process.env.NODE_ENV === 'development') {
        console.error('Token verification error:', error)
      }
      await deleteCookie('refreshToken')
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  const routerOwner = getRouteOwner(pathname)
  const isAuth = isAuthRoute(pathname)

  if (accessToken && isAuth) {
    return NextResponse.redirect(
      new URL(getDefaultDashboardRoute(userRole as UserRole), request.url)
    )
  }

  if (routerOwner === null) {
    return NextResponse.next()
  }

  if (!accessToken) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (routerOwner === 'COMMON') {
    return NextResponse.next()
  }

  if (
    routerOwner === 'ADMIN' ||
    routerOwner === 'OWNER' ||
    routerOwner === 'MENTOR'
  ) {
    if (userRole !== routerOwner) {
      return NextResponse.redirect(
        new URL(getDefaultDashboardRoute(userRole as UserRole), request.url)
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.well-known).*)',
  ],
}
