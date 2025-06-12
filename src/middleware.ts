import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

// --- Route Configuration ---
// Routes that require authentication
const PROTECTED_ROUTES: string[] = [
  "/admin",
  "/admin/*",
  "/settings",
  "/settings/*",
  "/dashboard",
  "/order",
  "/order/*",
  "/api/orders",
  "/api/orders/*",
  "/api/payments",
  "/api/payments/*",
  "/api/users",
  "/api/users/*",
  "/api/vehicle-types",
  "/api/vehicle-types/*",
  "/api/articles",
  "/api/articles/*",
  "/api/dashboard",
  "/api/dashboard/*",
];

// Admin-only routes (ADMIN and SUPER_ADMIN)
const ADMIN_ONLY_ROUTES: string[] = [
  "/admin",
  "/admin/*",
  "/api/orders/*/status",
  "/api/payments/*/status",
  // "/api/vehicle-types",
  // "/api/vehicle-types/*",
  "/api/users",
  "/api/users/*",
  // "/api/articles",
  // "/api/articles/*",
];

// Customer-only routes (CUSTOMER role)
const CUSTOMER_ONLY_ROUTES: string[] = [
  "/dashboard",
  // "/settings",
  // "/settings/*",
  "/order",
  "/order/*",
  "/api/dashboard/customer",
  "/api/payments/*/proof",
];

// Exclude specific API paths from authentication
const EXCLUDED_API_ROUTES: string[] = [
  "/api/auth",
  "/api/auth/*",
  "/api/webhooks",
  "/api/webhooks/*",
  "/api/email",
  "/api/email/*",
];

// Routes that are accessible only for guests (non-authenticated users)
const GUEST_ONLY_ROUTES: string[] = [
  "/auth/signin",
  "/auth/signup",
  "/auth/forgot-password",
];

// Routes under development (will redirect to coming-soon page)
const COMING_SOON_ROUTES: string[] = [];

// --- Helper functions ---
function matchRoute(pathname: string, routePattern: string) {
  // Exact match
  if (!routePattern.includes("*")) {
    return pathname === routePattern;
  }

  // Wildcard match (handle both /path/* and /path)
  if (routePattern.endsWith("/*")) {
    const base = routePattern.replace(/\/\*$/, "");
    return pathname === base || pathname.startsWith(`${base}/`);
  }

  return false;
}

function isMatchingAnyRoute(pathname: string, routes: string[]) {
  return routes.some((route) => matchRoute(pathname, route));
}

function isProtectedRoute(pathname: string) {
  // First check if the route is in excluded list
  if (isMatchingAnyRoute(pathname, EXCLUDED_API_ROUTES)) {
    return false;
  }

  // Then check if it's in protected routes
  return isMatchingAnyRoute(pathname, PROTECTED_ROUTES);
}

function isAdminOnlyRoute(pathname: string) {
  return isMatchingAnyRoute(pathname, ADMIN_ONLY_ROUTES);
}

function isCustomerOnlyRoute(pathname: string) {
  return isMatchingAnyRoute(pathname, CUSTOMER_ONLY_ROUTES);
}

function isGuestOnlyRoute(pathname: string) {
  return isMatchingAnyRoute(pathname, GUEST_ONLY_ROUTES);
}

function isComingSoonRoute(pathname: string) {
  return isMatchingAnyRoute(pathname, COMING_SOON_ROUTES);
}

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  console.log(`Processing middleware for: ${pathname}`);

  // Skip middleware for Next.js internal routes and static assets
  if (
    pathname.startsWith("/_next/") ||
    pathname.includes("/favicon.ico") ||
    pathname.startsWith("/assets/") ||
    pathname.startsWith("/images/") ||
    pathname.startsWith("/public/") ||
    pathname === "/icon.svg" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  ) {
    return NextResponse.next();
  }

  // 1. Check if route is under development
  if (isComingSoonRoute(pathname)) {
    return NextResponse.redirect(new URL("/coming-soon", req.url));
  }

  // 2. Get auth token
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    // secureCookie: process.env.NODE_ENV === "production",
    cookieName: "next-auth.session-token",
  });

  console.log(
    `Auth token for ${pathname}:`,
    token ? `User: ${token.email}, Role: ${token.role}` : "No token"
  );

  // ===== ROLE BASED ACCESS CONTROL =====
  // Check role-based access first, regardless of protected status
  if (token) {
    const userRole = token.role as string;

    // Admin-only routes protection (ADMIN and SUPER_ADMIN can access)
    if (isAdminOnlyRoute(pathname)) {
      console.log(`Admin-only route detected: ${pathname}`);
      if (!(userRole === "ADMIN" || userRole === "SUPER_ADMIN")) {
        console.log(
          `Redirecting non-admin user (${userRole}) from ${pathname} to /dashboard`
        );
        // If non-admin tries to access admin route, redirect to customer dashboard
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    // Customer-only routes protection (only CUSTOMER can access)
    if (isCustomerOnlyRoute(pathname)) {
      console.log(`Customer-only route detected: ${pathname}`);
      if (userRole !== "CUSTOMER") {
        console.log(
          `Redirecting non-customer user (${userRole}) from ${pathname} to /admin`
        );
        // If non-customer tries to access customer route, redirect to admin dashboard
        return NextResponse.redirect(new URL("/admin", req.url));
      }
    }
  }

  // 3. Handle guest-only routes (redirect authenticated users to appropriate dashboard)
  if (isGuestOnlyRoute(pathname) && token) {
    console.log(
      `Guest-only route accessed by authenticated user, redirecting...`
    );
    // Redirect authenticated users based on their role
    if (token.role === "CUSTOMER") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    } else if (token.role === "ADMIN" || token.role === "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
  }

  // 4. Handle protected routes - authentication check
  if (isProtectedRoute(pathname)) {
    // Check authentication
    if (!token) {
      console.log(
        `Protected route accessed without authentication, redirecting to signin...`
      );
      // Store the original URL to redirect back after login
      const callbackUrl = encodeURIComponent(req.url);
      return NextResponse.redirect(
        new URL(`/auth/signin?callbackUrl=${callbackUrl}`, req.url)
      );
    }
  }

  // 5. By default, allow access to all other routes
  return NextResponse.next();
}

export const config = {
  // Apply middleware only to routes that need processing
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
