
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // if user is signed in and the current path is /auth, redirect the user to /dashboard
  if (user && req.nextUrl.pathname.startsWith('/auth')) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // if user is not signed in and the current path is not /auth, redirect the user to /auth
  if (!user && (req.nextUrl.pathname.startsWith('/generate') || req.nextUrl.pathname.startsWith('/exterior') || req.nextUrl.pathname.startsWith('/dashboard'))) {
    return NextResponse.redirect(new URL('/auth', req.url))
  }

  await supabase.auth.getSession()

  return res
}

export const config = {
  matcher: ['/auth', '/generate', '/exterior', '/dashboard'],
}
