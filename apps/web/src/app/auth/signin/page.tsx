'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  TextField,
  Typography,
} from '@mui/material';

export default function SignInPage() {
  const [devEmail, setDevEmail] = useState('dev@riscovery.local');
  const [devLoading, setDevLoading] = useState(false);

  const [magicEmail, setMagicEmail] = useState('');
  const [magicLoading, setMagicLoading] = useState(false);
  const [magicSent, setMagicSent] = useState(false);

  const handleDevLogin = async () => {
    setDevLoading(true);
    await signIn('dev-login', { email: devEmail, callbackUrl: '/' });
    setDevLoading(false);
  };

  const handleMagicLink = async () => {
    setMagicLoading(true);
    await signIn('email', { email: magicEmail, callbackUrl: '/', redirect: false });
    setMagicLoading(false);
    setMagicSent(true);
  };

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
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: '#1D1D1F' }}>
            Riscovery
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
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

          {/* Email magic link login */}
          <Divider sx={{ my: 3 }}>
            <Typography variant="caption" color="text.secondary">
              או התחברות עם אימייל
            </Typography>
          </Divider>

          {magicSent ? (
            <Alert severity="success" sx={{ textAlign: 'left' }}>
              קישור התחברות נשלח לאימייל שלך
            </Alert>
          ) : (
            <>
              <TextField
                fullWidth
                size="small"
                label="Email"
                type="email"
                value={magicEmail}
                onChange={(e) => setMagicEmail(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Button
                variant="outlined"
                size="large"
                fullWidth
                disabled={magicLoading || !magicEmail}
                onClick={handleMagicLink}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 600,
                }}
              >
                {magicLoading ? 'שולח...' : 'Send Magic Link'}
              </Button>
            </>
          )}

          {/* Dev login — only shown in development */}
          {process.env.NODE_ENV !== 'production' && (
            <>
              <Divider sx={{ my: 3 }}>
                <Typography variant="caption" color="text.secondary">
                  Dev Mode
                </Typography>
              </Divider>

              <TextField
                fullWidth
                size="small"
                label="Email"
                value={devEmail}
                onChange={(e) => setDevEmail(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Button
                variant="outlined"
                size="large"
                fullWidth
                disabled={devLoading || !devEmail}
                onClick={handleDevLogin}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 600,
                }}
              >
                {devLoading ? 'Signing in...' : 'Dev Login'}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
