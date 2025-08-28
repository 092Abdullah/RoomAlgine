import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const protectedRoutes = ['/generate', '/exterior', '/dashboard'];
  const authRoute = '/auth';
  const currentPath = request.nextUrl.pathname;

  // if user is signed in and the current path is /auth, redirect the user to /dashboard
  if (user && currentPath.startsWith(authRoute)) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // if user is not signed in and the current path is a protected route, redirect the user to /auth
  if (!user && protectedRoutes.some(path => currentPath.startsWith(path))) {
    return NextResponse.redirect(new URL(authRoute, request.url))
  }

  return response
}

export const config = {
  matcher: ['/auth', '/generate', '/exterior', '/dashboard'],
}
