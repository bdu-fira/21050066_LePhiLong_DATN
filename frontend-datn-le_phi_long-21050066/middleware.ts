import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get the request's pathname
  const { pathname } = request.nextUrl

  // Check if the path starts with /admin
  if (pathname.startsWith('/admin')) {
    console.log('Admin route detected!')

  }

  return NextResponse.next()
}

// Optional: You can configure the middleware to run only on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}