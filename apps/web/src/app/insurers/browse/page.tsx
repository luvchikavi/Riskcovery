'use client';

import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Grid,
  Typography,
  Chip,
  LinearProgress,
} from '@mui/material';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { insurerApi, type InsurerSummary } from '@/lib/api';
import { EmptyState } from '@/components/EmptyState';

export default function InsurerBrowsePage() {
  const [insurers, setInsurers] = useState<InsurerSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    insurerApi.list()
      .then((res) => {
        if (res.success && res.data) setInsurers(res.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LinearProgress />;

  return (
    <Box>
      <Box mb={4}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: '#1D1D1F', mb: 0.5 }}>
          מבטחים
        </Typography>
        <Typography variant="body2" sx={{ color: '#86868B' }}>
          Browse all insurers and their policy offerings
        </Typography>
      </Box>

      {insurers.length === 0 ? (
        <EmptyState title="אין מבטחים" description="No insurers found in the database" />
      ) : (
        <Grid container spacing={2.5}>
          {insurers.map((insurer) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={insurer.id}>
              <Card>
                <CardActionArea component={Link} href={`/insurers/${insurer.code}`}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography sx={{ fontWeight: 600, fontSize: '1.1rem', color: '#1D1D1F', mb: 0.5 }}>
                      {insurer.nameHe}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#86868B', mb: 1.5 }}>
                      {insurer.nameEn}
                    </Typography>
                    <Box display="flex" gap={1} flexWrap="wrap">
                      <Chip
                        label={`${insurer.policyCount} פוליסות`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      {insurer.isActive && (
                        <Chip label="פעיל" size="small" color="success" variant="outlined" />
                      )}
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
