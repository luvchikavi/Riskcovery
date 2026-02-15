'use client';

import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { CssBaseline, ThemeProvider as MuiThemeProvider } from '@mui/material';
import { type ReactNode } from 'react';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';

import { theme } from '@/theme';

// RTL cache for Material UI
const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [prefixer, rtlPlugin],
});

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <CacheProvider value={cacheRtl}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </CacheProvider>
  );
}
