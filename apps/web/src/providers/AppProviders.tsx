'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider, useSession } from 'next-auth/react';
import { type ReactNode, useEffect } from 'react';

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
  const { data: session } = useSession();

  useEffect(() => {
    api.setToken(session?.apiToken ?? null);
  }, [session?.apiToken]);

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
