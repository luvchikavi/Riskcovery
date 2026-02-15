import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const { pathname } = request.nextUrl;

  // Allow auth-related routes and public assets
  if (
    pathname.startsWith('/auth') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Redirect unauthenticated users to sign-in
  if (!token) {
    const signInUrl = new URL('/auth/signin', request.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/rfq/:path*',
    '/comparison/:path*',
    '/insurers/:path*',
    '/',
  ],
};
