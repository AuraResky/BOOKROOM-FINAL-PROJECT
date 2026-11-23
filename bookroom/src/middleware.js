import { NextResponse } from 'next/server';

const COOKIE_NAME = 'bookroom_session';
const PROTECTED_PREFIXES = ['/admin', '/pegawai', '/mahasiswa'];
const AUTH_ROUTES = ['/login', '/register'];

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;

  const hasValidTokenFormat = Boolean(
    token && /^[A-Za-z0-9_-]{43}$/.test(token)
  );

  const isProtectedRoute = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (isProtectedRoute && !hasValidTokenFormat) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isAuthRoute && hasValidTokenFormat) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/pegawai/:path*',
    '/mahasiswa/:path*',
    '/login',
    '/register',
  ],
};