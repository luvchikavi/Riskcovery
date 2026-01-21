'use client';

import { Box, Button, Card, CardContent, Container, Grid, Typography } from '@mui/material';
import { Description as RfqIcon, Compare as CompareIcon } from '@mui/icons-material';
import Link from 'next/link';

export default function HomePage() {
  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: 4,
          py: 4,
        }}
      >
        <Typography variant="h2" component="h1" fontWeight="bold" color="primary">
          Riscovery
        </Typography>
        <Typography variant="h5" color="text.secondary" textAlign="center">
          Insurance Advisory Management System
        </Typography>
        <Typography variant="body1" color="text.secondary" textAlign="center" maxWidth={600}>
          מערכת ניהול ייעוץ ביטוחי - מעקב ציות ויצירת בקשות להצעות מחיר
        </Typography>

        {/* Module Cards */}
        <Grid container spacing={4} sx={{ mt: 4, maxWidth: 800 }}>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%', '&:hover': { boxShadow: 6 }, transition: 'box-shadow 0.3s' }}>
              <CardContent sx={{ textAlign: 'center', p: 4 }}>
                <RfqIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  בקשות להצעות מחיר
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  RFQ Module - יצירת בקשות להצעות מחיר מותאמות לפי ענף ופרופיל סיכון
                </Typography>
                <Button variant="contained" component={Link} href="/rfq" fullWidth>
                  כניסה למודול RFQ
                </Button>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%', '&:hover': { boxShadow: 6 }, transition: 'box-shadow 0.3s' }}>
              <CardContent sx={{ textAlign: 'center', p: 4 }}>
                <CompareIcon sx={{ fontSize: 64, color: 'secondary.main', mb: 2 }} />
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  השוואת אישורי ביטוח
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Certificate Comparison - השוואת אישורי ביטוח מול דרישות חוזיות
                </Typography>
                <Button variant="contained" color="secondary" component={Link} href="/comparison" fullWidth>
                  כניסה למודול השוואה
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}
