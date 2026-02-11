'use client';

import {
  Description as DocumentIcon,
  ListAlt as TemplateIcon,
  CheckCircle as CompliantIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Button,
} from '@mui/material';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { comparisonApi, type ComparisonDocument, type ComparisonTemplate } from '@/lib/api';
import { StatsSkeleton } from '@/components/LoadingSkeleton';
import { EmptyState } from '@/components/EmptyState';

interface DashboardStats {
  totalDocuments: number;
  processedDocuments: number;
  totalTemplates: number;
  recentAnalyses: number;
}

export default function ComparisonDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalDocuments: 0,
    processedDocuments: 0,
    totalTemplates: 0,
    recentAnalyses: 0,
  });
  const [recentDocuments, setRecentDocuments] = useState<ComparisonDocument[]>([]);
  const [templates, setTemplates] = useState<ComparisonTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [docsResponse, templatesResponse] = await Promise.all([
        comparisonApi.documents.list(),
        comparisonApi.templates.list(),
      ]);

      const documents = docsResponse.data || [];
      const templatesList = templatesResponse.data || [];

      setRecentDocuments(documents.slice(0, 5));
      setTemplates(templatesList.slice(0, 5));

      setStats({
        totalDocuments: documents.length,
        processedDocuments: documents.filter((d) => d.status === 'processed').length,
        totalTemplates: templatesList.length,
        recentAnalyses: templatesList.reduce((acc, t) => acc + (t._count?.analyses || 0), 0),
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processed':
        return '#34C759';
      case 'processing':
        return '#5856D6';
      case 'failed':
        return '#FF3B30';
      default:
        return '#86868B';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processed':
        return <CompliantIcon sx={{ color: '#34C759', fontSize: 20 }} />;
      case 'processing':
        return <WarningIcon sx={{ color: '#5856D6', fontSize: 20 }} />;
      case 'failed':
        return <ErrorIcon sx={{ color: '#FF3B30', fontSize: 20 }} />;
      default:
        return <DocumentIcon sx={{ color: '#86868B', fontSize: 20 }} />;
    }
  };

  if (loading) {
    return (
      <Box>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 600, color: '#1D1D1F', mb: 0.5 }}>
            השוואת אישורי ביטוח
          </Typography>
          <Typography variant="body2" sx={{ color: '#86868B' }}>
            Insurance Certificate Comparison Dashboard
          </Typography>
        </Box>
        <StatsSkeleton count={4} />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, color: '#1D1D1F', mb: 0.5 }}>
            השוואת אישורי ביטוח
          </Typography>
          <Typography variant="body2" sx={{ color: '#86868B' }}>
            Insurance Certificate Comparison Dashboard
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button variant="contained" component={Link} href="/comparison/documents">
            העלה מסמך
          </Button>
          <Button variant="outlined" component={Link} href="/comparison/analyze">
            התחל ניתוח
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <DocumentIcon sx={{ fontSize: 20, color: '#0071E3' }} />
                <Typography variant="body2" sx={{ color: '#86868B', fontWeight: 500 }}>
                  מסמכים
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#1D1D1F' }}>
                {stats.totalDocuments}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <CompliantIcon sx={{ fontSize: 20, color: '#34C759' }} />
                <Typography variant="body2" sx={{ color: '#86868B', fontWeight: 500 }}>
                  עובדו
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#1D1D1F' }}>
                {stats.processedDocuments}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <TemplateIcon sx={{ fontSize: 20, color: '#5856D6' }} />
                <Typography variant="body2" sx={{ color: '#86868B', fontWeight: 500 }}>
                  תבניות
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#1D1D1F' }}>
                {stats.totalTemplates}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <WarningIcon sx={{ fontSize: 20, color: '#FF9500' }} />
                <Typography variant="body2" sx={{ color: '#86868B', fontWeight: 500 }}>
                  ניתוחים
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#1D1D1F' }}>
                {stats.recentAnalyses}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Documents and Templates */}
      <Grid container spacing={2.5}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#1D1D1F' }}>
                  מסמכים אחרונים
                </Typography>
                <Button size="small" component={Link} href="/comparison/documents" sx={{ color: '#0071E3' }}>
                  הצג הכל
                </Button>
              </Box>
              {recentDocuments.length === 0 ? (
                <EmptyState title="אין מסמכים עדיין" description="Upload insurance certificates to get started" />
              ) : (
                recentDocuments.map((doc) => (
                  <Box
                    key={doc.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      py: 1.25,
                      px: 1,
                      borderRadius: '8px',
                      transition: 'background-color 0.15s ease',
                      '&:hover': { backgroundColor: '#F5F5F7' },
                    }}
                  >
                    {getStatusIcon(doc.status)}
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography sx={{ fontWeight: 500, fontSize: '0.875rem', color: '#1D1D1F' }}>
                        {doc.originalName}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#86868B' }}>
                        {new Date(doc.uploadedAt).toLocaleDateString('he-IL')}
                      </Typography>
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{ color: getStatusColor(doc.status), fontWeight: 600, fontSize: '0.6875rem' }}
                    >
                      {doc.status}
                    </Typography>
                  </Box>
                ))
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#1D1D1F' }}>
                  תבניות דרישות
                </Typography>
                <Button size="small" component={Link} href="/comparison/templates" sx={{ color: '#0071E3' }}>
                  הצג הכל
                </Button>
              </Box>
              {templates.length === 0 ? (
                <EmptyState title="אין תבניות עדיין" description="Create requirement templates to compare certificates" />
              ) : (
                templates.map((template) => (
                  <Box
                    key={template.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      py: 1.25,
                      px: 1,
                      borderRadius: '8px',
                      transition: 'background-color 0.15s ease',
                      '&:hover': { backgroundColor: '#F5F5F7' },
                    }}
                  >
                    <TemplateIcon sx={{ color: '#0071E3', fontSize: 20 }} />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography sx={{ fontWeight: 500, fontSize: '0.875rem', color: '#1D1D1F' }}>
                        {template.nameHe}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#86868B' }}>
                        {template.requirements?.length || 0} דרישות
                      </Typography>
                    </Box>
                    {template.sector && (
                      <Typography variant="caption" sx={{ color: '#0071E3', fontWeight: 500 }}>
                        {template.sector}
                      </Typography>
                    )}
                  </Box>
                ))
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
