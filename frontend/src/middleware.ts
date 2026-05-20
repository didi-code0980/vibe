import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ROLES } from '@/lib/constants/roles'

const AUTH_COOKIE = 'auth_token'
const ROLE_COOKIE = 'user_role'
const MUST_CHANGE_PASSWORD_COOKIE = 'must_change_password'

const PUBLIC_PATHS = ['/login', '/forgot-password', '/reset-password', '/403']
const CHANGE_PASSWORD_PATH = '/change-password'

const ADMIN_PATHS = ['/admin']
const MANAGER_PATHS = ['/team']

export function middleware(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE)?.value
  const role = request.cookies.get(ROLE_COOKIE)?.value
  const mustChange = request.cookies.get(MUST_CHANGE_PASSWORD_COOKIE)?.value === 'true'
  const { pathname } = request.nextUrl

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p))

  if (!token && !isPublic) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (token && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Force password change before anything else (except the change-password page itself).
  if (token && mustChange && !pathname.startsWith(CHANGE_PASSWORD_PATH)) {
    return NextResponse.redirect(new URL(CHANGE_PASSWORD_PATH, request.url))
  }

  if (ADMIN_PATHS.some((p) => pathname.startsWith(p)) && role !== ROLES.ADMIN) {
    return NextResponse.redirect(new URL('/403', request.url))
  }

  if (MANAGER_PATHS.some((p) => pathname.startsWith(p)) && role === ROLES.USER) {
    return NextResponse.redirect(new URL('/403', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon\\.ico).*)'],
}
