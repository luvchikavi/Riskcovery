'use client';

import {
  Business as BusinessIcon,
  Phone as PhoneIcon,
  Language as WebIcon,
  ArrowForward as ArrowIcon,
} from '@mui/icons-material';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Button,
  Chip,
  Avatar,
} from '@mui/material';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { api, type InsurerSummary } from '@/lib/api';
import { StatsSkeleton } from '@/components/LoadingSkeleton';

export default function InsurersPage() {
  const [insurers, setInsurers] = useState<InsurerSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const response = await api.get<InsurerSummary[]>('/insurers');
        if (response.success && response.data) {
          setInsurers(response.data);
        }
      } catch (err) {
        console.error('Failed to load insurers:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <Box>
        <Box mb={4}>
          <Typography variant="h4" sx={{ fontWeight: 600, color: '#1D1D1F', mb: 0.5 }}>
            חברות ביטוח
          </Typography>
          <Typography variant="body2" sx={{ color: '#86868B' }}>
            Insurer Comparison Dashboard
          </Typography>
        </Box>
        <StatsSkeleton count={3} />
      </Box>
    );
  }

  const colors = ['#0071E3', '#34C759', '#FF9500', '#5856D6', '#FF3B30', '#AF52DE', '#1D1D1F'];

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, color: '#1D1D1F', mb: 0.5 }}>
            חברות ביטוח
          </Typography>
          <Typography variant="body2" sx={{ color: '#86868B' }}>
            {insurers.length} חברות ביטוח במערכת
          </Typography>
        </Box>
        <Button variant="contained" component={Link} href="/insurers/compare">
          השוואת פוליסות
        </Button>
      </Box>

      <Grid container spacing={3}>
        {insurers.map((insurer, idx) => (
          <Grid item xs={12} sm={6} md={4} key={insurer.id}>
            <Card sx={{ height: '100%', transition: 'transform 0.15s', '&:hover': { transform: 'translateY(-2px)' } }}>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Avatar sx={{ bgcolor: colors[idx % colors.length], width: 44, height: 44 }}>
                    {insurer.nameHe.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography sx={{ fontWeight: 600, fontSize: '1.1rem', color: '#1D1D1F' }}>
                      {insurer.nameHe}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#86868B' }}>
                      {insurer.nameEn}
                    </Typography>
                  </Box>
                </Box>

                <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                  <Chip
                    label={`${insurer.policyCount || 0} פוליסות`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                  {insurer.isActive && (
                    <Chip label="פעיל" size="small" color="success" variant="outlined" />
                  )}
                </Box>

                {insurer.phone && (
                  <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                    <PhoneIcon sx={{ fontSize: 14, color: '#86868B' }} />
                    <Typography variant="caption" sx={{ color: '#86868B' }}>
                      {insurer.phone}
                    </Typography>
                  </Box>
                )}
                {insurer.website && (
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <WebIcon sx={{ fontSize: 14, color: '#86868B' }} />
                    <Typography variant="caption" sx={{ color: '#86868B' }} noWrap>
                      {insurer.website}
                    </Typography>
                  </Box>
                )}

                <Button
                  component={Link}
                  href={`/insurers/${insurer.code}`}
                  variant="outlined"
                  size="small"
                  fullWidth
                  endIcon={<ArrowIcon sx={{ transform: 'rotate(180deg)' }} />}
                >
                  צפה בפוליסות
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
