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

  // This will exchange the code for a session and persist it.
  const {
    data: { session },
  } = await supabase.auth.getSession()

  console.log("MIDDLEWARE SESSION:", session?.user?.email);

  const user = session?.user

  // Define protected routes that require a user to be logged in.
  const protectedRoutes = ['/generate', '/exterior', '/settings', '/my-designs'];
  const authRoute = '/auth';
  const currentPath = request.nextUrl.pathname;

  // if user is signed in and tries to access the auth page, redirect them to the home page.
  if (user && currentPath.startsWith(authRoute)) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // if user is not signed in and tries to access a protected route, redirect them to the auth page.
  if (!user && protectedRoutes.some(path => currentPath.startsWith(path))) {
    const redirectUrl = new URL(authRoute, request.url);
    // Pass the original destination as the `next` query param
    redirectUrl.searchParams.set('next', currentPath);
    return NextResponse.redirect(redirectUrl);
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
