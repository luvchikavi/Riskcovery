'use client';

import {
  Phone as PhoneIcon,
  Language as WebIcon,
  ArrowBack as ArrowIcon,
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
  alpha,
} from '@mui/material';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { api, type InsurerSummary } from '@/lib/api';
import { StatsSkeleton } from '@/components/LoadingSkeleton';
import { colors } from '@/theme';

const INSURER_COLORS = [colors.blue, colors.emerald, colors.amber, colors.violet, colors.rose, '#06b6d4', colors.navy];

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
          <Typography variant="h4" sx={{ mb: 0.5 }}>חברות ביטוח</Typography>
          <Typography variant="body2">{insurers.length} חברות ביטוח במערכת</Typography>
        </Box>
        <StatsSkeleton count={3} />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ mb: 0.5 }}>חברות ביטוח</Typography>
          <Typography variant="body2">{insurers.length} חברות ביטוח במערכת</Typography>
        </Box>
        <Button variant="contained" component={Link} href="/insurers/compare">
          השוואת פוליסות
        </Button>
      </Box>

      <Grid container spacing={2.5}>
        {insurers.map((insurer, idx) => {
          const color = INSURER_COLORS[idx % INSURER_COLORS.length]!;
          return (
            <Grid item xs={12} sm={6} md={4} key={insurer.id}>
              <Card
                sx={{
                  height: '100%',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: `0 8px 24px ${alpha(color, 0.12)}`,
                    borderColor: alpha(color, 0.3),
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" gap={2} mb={2.5}>
                    <Avatar
                      sx={{
                        bgcolor: alpha(color, 0.1),
                        color: color,
                        width: 44,
                        height: 44,
                        fontWeight: 700,
                        fontSize: '1rem',
                      }}
                    >
                      {insurer.nameHe.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontSize: '1.05rem' }}>
                        {insurer.nameHe}
                      </Typography>
                      <Typography variant="caption">
                        {insurer.nameEn}
                      </Typography>
                    </Box>
                  </Box>

                  <Box display="flex" gap={1} mb={2.5} flexWrap="wrap">
                    <Chip
                      label={`${insurer.policyCount || 0} פוליסות`}
                      size="small"
                      color="primary"
                    />
                    {insurer.isActive && (
                      <Chip label="פעיל" size="small" color="success" />
                    )}
                  </Box>

                  {insurer.phone && (
                    <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                      <PhoneIcon sx={{ fontSize: 14, color: colors.slate400 }} />
                      <Typography variant="caption">{insurer.phone}</Typography>
                    </Box>
                  )}
                  {insurer.website && (
                    <Box display="flex" alignItems="center" gap={1} mb={2.5}>
                      <WebIcon sx={{ fontSize: 14, color: colors.slate400 }} />
                      <Typography variant="caption" noWrap>{insurer.website}</Typography>
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
          );
        })}
      </Grid>
    </Box>
  );
}
