'use client';

import { Description as RfqIcon, Compare as CompareIcon } from '@mui/icons-material';
import { Box, Button, Card, CardContent, Container, Grid, Typography } from '@mui/material';
import Link from 'next/link';

const modules = [
  {
    titleHe: 'בקשות להצעות מחיר',
    subtitle: 'RFQ Module',
    descriptionHe: 'יצירת בקשות להצעות מחיר מותאמות לפי ענף ופרופיל סיכון',
    href: '/rfq',
    buttonHe: 'כניסה למודול RFQ',
    icon: <RfqIcon sx={{ fontSize: 40 }} />,
    accentColor: '#4F46E5',
    bgColor: '#E0E7FF',
    buttonColor: 'primary' as const,
  },
  {
    titleHe: 'השוואת אישורי ביטוח',
    subtitle: 'Certificate Comparison',
    descriptionHe: 'השוואת אישורי ביטוח מול דרישות חוזיות',
    href: '/comparison',
    buttonHe: 'כניסה למודול השוואה',
    icon: <CompareIcon sx={{ fontSize: 40 }} />,
    accentColor: '#0D9488',
    bgColor: '#CCFBF1',
    buttonColor: 'secondary' as const,
  },
];

export default function HomePage() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Hero section */}
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #4F46E5 0%, #312E81 50%, #0D9488 100%)',
          py: { xs: 8, md: 12 },
          px: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        {/* CSS-only animated gradient accent */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.4,
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 6s ease-in-out infinite',
            '@keyframes shimmer': {
              '0%': { backgroundPosition: '200% 0' },
              '100%': { backgroundPosition: '-200% 0' },
            },
          }}
        />

        {/* Decorative circles */}
        <Box
          sx={{
            position: 'absolute',
            top: -80,
            right: -80,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -60,
            left: -60,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
          }}
        />

        <Typography
          variant="h2"
          component="h1"
          fontWeight="bold"
          sx={{
            color: '#FFFFFF',
            fontFamily: 'var(--font-plus-jakarta), "Plus Jakarta Sans", sans-serif',
            letterSpacing: '0.02em',
            position: 'relative',
            zIndex: 1,
            mb: 2,
          }}
        >
          Riscovery
        </Typography>
        <Typography
          variant="h5"
          sx={{
            color: 'rgba(255, 255, 255, 0.9)',
            position: 'relative',
            zIndex: 1,
            mb: 1,
          }}
        >
          מערכת ניהול ייעוץ ביטוחי
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: 'rgba(255, 255, 255, 0.7)',
            position: 'relative',
            zIndex: 1,
            maxWidth: 500,
          }}
        >
          Insurance Advisory Management System
        </Typography>
      </Box>

      {/* Module cards */}
      <Container maxWidth="md" sx={{ py: 6, flex: 1 }}>
        <Grid container spacing={4}>
          {modules.map((mod) => (
            <Grid item xs={12} md={6} key={mod.href}>
              <Card
                sx={{
                  height: '100%',
                  position: 'relative',
                  overflow: 'visible',
                  borderTop: `4px solid ${mod.accentColor}`,
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                  },
                  transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: 3,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: mod.bgColor,
                      color: mod.accentColor,
                      mb: 3,
                    }}
                  >
                    {mod.icon}
                  </Box>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    {mod.titleHe}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    {mod.subtitle}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    {mod.descriptionHe}
                  </Typography>
                  <Button
                    variant="contained"
                    color={mod.buttonColor}
                    component={Link}
                    href={mod.href}
                    fullWidth
                    size="large"
                  >
                    {mod.buttonHe}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
