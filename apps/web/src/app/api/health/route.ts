export const dynamic = 'force-dynamic';

export async function GET() {
  const diagnostics: Record<string, unknown> = {
    status: 'ok',
    time: new Date().toISOString(),
    node: process.version,
    env: {
      NEXTAUTH_URL: process.env.NEXTAUTH_URL ? 'set' : 'missing',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'set' : 'missing',
      DATABASE_URL: process.env.DATABASE_URL ? 'set' : 'missing',
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'set' : 'missing',
      JWT_SECRET: process.env.JWT_SECRET ? 'set' : 'missing',
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ? 'set' : 'missing',
      NODE_ENV: process.env.NODE_ENV,
    },
  };

  // Test Prisma
  try {
    const { prisma } = await import('@/lib/prisma');
    const count = await prisma.user.count();
    diagnostics.prisma = { status: 'ok', userCount: count };
  } catch (err) {
    diagnostics.prisma = { status: 'error', message: String(err) };
  }

  return Response.json(diagnostics);
}
