'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider, useSession } from 'next-auth/react';
import { type ReactNode, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

import { ThemeProvider } from './ThemeProvider';
import { SnackbarProvider, useSnackbar } from '@/components/SnackbarProvider';
import { api, type ApiRequestError } from '@/lib/api';

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
  const redirecting = useRef(false);

  useEffect(() => {
    api.setToken(session?.apiToken ?? null);
  }, [session?.apiToken]);

  // Redirect unauthenticated users to sign-in (skip auth pages)
  useEffect(() => {
    if (status === 'unauthenticated' && !pathname.startsWith('/auth') && !redirecting.current) {
      redirecting.current = true;
      window.location.href = `/auth/signin?callbackUrl=${encodeURIComponent(pathname)}`;
    }
  }, [status, pathname]);

  // Don't render children until session is loaded so API calls have the token
  if (status === 'loading' || (status === 'unauthenticated' && !pathname.startsWith('/auth'))) {
    return null;
  }

  return <>{children}</>;
}

/** Bridges API errors to snackbar notifications. Must be inside SnackbarProvider. */
function ApiErrorBridge({ children }: { children: ReactNode }) {
  const { showError } = useSnackbar();

  useEffect(() => {
    api.setErrorHandler((err: ApiRequestError) => {
      showError(err.message);
    });
    return () => { api.setErrorHandler(null); };
  }, [showError]);

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
            <SnackbarProvider>
              <ApiErrorBridge>{children}</ApiErrorBridge>
            </SnackbarProvider>
          </ThemeProvider>
        </AuthSync>
      </QueryClientProvider>
    </SessionProvider>
  );
}
