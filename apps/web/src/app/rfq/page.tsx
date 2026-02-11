'use client';

import {
  People as PeopleIcon,
  Description as DocumentIcon,
  TrendingUp as TrendingUpIcon,
  Add as AddIcon,
  ArrowBack as ArrowIcon,
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
} from '@mui/material';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { rfqApi, type Client } from '@/lib/api';
import { StatsSkeleton } from '@/components/LoadingSkeleton';
import { colors } from '@/theme';

interface DashboardStats {
  totalClients: number;
  totalDocuments: number;
  recentClients: Client[];
}

const statCards = [
  { labelHe: 'לקוחות פעילים', icon: PeopleIcon, color: colors.blue, key: 'totalClients' as const },
  { labelHe: 'מסמכי RFQ', icon: DocumentIcon, color: colors.emerald, key: 'totalDocuments' as const },
];

export default function RfqDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        const clientsResponse = await rfqApi.clients.list({ pageSize: 5 });
        if (clientsResponse.success && clientsResponse.data) {
          setStats({
            totalClients: clientsResponse.data.pagination.totalItems,
            totalDocuments: clientsResponse.data.data.reduce(
              (sum, c) => sum + (c._count?.documents || 0),
              0
            ),
            recentClients: clientsResponse.data.data,
          });
        }
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h4" sx={{ mb: 0.5 }}>לוח בקרה</Typography>
            <Typography variant="body2">RFQ Generator Dashboard</Typography>
          </Box>
        </Box>
        <StatsSkeleton count={3} />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  const questionnairesCount = stats?.recentClients?.filter((c) => c._count?.questionnaires).length || 0;

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
          <Grid item xs={12} sm={6} md={4} key={sc.key}>
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
                  {stats?.[sc.key] || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                <Box sx={{ p: 0.75, borderRadius: '8px', bgcolor: alpha(colors.amber, 0.1), display: 'flex' }}>
                  <TrendingUpIcon sx={{ fontSize: 20, color: colors.amber }} />
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  שאלונים ממולאים
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                {questionnairesCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Clients */}
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 0.25 }}>
            לקוחות אחרונים
          </Typography>
          <Typography variant="body2" sx={{ mb: 2.5 }}>
            Recent Clients
          </Typography>

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
                    '&:hover': {
                      backgroundColor: colors.slate50,
                    },
                  }}
                >
                  <Box>
                    <Typography sx={{ fontWeight: 500, fontSize: '0.9375rem' }}>
                      {client.name}
                    </Typography>
                    <Typography variant="body2">
                      {client.sector} {client.contactEmail ? `\u2022 ${client.contactEmail}` : ''}
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
              <Typography sx={{ color: colors.slate400, mb: 2 }}>
                אין לקוחות עדיין
              </Typography>
              <Button
                component={Link}
                href="/rfq/clients/new"
                variant="outlined"
                startIcon={<AddIcon />}
              >
                הוסף לקוח ראשון
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
