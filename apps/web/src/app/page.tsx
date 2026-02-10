'use client';

import { Box, Button, Card, CardContent, Container, Grid, Typography } from '@mui/material';
import Link from 'next/link';

export default function HomePage() {
  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#F5F5F7' }}>
      {/* Hero */}
      <Box
        sx={{
          backgroundColor: '#FFFFFF',
          pt: { xs: 10, md: 14 },
          pb: { xs: 8, md: 12 },
          textAlign: 'center',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
        }}
      >
        <Container maxWidth="sm">
          <Typography
            component="h1"
            sx={{
              fontFamily: 'var(--font-plus-jakarta), "Plus Jakarta Sans", sans-serif',
              fontWeight: 700,
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              letterSpacing: '-0.02em',
              color: '#1D1D1F',
              mb: 2,
              lineHeight: 1.2,
            }}
          >
            Riscovery
          </Typography>
          <Typography
            sx={{
              color: '#1D1D1F',
              fontWeight: 400,
              mb: 1.5,
              fontSize: { xs: '1.125rem', md: '1.375rem' },
              lineHeight: 1.5,
            }}
          >
            מערכת ניהול ייעוץ ביטוחי
          </Typography>
          <Typography
            sx={{
              color: '#86868B',
              fontSize: '1.0625rem',
            }}
          >
            Insurance Advisory Management System
          </Typography>
        </Container>
      </Box>

      {/* Module cards */}
      <Container maxWidth="md" sx={{ py: { xs: 5, md: 8 } }}>
        <Grid container spacing={3}>
          {/* RFQ Module */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '12px',
                    backgroundColor: '#0071E3',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 3,
                  }}
                >
                  <Typography sx={{ color: '#FFFFFF', fontSize: '1.25rem', fontWeight: 700 }}>R</Typography>
                </Box>
                <Typography sx={{ fontWeight: 600, fontSize: '1.25rem', mb: 1, color: '#1D1D1F' }}>
                  בקשות להצעות מחיר
                </Typography>
                <Typography sx={{ color: '#86868B', fontSize: '0.875rem', mb: 0.5 }}>
                  RFQ Module
                </Typography>
                <Typography sx={{ color: '#86868B', fontSize: '0.875rem', mb: 4 }}>
                  יצירת בקשות להצעות מחיר מותאמות לפי ענף ופרופיל סיכון
                </Typography>
                <Button
                  variant="contained"
                  color="secondary"
                  component={Link}
                  href="/rfq"
                  fullWidth
                  size="large"
                >
                  כניסה למודול RFQ
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Comparison Module */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '12px',
                    backgroundColor: '#1D1D1F',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 3,
                  }}
                >
                  <Typography sx={{ color: '#FFFFFF', fontSize: '1.25rem', fontWeight: 700 }}>C</Typography>
                </Box>
                <Typography sx={{ fontWeight: 600, fontSize: '1.25rem', mb: 1, color: '#1D1D1F' }}>
                  השוואת אישורי ביטוח
                </Typography>
                <Typography sx={{ color: '#86868B', fontSize: '0.875rem', mb: 0.5 }}>
                  Certificate Comparison
                </Typography>
                <Typography sx={{ color: '#86868B', fontSize: '0.875rem', mb: 4 }}>
                  השוואת אישורי ביטוח מול דרישות חוזיות
                </Typography>
                <Button
                  variant="contained"
                  component={Link}
                  href="/comparison"
                  fullWidth
                  size="large"
                >
                  כניסה למודול השוואה
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
