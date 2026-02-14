import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import jwt from 'jsonwebtoken';

import { prisma } from './prisma';

const providers: NextAuthOptions['providers'] = [];

// Google OAuth — only add if credentials are configured
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  );
}

// Dev credentials provider — only in development
if (process.env.NODE_ENV !== 'production') {
  providers.push(
    CredentialsProvider({
      id: 'dev-login',
      name: 'Dev Login',
      credentials: {
        email: { label: 'Email', type: 'email' },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;

        // Find or create user
        let user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { organization: true },
        });

        if (!user) {
          const org = await prisma.organization.create({
            data: { name: `Dev Organization` },
          });
          user = await prisma.user.create({
            data: {
              email: credentials.email,
              name: credentials.email.split('@')[0] || 'Dev User',
              role: 'ADMIN',
              organizationId: org.id,
            },
            include: { organization: true },
          });
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  );
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers,
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
        let dbUser = await prisma.user.findUnique({
          where: { email: token.email! },
          select: { id: true, email: true, name: true, role: true, organizationId: true },
        });

        if (dbUser) {
          // Ensure user has an organization (may not exist yet on first sign-in)
          if (!dbUser.organizationId) {
            const org = await prisma.organization.create({
              data: { name: `${dbUser.name || dbUser.email}'s Organization` },
            });
            await prisma.user.update({
              where: { id: dbUser.id },
              data: { organizationId: org.id },
            });
            dbUser = { ...dbUser, organizationId: org.id };
          }

          token.userId = dbUser.id;
          token.role = dbUser.role;
          token.organizationId = dbUser.organizationId;
        }
      }

      // Mint or refresh the API token if missing or expiring within 1 hour
      let needsRefresh = !token.apiToken;
      if (!needsRefresh && token.apiToken) {
        try {
          const decoded = jwt.decode(token.apiToken as string) as { exp?: number } | null;
          if (!decoded?.exp || decoded.exp * 1000 - Date.now() < 60 * 60 * 1000) {
            needsRefresh = true;
          }
        } catch {
          needsRefresh = true;
        }
      }

      if (needsRefresh && token.userId) {
        token.apiToken = jwt.sign(
          {
            userId: token.userId,
            email: token.email,
            name: token.name,
            role: token.role,
            organizationId: token.organizationId,
          },
          process.env.JWT_SECRET!,
          { expiresIn: '24h' }
        );
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
