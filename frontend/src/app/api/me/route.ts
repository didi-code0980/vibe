import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { UserDetailResponse } from '@/features/profile/types/profile.types'

// JSON 401 — never include `WWW-Authenticate`, which is what triggers the
// browser's native Basic-auth popup. Also blocks `Authorization` echo headers.
function unauthorized(message: string) {
  return new NextResponse(JSON.stringify({ error: message }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function GET(request: Request) {
  const accept = request.headers.get('accept') ?? ''
  const wantsHtml = accept.includes('text/html')

  const token = cookies().get('auth_token')?.value
  if (!token) {
    if (wantsHtml) return NextResponse.redirect(new URL('/login', request.url))
    return unauthorized('Unauthorized')
  }

  const rawId = cookies().get('user_id')?.value
  if (!rawId) {
    if (wantsHtml) return NextResponse.redirect(new URL('/login', request.url))
    return unauthorized('User session not found')
  }

  const userId = parseInt(rawId, 10)
  if (isNaN(userId)) {
    return new NextResponse(JSON.stringify({ error: 'Invalid session' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api'
  const res = await fetch(`${apiBase}/users/${userId}`, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    cache: 'no-store',
  })

  if (res.status === 401) {
    if (wantsHtml) return NextResponse.redirect(new URL('/login', request.url))
    return unauthorized('Unauthorized')
  }

  if (!res.ok) {
    return new NextResponse(JSON.stringify({ error: 'Failed to load profile' }), {
      status: res.status,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const body = await res.json()
  const profile: UserDetailResponse = body.data
  return NextResponse.json(profile)
}
