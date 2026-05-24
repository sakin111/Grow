
export type UserRole = "ADMIN" | "OWNER" | "MENTOR";

export type RouteConfig ={
    exact: string[]
    patterns: RegExp[]
}

export const authRoutes = ["/login", "/register", "/forgot-password"];

export const commonProtectedRoute : RouteConfig =  {
  exact:["my-profile","setting"],
  patterns:[]
}


export const adminProtectedRoutes: RouteConfig = {
    patterns: [/^\/admin/],
    exact: [], 
}

export const ownerProtectedRoutes: RouteConfig = {
    patterns: [/^\/owner/],
    exact: [],
}

export const mentorProtectedRoutes: RouteConfig = {
    patterns: [/^\/mentor/],
    exact: [],
}

export const isAuthRoute = (pathname:string) =>{
  return authRoutes.some((route) => route === pathname)
}


export const isRouteMatches = (pathname: string, routes: RouteConfig): boolean => {
    if (routes.exact.includes(pathname)) {
        return true;
    }
    return routes.patterns.some((pattern: RegExp) => pattern.test(pathname))
}

export const getRouteOwner = (pathname: string): "ADMIN" | "OWNER" | "MENTOR" | "COMMON" | null => {
    if (isRouteMatches(pathname, adminProtectedRoutes)) {
        return "ADMIN";
    }
    if (isRouteMatches(pathname, ownerProtectedRoutes)) {
        return "OWNER";
    }
    if (isRouteMatches(pathname, mentorProtectedRoutes)) {
        return "MENTOR";
    }
    if (isRouteMatches(pathname, commonProtectedRoute)) {
        return "COMMON";
    }
    return null;
}

export const getDefaultDashboardRoute = (role: UserRole): string => {
    if (role === "ADMIN") {
        return "/admin/dashboard";
    }
    if (role === "OWNER") {
        return "/owner/dashboard";
    }
    if (role === "MENTOR") {
        return "/mentor/dashboard";
    }
    return "/";
}

export const isValidRedirectForRole = (redirectPath: string, role: UserRole): boolean => {
    const routeOwner = getRouteOwner(redirectPath);

    if (routeOwner === null || routeOwner === "COMMON") {
        return true;
    }

    if (routeOwner === role) {
        return true;
    }

    return false;
}