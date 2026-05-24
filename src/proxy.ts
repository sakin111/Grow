import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import jwt, { JwtPayload } from "jsonwebtoken"
import { getCookie, deleteCookie } from './ForProxy/getCookie'
import { getNewAccessToken } from './ForProxy/getNewAccessToken'

export type UserRole = 'OWNER' | 'ADMIN' | 'MENTOR'

function isAuthRoute(pathname: string): boolean {
  const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password', '/auth/google']
  return authRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))
}

function getRouteOwner(pathname: string): 'ADMIN' | 'OWNER' | 'MENTOR' | 'COMMON' | null {
  if (isAuthRoute(pathname)) {
    return null
  }

  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    return 'ADMIN'
  }

  if (
    pathname === '/discussions/create' ||
    pathname.startsWith('/discussions/create/') ||
    pathname === '/profile/company/create'
  ) {
    return 'OWNER'
  }

  const commonRoutes = ['/feed', '/discussions', '/mentors', '/sessions', '/profile', '/session']
  if (commonRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))) {
    return 'COMMON'
  }

  if (pathname === '/') {
    return null
  }

  return 'COMMON'
}

function getDefaultDashboardRoute(role: UserRole): string {
  switch (role) {
    case 'ADMIN':
      return '/admin'
    case 'OWNER':
    case 'MENTOR':
    default:
      return '/feed'
  }
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hasTokenRefreshUrl = request.nextUrl.searchParams.has('tokenRefreshed')

  if (hasTokenRefreshUrl) {
    const url = request.nextUrl.clone();
    url.searchParams.delete('tokenRefreshed');
    return NextResponse.redirect(url)
  }

  const tokenRefreshResult = await getNewAccessToken()

  if (tokenRefreshResult?.tokenRefreshed) {
    const url = request.nextUrl.clone();
    url.searchParams.set('tokenRefreshed', 'true');
    return NextResponse.redirect(url)
  }

  const accessToken = await getCookie('accessToken')
  let userRole: UserRole | null = null

  if (accessToken) {
    try {
      const verifiedToken = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET as string) as JwtPayload
      userRole = verifiedToken.role
    } catch (error) {
      await deleteCookie("accessToken");

      const tokenRefreshResult = await getNewAccessToken();

      if (tokenRefreshResult?.tokenRefreshed) {
        const url = request.nextUrl.clone();
        url.searchParams.set("tokenRefreshed", "true");
        return NextResponse.redirect(url);
      }
      if (process.env.NODE_ENV === "development") {
        console.error("Token verification error:", error);
      }
      await deleteCookie("refreshToken");
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

 const routerOwner = getRouteOwner(pathname);

    const isAuth = isAuthRoute(pathname)

    if (accessToken && isAuth) {
        return NextResponse.redirect(new URL(getDefaultDashboardRoute(userRole as UserRole), request.url))
    }


    if (routerOwner === null) {
        return NextResponse.next();
    }


    if (!accessToken) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
    }


    if (routerOwner === "COMMON") {
        return NextResponse.next();
    }

    if (routerOwner === "ADMIN" || routerOwner === "OWNER" || routerOwner === "MENTOR") {
        if (userRole !== routerOwner) {
            return NextResponse.redirect(new URL(getDefaultDashboardRoute(userRole as UserRole), request.url))
        }
    }


  return NextResponse.next()
}





export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
