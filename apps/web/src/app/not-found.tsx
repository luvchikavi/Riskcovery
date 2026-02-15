'use client';

import { Box, Button, Typography } from '@mui/material';
import Link from 'next/link';

export default function NotFound() {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      gap={3}
      p={4}
    >
      <Typography variant="h1" fontWeight={700} color="text.secondary">
        404
      </Typography>
      <Typography variant="h5" color="text.secondary">
        הדף לא נמצא
      </Typography>
      <Typography variant="body1" color="text.secondary">
        הדף שחיפשת לא קיים או שהועבר למיקום אחר.
      </Typography>
      <Link href="/">
        <Button variant="contained" size="large">
          חזרה לדף הבית
        </Button>
      </Link>
    </Box>
  );
}
