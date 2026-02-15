'use client';

import {
  Description as RfqIcon,
  CompareArrows as CompareIcon,
  Business as InsurerIcon,
  ArrowBack as ArrowIcon,
  Shield as ShieldIcon,
} from '@mui/icons-material';
import { Box, Button, Card, CardContent, Container, Grid, Typography, alpha } from '@mui/material';
import Link from 'next/link';
import { colors } from '@/theme';

const modules = [
  {
    titleHe: 'בקשות להצעות מחיר',
    titleEn: 'RFQ Generator',
    descHe: 'שאלון חכם, המלצות כיסוי מותאמות ויצירת RFQ מקצועי בלחיצה',
    href: '/rfq',
    icon: RfqIcon,
    color: colors.blue,
    gradient: `linear-gradient(135deg, ${colors.blue} 0%, #6366f1 100%)`,
  },
  {
    titleHe: 'השוואת אישורי ביטוח',
    titleEn: 'Certificate Comparison',
    descHe: 'העלאת אישורים, ניתוח אוטומטי והשוואה מול דרישות חוזיות',
    href: '/comparison',
    icon: CompareIcon,
    color: colors.emerald,
    gradient: `linear-gradient(135deg, ${colors.emerald} 0%, #06b6d4 100%)`,
  },
  {
    titleHe: 'השוואת מבטחים',
    titleEn: 'Insurer Comparison',
    descHe: 'השוואת פוליסות בין 7 חברות ביטוח לפי תקן BIT ישראלי',
    href: '/insurers',
    icon: InsurerIcon,
    color: colors.violet,
    gradient: `linear-gradient(135deg, ${colors.violet} 0%, #ec4899 100%)`,
  },
];

export default function HomePage() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: colors.slate50 }}>
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          background: `linear-gradient(160deg, ${colors.navy} 0%, ${colors.navyLight} 50%, #1a365d 100%)`,
          pt: { xs: 10, md: 14 },
          pb: { xs: 10, md: 14 },
        }}
      >
        {/* Subtle grid pattern overlay */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            opacity: 0.04,
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }}
        />
        {/* Gradient orbs */}
        <Box
          sx={{
            position: 'absolute',
            top: '-20%',
            right: '-10%',
            width: '50%',
            height: '140%',
            borderRadius: '50%',
            background: `radial-gradient(ellipse, ${alpha(colors.blue, 0.15)} 0%, transparent 60%)`,
            filter: 'blur(40px)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '-30%',
            left: '-5%',
            width: '40%',
            height: '120%',
            borderRadius: '50%',
            background: `radial-gradient(ellipse, ${alpha(colors.violet, 0.1)} 0%, transparent 60%)`,
            filter: 'blur(40px)',
          }}
        />

        <Container maxWidth="md" sx={{ position: 'relative', textAlign: 'center' }}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              px: 2,
              py: 0.75,
              mb: 3,
              borderRadius: '20px',
              bgcolor: alpha('#ffffff', 0.08),
              border: `1px solid ${alpha('#ffffff', 0.12)}`,
            }}
          >
            <ShieldIcon sx={{ fontSize: 16, color: colors.blue }} />
            <Typography
              sx={{ color: alpha('#ffffff', 0.8), fontSize: '0.8125rem', fontWeight: 500 }}
            >
              Insurance Advisory Platform
            </Typography>
          </Box>

          <Typography
            component="h1"
            sx={{
              fontFamily: 'var(--font-inter), "Inter", sans-serif',
              fontWeight: 800,
              fontSize: { xs: '2.75rem', md: '4rem' },
              letterSpacing: '-0.04em',
              color: '#FFFFFF',
              mb: 2,
              lineHeight: 1.1,
            }}
          >
            Riscovery
          </Typography>
          <Typography
            sx={{
              color: alpha('#ffffff', 0.7),
              fontWeight: 400,
              mb: 1,
              fontSize: { xs: '1.125rem', md: '1.375rem' },
              lineHeight: 1.6,
            }}
          >
            מערכת ניהול ייעוץ ביטוחי מקצועית
          </Typography>
          <Typography
            sx={{
              color: alpha('#ffffff', 0.4),
              fontSize: '0.9375rem',
            }}
          >
            Professional Insurance Advisory Management
          </Typography>
        </Container>
      </Box>

      {/* Module Cards */}
      <Container
        maxWidth="lg"
        sx={{ mt: -6, position: 'relative', zIndex: 1, pb: { xs: 6, md: 10 } }}
      >
        <Grid container spacing={3}>
          {modules.map((mod) => (
            <Grid item xs={12} sm={6} md={4} key={mod.href}>
              <Card
                sx={{
                  height: '100%',
                  borderRadius: '16px',
                  border: `1px solid ${colors.slate200}`,
                  bgcolor: '#FFFFFF',
                  transition: 'all 0.25s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 20px 40px ${alpha(mod.color, 0.15)}`,
                    borderColor: alpha(mod.color, 0.3),
                  },
                }}
              >
                <CardContent
                  sx={{
                    p: { xs: 3, md: 3.5 },
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                  }}
                >
                  <Box
                    sx={{
                      width: 52,
                      height: 52,
                      borderRadius: '12px',
                      background: mod.gradient,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2.5,
                      boxShadow: `0 4px 12px ${alpha(mod.color, 0.3)}`,
                    }}
                  >
                    <mod.icon sx={{ color: '#FFFFFF', fontSize: 26 }} />
                  </Box>
                  <Typography variant="h5" sx={{ mb: 0.5, fontWeight: 600 }}>
                    {mod.titleHe}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: colors.slate400, mb: 1.5, fontSize: '0.8125rem' }}
                  >
                    {mod.titleEn}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: colors.slate500,
                      mb: 3,
                      flex: 1,
                      fontSize: '0.875rem',
                      lineHeight: 1.7,
                    }}
                  >
                    {mod.descHe}
                  </Typography>
                  <Button
                    variant="contained"
                    component={Link}
                    href={mod.href}
                    fullWidth
                    size="large"
                    endIcon={<ArrowIcon sx={{ transform: 'rotate(180deg)' }} />}
                    sx={{
                      background: mod.gradient,
                      '&:hover': {
                        background: mod.gradient,
                        filter: 'brightness(1.1)',
                        boxShadow: `0 4px 16px ${alpha(mod.color, 0.4)}`,
                      },
                    }}
                  >
                    כניסה למודול
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
