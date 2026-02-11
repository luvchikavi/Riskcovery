'use client';

import { Alert, Snackbar } from '@mui/material';
import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react';

type Severity = 'success' | 'error' | 'info' | 'warning';

interface SnackbarMessage {
  message: string;
  severity: Severity;
}

interface SnackbarContextValue {
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showInfo: (message: string) => void;
  showWarning: (message: string) => void;
}

const SnackbarContext = createContext<SnackbarContextValue | null>(null);

export function useSnackbar() {
  const ctx = useContext(SnackbarContext);
  if (!ctx) throw new Error('useSnackbar must be used within SnackbarProvider');
  return ctx;
}

export function SnackbarProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<SnackbarMessage>({
    message: '',
    severity: 'info',
  });

  const show = useCallback((message: string, severity: Severity) => {
    setCurrent({ message, severity });
    setOpen(true);
  }, []);

  const value: SnackbarContextValue = {
    showSuccess: useCallback((m: string) => show(m, 'success'), [show]),
    showError: useCallback((m: string) => show(m, 'error'), [show]),
    showInfo: useCallback((m: string) => show(m, 'info'), [show]),
    showWarning: useCallback((m: string) => show(m, 'warning'), [show]),
  };

  return (
    <SnackbarContext.Provider value={value}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={4000}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert
          onClose={() => setOpen(false)}
          severity={current.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {current.message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
}
