import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication (handled client-side via AuthContext)
// The proxy only adds security headers - auth is managed by AuthContext with localStorage
const authRoutes = ['/login', '/register'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get token from cookies (Note: main auth uses localStorage, this is for SSR hints only)
  const token = request.cookies.get('accessToken')?.value;
  
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  // Only redirect authenticated users away from auth routes if token exists in cookies
  // This is a soft check - main auth logic is in AuthContext (client-side)
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Add security headers to all responses
  const response = NextResponse.next();
  
  // Security headers
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public|.*\\..*|_next).*)',
  ],
};
