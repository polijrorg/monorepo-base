import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "./auth";
import type { Role } from "./generated/prisma";

// Configuration for different page types
const ROUTE_CONFIG = {
  authRequired: [
    "/aprender",
    "/dashboard",
    "/perfil",
    "/settings",
  ],
  
  // Pages that require ADMIN or SUPER_ADMIN role
  adminRequired: [
    "/admin/**",
  ],
  
  redirectIfAuth: [
    "/login",
    "/cadastro",
  ],
  
  // Special routes with custom logic
  specialRoutes: [
    "/admin", // Special handling for /admin route
  ]
};

// Helper function to check if path matches any pattern
function matchesAnyPattern(pathname: string, patterns: string[]): boolean {
  return patterns.some(pattern => {
    if (pattern.endsWith('**')) {
      const basePattern = pattern.slice(0, -2);
      return pathname.startsWith(basePattern);
    }
    return pathname === pattern || pathname.startsWith(pattern + '/');
  });
}

function hasRequiredRole(userRole: Role | undefined, requiredRoles: Role[]): boolean {
  if (!userRole) return false;
  return requiredRoles.includes(userRole);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  const userRole = session?.role as Role | undefined;
  const isAuthenticated = !!session?.user;

  // Handle /admin special route
  if (pathname === "/admin") {
    if (!isAuthenticated) {
      return NextResponse.next();
    }
    
    if (hasRequiredRole(userRole, ["ADMIN", "SUPER_ADMIN"])) {
      // Redirect admin users to dashboard
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    } else {
      // Redirect non-admin authenticated users to home
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  
  if (matchesAnyPattern(pathname, ROUTE_CONFIG.redirectIfAuth)) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/aprender", request.url));
    }
    return NextResponse.next();
  }

  if (matchesAnyPattern(pathname, ROUTE_CONFIG.adminRequired)) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    
    if (!hasRequiredRole(userRole, ["ADMIN", "SUPER_ADMIN"])) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    
    return NextResponse.next();
  }

  if (matchesAnyPattern(pathname, ROUTE_CONFIG.authRequired)) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ]
};