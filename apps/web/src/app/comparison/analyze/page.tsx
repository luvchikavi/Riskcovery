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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useEffect, useState } from 'react';
import {
  comparisonApi,
  type ComparisonDocument,
  type ComparisonTemplate,
  type ComparisonAnalysis,
  type PolicyComparisonResult,
  type ComparisonRow,
  type ComparisonFieldStatus,
} from '@/lib/api';
import { useSnackbar } from '@/components/SnackbarProvider';

// ─── Helper: Status Chip ──────────────────────────────────────────────
function StatusChip({ status }: { status: ComparisonFieldStatus }) {
  const config: Record<ComparisonFieldStatus, { label: string; color: string; bg: string }> = {
    PASS: { label: 'תואם', color: '#1B5E20', bg: '#E8F5E9' },
    FAIL: { label: 'לא תואם', color: '#B71C1C', bg: '#FFEBEE' },
    PARTIAL: { label: 'חלקי', color: '#E65100', bg: '#FFF3E0' },
    MISSING: { label: 'חסר', color: '#616161', bg: '#F5F5F5' },
  };
  const c = config[status] || config.MISSING;
  return (
    <Chip
      label={c.label}
      size="small"
      sx={{ fontWeight: 600, color: c.color, backgroundColor: c.bg, minWidth: 70 }}
    />
  );
}

// ─── Helper: Format value ─────────────────────────────────────────────
function formatValue(v: string | number | null | undefined): string {
  if (v == null) return '—';
  if (typeof v === 'number') return `₪${v.toLocaleString()}`;
  return v;
}

// ─── Helper: Row background color ─────────────────────────────────────
function rowBgColor(status: ComparisonFieldStatus): string {
  switch (status) {
    case 'PASS': return '#F1F8E9';
    case 'FAIL': return '#FFF8F8';
    case 'PARTIAL': return '#FFF8E1';
    case 'MISSING': return '#FAFAFA';
    default: return 'transparent';
  }
}

export default function AnalyzePage() {
  const [documents, setDocuments] = useState<ComparisonDocument[]>([]);
  const [templates, setTemplates] = useState<ComparisonTemplate[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<ComparisonAnalysis | null>(null);
  const { showSuccess, showError } = useSnackbar();

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
      showSuccess('הניתוח הושלם בהצלחה');
    } catch (err) {
      showError('שגיאה בהרצת הניתוח');
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
      case 'compliant': return 'תואם';
      case 'partial': return 'תואם חלקית';
      case 'non_compliant': return 'לא תואם';
      case 'missing': return 'חסר';
      case 'expired': return 'פג תוקף';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'success';
      case 'partial': return 'warning';
      case 'non_compliant': case 'expired': return 'error';
      default: return 'default';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'error.main';
      case 'major': return 'warning.main';
      case 'minor': return 'info.main';
      default: return 'text.secondary';
    }
  };

  // Check if any policy result has rows (new format)
  const hasRows = analysisResult?.policyResults?.some((pr) => pr.rows && pr.rows.length > 0) ?? false;

  // Flatten all rows from all policies for summary table
  const allRows: ComparisonRow[] = analysisResult?.policyResults?.flatMap((pr) => pr.rows || []) ?? [];

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

          {/* Section 1: Summary Flat Table (new format) */}
          {hasRows && allRows.length > 0 && (
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  טבלת השוואה מפורטת
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small" dir="rtl">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#F5F5F5' }}>
                        <TableCell sx={{ fontWeight: 700 }}>סוג ביטוח</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>שדה</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>נדרש</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>הוצג</TableCell>
                        <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>סטטוס</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {allRows.map((row, idx) => (
                        <TableRow key={idx} sx={{ backgroundColor: rowBgColor(row.status) }}>
                          <TableCell sx={{ fontWeight: 500 }}>{row.policyTypeHe || '—'}</TableCell>
                          <TableCell>{row.fieldNameHe}</TableCell>
                          <TableCell>{formatValue(row.required)}</TableCell>
                          <TableCell>{formatValue(row.submitted)}</TableCell>
                          <TableCell sx={{ textAlign: 'center' }}>
                            <StatusChip status={row.status} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          )}

          {/* Section 2: Per-Policy Accordions */}
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
                {/* New: Field-by-field table inside accordion */}
                {result.rows && result.rows.length > 0 ? (
                  <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                    <Table size="small" dir="rtl">
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#F5F5F5' }}>
                          <TableCell sx={{ fontWeight: 700 }}>שדה</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>נדרש</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>הוצג</TableCell>
                          <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>סטטוס</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {result.rows.map((row, idx) => (
                          <TableRow key={idx} sx={{ backgroundColor: rowBgColor(row.status) }}>
                            <TableCell>{row.fieldNameHe}</TableCell>
                            <TableCell>{formatValue(row.required)}</TableCell>
                            <TableCell>{formatValue(row.submitted)}</TableCell>
                            <TableCell sx={{ textAlign: 'center' }}>
                              <StatusChip status={row.status} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <>
                    {/* Legacy: policy details + gap boxes fallback */}
                    {result.foundPolicy ? (
                      <Box>
                        <Typography variant="subtitle2" gutterBottom>
                          פרטי פוליסה שנמצאה:
                        </Typography>
                        <Grid container spacing={2} sx={{ mb: 2 }}>
                          {result.foundPolicy.policyNumber && (
                            <Grid item xs={6} md={3}>
                              <Typography variant="caption" color="text.secondary">מספר פוליסה</Typography>
                              <Typography variant="body2">{result.foundPolicy.policyNumber}</Typography>
                            </Grid>
                          )}
                          {result.foundPolicy.coverageLimit && (
                            <Grid item xs={6} md={3}>
                              <Typography variant="caption" color="text.secondary">גבול אחריות</Typography>
                              <Typography variant="body2">₪{result.foundPolicy.coverageLimit.toLocaleString()}</Typography>
                            </Grid>
                          )}
                          {result.foundPolicy.deductible && (
                            <Grid item xs={6} md={3}>
                              <Typography variant="caption" color="text.secondary">השתתפות עצמית</Typography>
                              <Typography variant="body2">₪{result.foundPolicy.deductible.toLocaleString()}</Typography>
                            </Grid>
                          )}
                          {result.foundPolicy.expirationDate && (
                            <Grid item xs={6} md={3}>
                              <Typography variant="caption" color="text.secondary">תוקף עד</Typography>
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
                  </>
                )}

                {/* Gaps section (shown for both old and new format) */}
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
                        {(gap.required != null || gap.found != null) && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                            נדרש: {typeof gap.required === 'number' ? `₪${gap.required.toLocaleString()}` : gap.required || '—'} |
                            נמצא: {typeof gap.found === 'number' ? `₪${gap.found.toLocaleString()}` : gap.found || '—'}
                          </Typography>
                        )}
                        {gap.recommendationHe && (
                          <Typography variant="body2" color="primary.main">
                            המלצה: {gap.recommendationHe}
                          </Typography>
                        )}
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
