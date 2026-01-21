'use client';

import { Box, Button, Container, Typography } from '@mui/material';

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
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Button variant="contained" size="large" href="/login">
            התחברות
          </Button>
          <Button variant="outlined" size="large" href="/about">
            מידע נוסף
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
