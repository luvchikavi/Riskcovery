'use client';

import { Box, Button, Typography } from '@mui/material';
import { ErrorOutline as ErrorIcon } from '@mui/icons-material';
import Link from 'next/link';

export default function RfqError({
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
        שגיאה בטעינת הדף
      </Typography>
      <Typography color="text.secondary" textAlign="center" maxWidth={400}>
        {error.message || 'לא ניתן לטעון את הדף המבוקש.'}
      </Typography>
      <Box display="flex" gap={2} mt={2}>
        <Button variant="contained" onClick={reset}>
          נסה שוב
        </Button>
        <Button component={Link} href="/rfq" variant="outlined">
          חזרה ללוח בקרה
        </Button>
      </Box>
    </Box>
  );
}
