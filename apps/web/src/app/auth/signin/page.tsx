'use client';

import { signIn } from 'next-auth/react';
import { Box, Button, Card, CardContent, Typography } from '@mui/material';

export default function SignInPage() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1D1D1F 0%, #2C2C2E 100%)',
      }}
    >
      <Card
        sx={{
          maxWidth: 420,
          width: '100%',
          mx: 2,
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        }}
      >
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <Typography
            variant="h4"
            sx={{ fontWeight: 700, mb: 1, color: '#1D1D1F' }}
          >
            Riscovery
          </Typography>
          <Typography
            variant="body1"
            sx={{ mb: 4, color: 'text.secondary' }}
          >
            Insurance Advisory Management
          </Typography>

          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={() => signIn('google', { callbackUrl: '/' })}
            sx={{
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 600,
              backgroundColor: '#4285F4',
              '&:hover': { backgroundColor: '#3367D6' },
            }}
          >
            Sign in with Google
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}
