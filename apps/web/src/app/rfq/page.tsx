'use client';

import {
  People as PeopleIcon,
  Description as DocumentIcon,
  TrendingUp as TrendingUpIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { rfqApi, type Client } from '@/lib/api';

interface DashboardStats {
  totalClients: number;
  totalDocuments: number;
  recentClients: Client[];
}

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
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            לוח בקרה - מחולל RFQ
          </Typography>
          <Typography color="text.secondary">
            RFQ Generator Dashboard
          </Typography>
        </Box>
        <Button
          component={Link}
          href="/rfq/clients/new"
          variant="contained"
          startIcon={<AddIcon />}
          size="large"
        >
          לקוח חדש
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    backgroundColor: 'primary.light',
                    color: 'primary.main',
                  }}
                >
                  <PeopleIcon fontSize="large" />
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {stats?.totalClients || 0}
                  </Typography>
                  <Typography color="text.secondary">לקוחות פעילים</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    backgroundColor: 'success.light',
                    color: 'success.main',
                  }}
                >
                  <DocumentIcon fontSize="large" />
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {stats?.totalDocuments || 0}
                  </Typography>
                  <Typography color="text.secondary">מסמכי RFQ</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    backgroundColor: 'warning.light',
                    color: 'warning.main',
                  }}
                >
                  <TrendingUpIcon fontSize="large" />
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {stats?.recentClients?.filter((c) => c._count?.questionnaires).length || 0}
                  </Typography>
                  <Typography color="text.secondary">שאלונים ממולאים</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Clients */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            לקוחות אחרונים
          </Typography>
          <Typography color="text.secondary" gutterBottom>
            Recent Clients
          </Typography>

          {stats?.recentClients && stats.recentClients.length > 0 ? (
            <Box mt={2}>
              {stats.recentClients.map((client) => (
                <Box
                  key={client.id}
                  component={Link}
                  href={`/rfq/clients/${client.id}`}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 2,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    textDecoration: 'none',
                    color: 'inherit',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                    '&:last-child': {
                      borderBottom: 'none',
                    },
                  }}
                >
                  <Box>
                    <Typography fontWeight="medium">{client.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {client.sector} • {client.contactEmail || 'No email'}
                    </Typography>
                  </Box>
                  <Box textAlign="left">
                    <Typography variant="body2" color="text.secondary">
                      {new Date(client.createdAt).toLocaleDateString('he-IL')}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          ) : (
            <Box py={4} textAlign="center">
              <Typography color="text.secondary" gutterBottom>
                אין לקוחות עדיין
              </Typography>
              <Button
                component={Link}
                href="/rfq/clients/new"
                variant="outlined"
                startIcon={<AddIcon />}
                sx={{ mt: 2 }}
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
