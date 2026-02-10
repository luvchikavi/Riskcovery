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
  LinearProgress,
} from '@mui/material';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { comparisonApi, type ComparisonDocument, type ComparisonTemplate } from '@/lib/api';

interface DashboardStats {
  totalDocuments: number;
  processedDocuments: number;
  totalTemplates: number;
  recentAnalyses: number;
}

const statCardSx = {
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 12px 24px rgba(0, 0, 0, 0.08)',
  },
};

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
        return 'success.main';
      case 'processing':
        return 'info.main';
      case 'failed':
        return 'error.main';
      default:
        return 'text.secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processed':
        return <CompliantIcon sx={{ color: 'success.main' }} />;
      case 'processing':
        return <WarningIcon sx={{ color: 'info.main' }} />;
      case 'failed':
        return <ErrorIcon sx={{ color: 'error.main' }} />;
      default:
        return <DocumentIcon sx={{ color: 'text.secondary' }} />;
    }
  };

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            השוואת אישורי ביטוח
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Insurance Certificate Comparison Dashboard
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="contained" component={Link} href="/comparison/documents">
            העלה מסמך
          </Button>
          <Button variant="outlined" component={Link} href="/comparison/analyze">
            התחל ניתוח
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderInlineStart: '4px solid', borderColor: 'primary.main', ...statCardSx }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <DocumentIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                <Box>
                  <Typography variant="h3" fontWeight="bold">
                    {stats.totalDocuments}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    מסמכים / Documents
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderInlineStart: '4px solid', borderColor: 'success.main', ...statCardSx }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <CompliantIcon sx={{ fontSize: 32, color: 'success.main' }} />
                <Box>
                  <Typography variant="h3" fontWeight="bold">
                    {stats.processedDocuments}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    עובדו / Processed
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderInlineStart: '4px solid', borderColor: 'info.main', ...statCardSx }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <TemplateIcon sx={{ fontSize: 32, color: 'info.main' }} />
                <Box>
                  <Typography variant="h3" fontWeight="bold">
                    {stats.totalTemplates}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    תבניות / Templates
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderInlineStart: '4px solid', borderColor: 'warning.main', ...statCardSx }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <WarningIcon sx={{ fontSize: 32, color: 'warning.main' }} />
                <Box>
                  <Typography variant="h3" fontWeight="bold">
                    {stats.recentAnalyses}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ניתוחים / Analyses
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Documents and Templates */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  מסמכים אחרונים
                </Typography>
                <Button size="small" component={Link} href="/comparison/documents">
                  הצג הכל
                </Button>
              </Box>
              {recentDocuments.length === 0 ? (
                <Typography color="text.secondary">אין מסמכים עדיין</Typography>
              ) : (
                recentDocuments.map((doc) => (
                  <Box
                    key={doc.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      py: 1,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    {getStatusIcon(doc.status)}
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body2" fontWeight="medium">
                        {doc.originalName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(doc.uploadedAt).toLocaleDateString('he-IL')}
                      </Typography>
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{ color: getStatusColor(doc.status), fontWeight: 'bold' }}
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
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  תבניות דרישות
                </Typography>
                <Button size="small" component={Link} href="/comparison/templates">
                  הצג הכל
                </Button>
              </Box>
              {templates.length === 0 ? (
                <Typography color="text.secondary">אין תבניות עדיין</Typography>
              ) : (
                templates.map((template) => (
                  <Box
                    key={template.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      py: 1,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <TemplateIcon color="primary" />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body2" fontWeight="medium">
                        {template.nameHe}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {template.requirements?.length || 0} דרישות
                      </Typography>
                    </Box>
                    {template.sector && (
                      <Typography variant="caption" color="primary">
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
