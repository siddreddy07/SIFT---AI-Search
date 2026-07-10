import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const protectedRoutes = ['/chat', '/integrations', '/profile', '/discover']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname === '/login' && request.cookies.has('isLoggedIn')) {
    return NextResponse.redirect(new URL('/discover', request.url))
  }

  const isProtected = protectedRoutes.some((route) =>
    pathname === route || pathname.startsWith(route + '/')
  )

  if (!isProtected) return NextResponse.next()

  if (request.cookies.has('isLoggedIn')) return NextResponse.next()

  return NextResponse.redirect(new URL('/login', request.url))
}

export const config = {
  matcher: ['/chat/:path*', '/integrations', '/profile', '/discover', '/login'],
}
