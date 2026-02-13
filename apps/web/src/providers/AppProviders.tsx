'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider, useSession, signIn } from 'next-auth/react';
import { type ReactNode, useEffect } from 'react';
import { usePathname } from 'next/navigation';

import { ThemeProvider } from './ThemeProvider';
import { SnackbarProvider } from '@/components/SnackbarProvider';
import { api } from '@/lib/api';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

function AuthSync({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  useEffect(() => {
    api.setToken(session?.apiToken ?? null);
  }, [session?.apiToken]);

  // Don't render children until session is loaded so API calls have the token
  if (status === 'loading') {
    return null;
  }

  // Redirect unauthenticated users to sign-in (skip auth pages)
  if (status === 'unauthenticated' && !pathname.startsWith('/auth')) {
    signIn(undefined, { callbackUrl: pathname });
    return null;
  }

  return <>{children}</>;
}

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <AuthSync>
          <ThemeProvider>
            <SnackbarProvider>{children}</SnackbarProvider>
          </ThemeProvider>
        </AuthSync>
      </QueryClientProvider>
    </SessionProvider>
  );
}
