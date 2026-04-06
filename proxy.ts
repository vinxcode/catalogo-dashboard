import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const SESSION_COOKIE = 'admin_session'

function getSecret() {
  const secret = process.env.AUTH_SECRET
  if (!secret) throw new Error('AUTH_SECRET is not set')
  return new TextEncoder().encode(secret)
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow login page, static assets, and Next.js internals
  if (
    pathname === '/login' ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon') ||
    pathname.endsWith('.ico') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.svg')
  ) {
    return NextResponse.next()
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    await jwtVerify(token, getSecret())

    // If authenticated user goes to /login, redirect to dashboard
    if (pathname === '/login') {
      return NextResponse.redirect(new URL('/', request.url))
    }

    return NextResponse.next()
  } catch {
    // Token expired or invalid — clear it and redirect
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete(SESSION_COOKIE)
    return response
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
