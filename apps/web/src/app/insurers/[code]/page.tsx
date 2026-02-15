'use client';

import {
  ArrowBack as BackIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Button,
  Chip,
  IconButton,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { api, type InsurerSummary, type InsurerPolicyDetail } from '@/lib/api';

export default function InsurerDetailPage() {
  const params = useParams();
  const code = params.code as string;
  const [insurer, setInsurer] = useState<InsurerSummary | null>(null);
  const [policies, setPolicies] = useState<InsurerPolicyDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [insurerRes, policiesRes] = await Promise.all([
          api.get<InsurerSummary>(`/insurers/${code}`),
          api.get<InsurerPolicyDetail[]>(`/insurers/${code}/policies`),
        ]);
        if (insurerRes.success && insurerRes.data) setInsurer(insurerRes.data);
        if (policiesRes.success && policiesRes.data) setPolicies(policiesRes.data);
      } catch (err: unknown) {
        console.error('Failed to load insurer:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [code]);

  if (loading) return <LinearProgress />;
  if (!insurer) return <Typography>לא נמצא מבטח</Typography>;

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={2} mb={4}>
        <IconButton component={Link} href="/insurers">
          <BackIcon />
        </IconButton>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, color: '#1D1D1F' }}>
            {insurer.nameHe}
          </Typography>
          <Typography variant="body2" sx={{ color: '#86868B' }}>
            {insurer.nameEn} &middot; {policies.length} פוליסות
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={2.5}>
        {policies.map((policy) => (
          <Grid item xs={12} md={6} key={policy.id}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                  <Box>
                    <Typography sx={{ fontWeight: 600, fontSize: '1rem', color: '#1D1D1F' }}>
                      {policy.productCode.replace(/_/g, ' ')}
                    </Typography>
                    {policy.policyFormCode && (
                      <Typography variant="caption" sx={{ color: '#86868B' }}>
                        {policy.policyFormCode}
                      </Typography>
                    )}
                  </Box>
                  <Chip label={policy.bitStandard || 'N/A'} size="small" variant="outlined" />
                </Box>

                <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                  <Chip
                    label={`${policy.extensions?.length || 0} הרחבות`}
                    size="small"
                    color="success"
                    variant="outlined"
                  />
                  <Chip
                    label={`${policy.exclusions?.length || 0} חריגים`}
                    size="small"
                    color="error"
                    variant="outlined"
                  />
                  {policy.isMaster && <Chip label="BIT Standard" size="small" color="primary" />}
                </Box>

                {/* Strengths */}
                {policy.strengths && (policy.strengths as string[]).length > 0 && (
                  <Box mb={1}>
                    {(policy.strengths as string[]).slice(0, 2).map((s, i) => (
                      <Box key={i} display="flex" alignItems="center" gap={0.5} mb={0.5}>
                        <CheckIcon sx={{ fontSize: 14, color: '#34C759' }} />
                        <Typography variant="caption" sx={{ color: '#1D1D1F' }}>
                          {s}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}

                {/* Weaknesses */}
                {policy.weaknesses && (policy.weaknesses as string[]).length > 0 && (
                  <Box>
                    {(policy.weaknesses as string[]).slice(0, 2).map((w, i) => (
                      <Box key={i} display="flex" alignItems="center" gap={0.5} mb={0.5}>
                        <WarningIcon sx={{ fontSize: 14, color: '#FF9500' }} />
                        <Typography variant="caption" sx={{ color: '#1D1D1F' }}>
                          {w}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}

                {/* Extensions accordion */}
                {policy.extensions && policy.extensions.length > 0 && (
                  <Accordion sx={{ mt: 1, boxShadow: 'none', '&:before': { display: 'none' } }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 0, minHeight: 36 }}>
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        הרחבות ({policy.extensions.length})
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ px: 0, pt: 0 }}>
                      {policy.extensions.map((ext) => (
                        <Box key={ext.id} display="flex" justifyContent="space-between" py={0.5}>
                          <Typography variant="caption">
                            {ext.code} - {ext.nameHe}
                          </Typography>
                          {!ext.isStandard && (
                            <Chip
                              label="ייחודי"
                              size="small"
                              color="info"
                              sx={{ height: 18, fontSize: '0.625rem' }}
                            />
                          )}
                        </Box>
                      ))}
                    </AccordionDetails>
                  </Accordion>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
