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
        <CircularProgress sx={{ color: '#1D1D1F' }} />
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
          <Typography variant="h4" sx={{ fontWeight: 600, color: '#1D1D1F', mb: 0.5 }}>
            לוח בקרה
          </Typography>
          <Typography variant="body2" sx={{ color: '#86868B' }}>
            RFQ Generator Dashboard
          </Typography>
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
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <PeopleIcon sx={{ fontSize: 20, color: '#0071E3' }} />
                <Typography variant="body2" sx={{ color: '#86868B', fontWeight: 500 }}>
                  לקוחות פעילים
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#1D1D1F' }}>
                {stats?.totalClients || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <DocumentIcon sx={{ fontSize: 20, color: '#34C759' }} />
                <Typography variant="body2" sx={{ color: '#86868B', fontWeight: 500 }}>
                  מסמכי RFQ
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#1D1D1F' }}>
                {stats?.totalDocuments || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <TrendingUpIcon sx={{ fontSize: 20, color: '#FF9500' }} />
                <Typography variant="body2" sx={{ color: '#86868B', fontWeight: 500 }}>
                  שאלונים ממולאים
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#1D1D1F' }}>
                {stats?.recentClients?.filter((c) => c._count?.questionnaires).length || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Clients */}
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#1D1D1F', mb: 0.5 }}>
            לקוחות אחרונים
          </Typography>
          <Typography variant="body2" sx={{ color: '#86868B', mb: 2 }}>
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
                    px: 1,
                    borderRadius: '10px',
                    textDecoration: 'none',
                    color: 'inherit',
                    transition: 'background-color 0.15s ease',
                    '&:hover': {
                      backgroundColor: '#F5F5F7',
                    },
                  }}
                >
                  <Box>
                    <Typography sx={{ fontWeight: 500, fontSize: '0.9375rem', color: '#1D1D1F' }}>
                      {client.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#86868B' }}>
                      {client.sector} • {client.contactEmail || 'No email'}
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: '#86868B' }}>
                    {new Date(client.createdAt).toLocaleDateString('he-IL')}
                  </Typography>
                </Box>
              ))}
            </Box>
          ) : (
            <Box py={4} textAlign="center">
              <Typography sx={{ color: '#86868B', mb: 2 }}>
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
