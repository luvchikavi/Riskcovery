'use client';

import { Box, Button, Typography } from '@mui/material';
import { ErrorOutline as ErrorIcon } from '@mui/icons-material';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="50vh"
      gap={2}
      p={4}
    >
      <ErrorIcon sx={{ fontSize: 64, color: 'error.main' }} />
      <Typography variant="h5" fontWeight="bold">
        שגיאה בלתי צפויה
      </Typography>
      <Typography color="text.secondary" textAlign="center" maxWidth={400}>
        {error.message || 'משהו השתבש. אנא נסה שוב.'}
      </Typography>
      <Button variant="contained" onClick={reset} sx={{ mt: 2 }}>
        נסה שוב
      </Button>
    </Box>
  );
}
