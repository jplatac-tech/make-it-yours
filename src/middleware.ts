import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ADMIN_SESSION_COOKIE, verifyAdminSession } from './lib/admin-auth'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value

  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') {
      if (verifyAdminSession(token)) {
        return NextResponse.redirect(new URL('/admin/quotes', request.url))
      }
      return NextResponse.next()
    }
    if (!verifyAdminSession(token)) {
      const login = new URL('/admin/login', request.url)
      login.searchParams.set('next', pathname)
      return NextResponse.redirect(login)
    }
    return NextResponse.next()
  }

  if (pathname.startsWith('/api/admin')) {
    if (
      pathname === '/api/admin/check' ||
      pathname === '/api/admin/login' ||
      pathname === '/api/admin/logout'
    ) {
      return NextResponse.next()
    }
    if (!verifyAdminSession(token)) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
