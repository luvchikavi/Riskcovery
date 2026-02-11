import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import jwt from 'jsonwebtoken';

import { prisma } from './prisma';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      // On initial sign-in or when session is updated, fetch fresh user data
      if (user || trigger === 'update') {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email! },
          select: { id: true, email: true, name: true, role: true, organizationId: true },
        });

        if (dbUser) {
          token.userId = dbUser.id;
          token.role = dbUser.role;
          token.organizationId = dbUser.organizationId;

          // Mint a plain JWT for API calls
          token.apiToken = jwt.sign(
            {
              userId: dbUser.id,
              email: dbUser.email,
              name: dbUser.name,
              role: dbUser.role,
              organizationId: dbUser.organizationId,
            },
            process.env.JWT_SECRET!,
            { expiresIn: '24h' }
          );
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string;
        session.user.role = token.role as string;
        session.user.organizationId = token.organizationId as string | null;
      }
      session.apiToken = token.apiToken as string;
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      // Auto-create a default organization for new users
      const org = await prisma.organization.create({
        data: {
          name: `${user.name || user.email}'s Organization`,
        },
      });

      await prisma.user.update({
        where: { id: user.id },
        data: { organizationId: org.id },
      });
    },
  },
};
