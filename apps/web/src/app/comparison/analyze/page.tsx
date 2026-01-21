'use client';

import {
  CheckCircle as CompliantIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Help as MissingIcon,
  Schedule as ExpiredIcon,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  Grid,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  Typography,
  Alert,
  Chip,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useEffect, useState } from 'react';
import {
  comparisonApi,
  type ComparisonDocument,
  type ComparisonTemplate,
  type ComparisonAnalysis,
  type PolicyComparisonResult,
} from '@/lib/api';

export default function AnalyzePage() {
  const [documents, setDocuments] = useState<ComparisonDocument[]>([]);
  const [templates, setTemplates] = useState<ComparisonTemplate[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<ComparisonAnalysis | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [docsResponse, templatesResponse] = await Promise.all([
        comparisonApi.documents.list({ status: 'processed' }),
        comparisonApi.templates.list({ isActive: true }),
      ]);

      setDocuments(docsResponse.data || []);
      setTemplates(templatesResponse.data || []);
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const runAnalysis = async () => {
    if (!selectedDocument || !selectedTemplate) return;

    setAnalyzing(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const response = await comparisonApi.analysis.run(selectedDocument, selectedTemplate);
      setAnalysisResult(response.data || null);
    } catch (err) {
      setError('Failed to run analysis');
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <CompliantIcon sx={{ color: 'success.main' }} />;
      case 'partial':
        return <WarningIcon sx={{ color: 'warning.main' }} />;
      case 'non_compliant':
        return <ErrorIcon sx={{ color: 'error.main' }} />;
      case 'missing':
        return <MissingIcon sx={{ color: 'grey.500' }} />;
      case 'expired':
        return <ExpiredIcon sx={{ color: 'error.main' }} />;
      default:
        return <MissingIcon sx={{ color: 'grey.500' }} />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'תואם';
      case 'partial':
        return 'תואם חלקית';
      case 'non_compliant':
        return 'לא תואם';
      case 'missing':
        return 'חסר';
      case 'expired':
        return 'פג תוקף';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'success';
      case 'partial':
        return 'warning';
      case 'non_compliant':
      case 'expired':
        return 'error';
      case 'missing':
        return 'default';
      default:
        return 'default';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'error.main';
      case 'major':
        return 'warning.main';
      case 'minor':
        return 'info.main';
      default:
        return 'text.secondary';
    }
  };

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          ניתוח השוואה
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Compare insurance certificates against requirement templates
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Selection Form */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            בחר מסמך ותבנית
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={5}>
              <FormControl fullWidth>
                <InputLabel>מסמך</InputLabel>
                <Select
                  value={selectedDocument}
                  label="מסמך"
                  onChange={(e) => setSelectedDocument(e.target.value)}
                >
                  {documents.length === 0 ? (
                    <MenuItem disabled>אין מסמכים מעובדים</MenuItem>
                  ) : (
                    documents.map((doc) => (
                      <MenuItem key={doc.id} value={doc.id}>
                        {doc.originalName}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={5}>
              <FormControl fullWidth>
                <InputLabel>תבנית דרישות</InputLabel>
                <Select
                  value={selectedTemplate}
                  label="תבנית דרישות"
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                >
                  {templates.length === 0 ? (
                    <MenuItem disabled>אין תבניות</MenuItem>
                  ) : (
                    templates.map((template) => (
                      <MenuItem key={template.id} value={template.id}>
                        {template.nameHe} ({template.requirements?.length || 0} דרישות)
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                variant="contained"
                fullWidth
                sx={{ height: '100%' }}
                disabled={!selectedDocument || !selectedTemplate || analyzing}
                onClick={runAnalysis}
              >
                {analyzing ? 'מנתח...' : 'הרץ ניתוח'}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {analyzing && <LinearProgress sx={{ mb: 3 }} />}

      {/* Analysis Results */}
      {analysisResult && (
        <Box>
          {/* Summary Card */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight="bold">
                  תוצאות ניתוח
                </Typography>
                <Chip
                  icon={getStatusIcon(analysisResult.overallStatus)}
                  label={getStatusLabel(analysisResult.overallStatus)}
                  color={getStatusColor(analysisResult.overallStatus) as 'success' | 'warning' | 'error' | 'default'}
                  variant="outlined"
                />
              </Box>

              {/* Score */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">ציון התאמה</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {analysisResult.complianceScore}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={analysisResult.complianceScore}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: 'grey.200',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor:
                        analysisResult.complianceScore >= 80
                          ? 'success.main'
                          : analysisResult.complianceScore >= 50
                          ? 'warning.main'
                          : 'error.main',
                    },
                  }}
                />
              </Box>

              {/* Stats */}
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" fontWeight="bold" color="success.main">
                      {analysisResult.compliantCount}
                    </Typography>
                    <Typography variant="caption">תואם</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" fontWeight="bold" color="warning.main">
                      {analysisResult.partialCount}
                    </Typography>
                    <Typography variant="caption">תואם חלקית</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" fontWeight="bold" color="error.main">
                      {analysisResult.nonCompliantCount}
                    </Typography>
                    <Typography variant="caption">לא תואם</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" fontWeight="bold" color="grey.500">
                      {analysisResult.missingCount}
                    </Typography>
                    <Typography variant="caption">חסר</Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Detailed Results */}
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            פירוט לפי פוליסה
          </Typography>
          {analysisResult.policyResults.map((result: PolicyComparisonResult, index: number) => (
            <Accordion key={result.requirementId || index} sx={{ mb: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                  {getStatusIcon(result.status)}
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography fontWeight="bold">{result.policyTypeHe}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {result.policyType}
                    </Typography>
                  </Box>
                  <Chip
                    label={getStatusLabel(result.status)}
                    size="small"
                    color={getStatusColor(result.status) as 'success' | 'warning' | 'error' | 'default'}
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                {result.foundPolicy ? (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      פרטי פוליסה שנמצאה:
                    </Typography>
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      {result.foundPolicy.policyNumber && (
                        <Grid item xs={6} md={3}>
                          <Typography variant="caption" color="text.secondary">
                            מספר פוליסה
                          </Typography>
                          <Typography variant="body2">{result.foundPolicy.policyNumber}</Typography>
                        </Grid>
                      )}
                      {result.foundPolicy.coverageLimit && (
                        <Grid item xs={6} md={3}>
                          <Typography variant="caption" color="text.secondary">
                            גבול אחריות
                          </Typography>
                          <Typography variant="body2">
                            ₪{result.foundPolicy.coverageLimit.toLocaleString()}
                          </Typography>
                        </Grid>
                      )}
                      {result.foundPolicy.deductible && (
                        <Grid item xs={6} md={3}>
                          <Typography variant="caption" color="text.secondary">
                            השתתפות עצמית
                          </Typography>
                          <Typography variant="body2">
                            ₪{result.foundPolicy.deductible.toLocaleString()}
                          </Typography>
                        </Grid>
                      )}
                      {result.foundPolicy.expirationDate && (
                        <Grid item xs={6} md={3}>
                          <Typography variant="caption" color="text.secondary">
                            תוקף עד
                          </Typography>
                          <Typography variant="body2">{result.foundPolicy.expirationDate}</Typography>
                        </Grid>
                      )}
                    </Grid>
                  </Box>
                ) : (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    פוליסה זו לא נמצאה באישור הביטוח
                  </Alert>
                )}

                {result.gaps && result.gaps.length > 0 && (
                  <Box>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" color="error.main" gutterBottom>
                      פערים שנמצאו ({result.gaps.length}):
                    </Typography>
                    {result.gaps.map((gap, gapIdx) => (
                      <Box
                        key={gapIdx}
                        sx={{
                          p: 2,
                          mb: 1,
                          border: '1px solid',
                          borderColor: getSeverityColor(gap.severity),
                          borderRadius: 1,
                          backgroundColor: 'grey.50',
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" fontWeight="bold">
                            {gap.descriptionHe}
                          </Typography>
                          <Chip
                            label={gap.severity}
                            size="small"
                            sx={{
                              backgroundColor: getSeverityColor(gap.severity),
                              color: 'white',
                            }}
                          />
                        </Box>
                        {(gap.required || gap.found) && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                            נדרש: {typeof gap.required === 'number' ? `₪${gap.required.toLocaleString()}` : gap.required} |
                            נמצא: {typeof gap.found === 'number' ? `₪${gap.found.toLocaleString()}` : gap.found}
                          </Typography>
                        )}
                        <Typography variant="body2" color="primary.main">
                          המלצה: {gap.recommendationHe}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}
    </Box>
  );
}
