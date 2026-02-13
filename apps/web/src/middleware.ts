export { default } from 'next-auth/middleware';

export const config = {
  matcher: [
    /*
     * Protect all routes except:
     * - /auth/* (sign-in pages)
     * - /api/* (API routes — NextAuth needs these)
     * - /_next/* (Next.js internals)
     * - /favicon.ico, /robots.txt, etc.
     */
    '/((?!auth|api|_next/static|_next/image|favicon.ico|robots.txt).*)',
  ],
};
