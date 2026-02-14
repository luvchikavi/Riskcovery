'use client';

import {
  People as PeopleIcon,
  Description as DocumentIcon,
  TrendingUp as TrendingUpIcon,
  Add as AddIcon,
  ArrowBack as ArrowIcon,
  QuestionAnswer as QuestionnaireIcon,
} from '@mui/icons-material';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Button,
  Alert,
  alpha,
  Chip,
} from '@mui/material';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';

import { rfqApi } from '@/lib/api';
import { StatsSkeleton } from '@/components/LoadingSkeleton';
import { SECTORS_MAP } from '@/lib/constants';
import { colors } from '@/theme';

export default function RfqDashboardPage() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['rfq', 'stats'],
    queryFn: async () => {
      const res = await rfqApi.stats();
      if (!res.success || !res.data) throw new Error('Failed to load stats');
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h4" sx={{ mb: 0.5 }}>לוח בקרה</Typography>
            <Typography variant="body2">RFQ Generator Dashboard</Typography>
          </Box>
        </Box>
        <StatsSkeleton count={4} />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">Failed to load dashboard data</Alert>;
  }

  const statCards = [
    { labelHe: 'לקוחות פעילים', value: stats?.totalClients ?? 0, icon: PeopleIcon, color: colors.blue },
    { labelHe: 'שאלונים', value: stats?.totalQuestionnaires ?? 0, icon: QuestionnaireIcon, color: colors.amber },
    { labelHe: 'מסמכי RFQ', value: stats?.totalDocuments ?? 0, icon: DocumentIcon, color: colors.emerald },
    { labelHe: 'ענפים פעילים', value: Object.keys(stats?.clientsBySector ?? {}).length, icon: TrendingUpIcon, color: '#8b5cf6' },
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" sx={{ mb: 0.5 }}>לוח בקרה</Typography>
          <Typography variant="body2">RFQ Generator Dashboard</Typography>
        </Box>
        <Button
          component={Link}
          href="/rfq/clients/new"
          variant="contained"
          startIcon={<AddIcon />}
        >
          לקוח חדש
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2.5} mb={4}>
        {statCards.map((sc) => (
          <Grid item xs={6} sm={3} key={sc.labelHe}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                  <Box sx={{ p: 0.75, borderRadius: '8px', bgcolor: alpha(sc.color, 0.1), display: 'flex' }}>
                    <sc.icon sx={{ fontSize: 20, color: sc.color }} />
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {sc.labelHe}
                  </Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 700 }}>
                  {sc.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2.5}>
        {/* Recent Clients */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2.5}>
                <Box>
                  <Typography variant="h6" sx={{ mb: 0.25 }}>לקוחות אחרונים</Typography>
                  <Typography variant="body2">Recent Clients</Typography>
                </Box>
                <Button component={Link} href="/rfq/clients" size="small">
                  הצג הכל
                </Button>
              </Box>

              {stats?.recentClients && stats.recentClients.length > 0 ? (
                <Box>
                  {stats.recentClients.map((client) => (
                    <Box
                      key={client.id}
                      component={Link}
                      href={`/rfq/clients/${client.id}`}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        py: 1.5,
                        px: 1.5,
                        borderRadius: '8px',
                        textDecoration: 'none',
                        color: 'inherit',
                        transition: 'background-color 0.15s ease',
                        '&:hover': { backgroundColor: colors.slate50 },
                      }}
                    >
                      <Box>
                        <Typography sx={{ fontWeight: 500, fontSize: '0.9375rem' }}>
                          {client.name}
                        </Typography>
                        <Typography variant="body2">
                          {SECTORS_MAP[client.sector]?.label ?? client.sector}
                          {client.contactEmail ? ` \u2022 ${client.contactEmail}` : ''}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="caption">
                          {new Date(client.createdAt).toLocaleDateString('he-IL')}
                        </Typography>
                        <ArrowIcon sx={{ fontSize: 16, color: colors.slate400, transform: 'rotate(180deg)' }} />
                      </Box>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Box py={4} textAlign="center">
                  <Typography sx={{ color: colors.slate400, mb: 2 }}>אין לקוחות עדיין</Typography>
                  <Button component={Link} href="/rfq/clients/new" variant="outlined" startIcon={<AddIcon />}>
                    הוסף לקוח ראשון
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Sector Breakdown */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 0.25 }}>חלוקה לפי ענף</Typography>
              <Typography variant="body2" sx={{ mb: 2.5 }}>Clients by Sector</Typography>

              {stats?.clientsBySector && Object.keys(stats.clientsBySector).length > 0 ? (
                <Box display="flex" flexDirection="column" gap={1.5}>
                  {Object.entries(stats.clientsBySector)
                    .sort(([, a], [, b]) => b - a)
                    .map(([sector, count]) => (
                      <Box key={sector} display="flex" justifyContent="space-between" alignItems="center">
                        <Chip
                          label={SECTORS_MAP[sector]?.label ?? sector}
                          size="small"
                          variant="outlined"
                        />
                        <Typography fontWeight="bold">{count}</Typography>
                      </Box>
                    ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
                  אין נתונים
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
