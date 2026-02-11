'use client';

import {
  ArrowBack as BackIcon,
  CheckCircle as CompliantIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Help as MissingIcon,
  Schedule as ExpiredIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  Typography,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import {
  comparisonApi,
  type ComparisonAnalysis,
  type PolicyComparisonResult,
} from '@/lib/api';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useSnackbar } from '@/components/SnackbarProvider';

const STATUS_CONFIG: Record<string, { icon: typeof CompliantIcon; color: string; label: string }> = {
  compliant: { icon: CompliantIcon, color: 'success.main', label: 'תואם' },
  partial: { icon: WarningIcon, color: 'warning.main', label: 'תואם חלקית' },
  non_compliant: { icon: ErrorIcon, color: 'error.main', label: 'לא תואם' },
  missing: { icon: MissingIcon, color: 'grey.500', label: 'חסר' },
  expired: { icon: ExpiredIcon, color: 'error.main', label: 'פג תוקף' },
};

function getStatusConfig(status: string) {
  return STATUS_CONFIG[status] ?? STATUS_CONFIG['missing']!;
}

function getStatusColor(status: string): 'success' | 'warning' | 'error' | 'default' {
  switch (status) {
    case 'compliant':
      return 'success';
    case 'partial':
      return 'warning';
    case 'non_compliant':
    case 'expired':
      return 'error';
    default:
      return 'default';
  }
}

function getSeverityColor(severity: string) {
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
}

export default function AnalysisDetailPage() {
  const params = useParams();
  const router = useRouter();
  const analysisId = params.id as string;
  const { showSuccess, showError } = useSnackbar();

  const [analysis, setAnalysis] = useState<ComparisonAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    loadAnalysis();
  }, [analysisId]);

  const loadAnalysis = async () => {
    setLoading(true);
    try {
      const response = await comparisonApi.analysis.get(analysisId);
      if (response.success && response.data) {
        setAnalysis(response.data);
      }
    } catch (err) {
      console.error('Failed to load analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await comparisonApi.analysis.delete(analysisId);
      showSuccess('הניתוח נמחק בהצלחה');
      router.push('/comparison/analyze');
    } catch {
      showError('שגיאה במחיקת הניתוח');
    }
  };

  if (loading) return <LinearProgress />;

  if (!analysis) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 3 }}>ניתוח לא נמצא</Alert>
        <Button component={Link} href="/comparison/analyze" variant="outlined" startIcon={<BackIcon />}>
          חזרה לניתוח
        </Button>
      </Box>
    );
  }

  const StatusIcon = getStatusConfig(analysis.overallStatus).icon;
  const scoreColor =
    analysis.complianceScore >= 80
      ? 'success.main'
      : analysis.complianceScore >= 50
      ? 'warning.main'
      : 'error.main';

  // Separate results by status for organized display
  const critical = analysis.policyResults.filter((r) => r.status === 'non_compliant' || r.status === 'missing');
  const warnings = analysis.policyResults.filter((r) => r.status === 'partial' || r.status === 'expired');
  const compliant = analysis.policyResults.filter((r) => r.status === 'compliant');

  return (
    <Box>
      {/* Header */}
      <Box display="flex" alignItems="center" gap={2} mb={4}>
        <IconButton component={Link} href="/comparison/analyze">
          <BackIcon />
        </IconButton>
        <Box flexGrow={1}>
          <Typography variant="h4" sx={{ fontWeight: 600, color: '#1D1D1F' }}>
            פרטי ניתוח
          </Typography>
          <Typography variant="body2" sx={{ color: '#86868B' }}>
            Analysis Detail &middot; {new Date(analysis.analyzedAt).toLocaleString('he-IL')}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={loadAnalysis}
        >
          רענן
        </Button>
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={() => setDeleteOpen(true)}
        >
          מחק
        </Button>
      </Box>

      {/* Overall Score Card */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Box display="flex" alignItems="center" gap={2}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '4px solid',
                  borderColor: scoreColor,
                }}
              >
                <Typography
                  variant="h4"
                  fontWeight={700}
                  sx={{ color: scoreColor }}
                >
                  {analysis.complianceScore}
                </Typography>
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  ציון התאמה כולל
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {analysis.totalRequirements} דרישות נבדקו
                </Typography>
              </Box>
            </Box>
            <Chip
              icon={<StatusIcon />}
              label={getStatusConfig(analysis.overallStatus).label}
              color={getStatusColor(analysis.overallStatus)}
              sx={{ fontWeight: 600, fontSize: '0.95rem', height: 36, px: 1 }}
            />
          </Box>

          {/* Progress bar */}
          <LinearProgress
            variant="determinate"
            value={analysis.complianceScore}
            sx={{
              height: 12,
              borderRadius: 6,
              mb: 3,
              backgroundColor: 'grey.200',
              '& .MuiLinearProgress-bar': { backgroundColor: scoreColor, borderRadius: 6 },
            }}
          />

          {/* Stats grid */}
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Box textAlign="center" p={2} borderRadius={1} bgcolor="success.50">
                <Typography variant="h3" fontWeight={700} color="success.main">
                  {analysis.compliantCount}
                </Typography>
                <Typography variant="caption" fontWeight={600}>תואם</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box textAlign="center" p={2} borderRadius={1} bgcolor="warning.50">
                <Typography variant="h3" fontWeight={700} color="warning.main">
                  {analysis.partialCount}
                </Typography>
                <Typography variant="caption" fontWeight={600}>תואם חלקית</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box textAlign="center" p={2} borderRadius={1} bgcolor="error.50">
                <Typography variant="h3" fontWeight={700} color="error.main">
                  {analysis.nonCompliantCount}
                </Typography>
                <Typography variant="caption" fontWeight={600}>לא תואם</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box textAlign="center" p={2} borderRadius={1} bgcolor="grey.100">
                <Typography variant="h3" fontWeight={700} color="grey.500">
                  {analysis.missingCount}
                </Typography>
                <Typography variant="caption" fontWeight={600}>חסר</Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Critical Issues */}
      {critical.length > 0 && (
        <Box mb={4}>
          <Typography variant="h6" fontWeight={600} color="error.main" gutterBottom>
            בעיות קריטיות ({critical.length})
          </Typography>
          {critical.map((result, index) => (
            <PolicyResultAccordion key={result.requirementId || index} result={result} defaultExpanded />
          ))}
        </Box>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <Box mb={4}>
          <Typography variant="h6" fontWeight={600} color="warning.main" gutterBottom>
            אזהרות ({warnings.length})
          </Typography>
          {warnings.map((result, index) => (
            <PolicyResultAccordion key={result.requirementId || index} result={result} />
          ))}
        </Box>
      )}

      {/* Compliant */}
      {compliant.length > 0 && (
        <Box mb={4}>
          <Typography variant="h6" fontWeight={600} color="success.main" gutterBottom>
            תואם ({compliant.length})
          </Typography>
          {compliant.map((result, index) => (
            <PolicyResultAccordion key={result.requirementId || index} result={result} />
          ))}
        </Box>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteOpen}
        title="מחיקת ניתוח"
        message="האם אתה בטוח שברצונך למחוק ניתוח זה? לא ניתן לבטל פעולה זו."
        confirmLabel="מחק"
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
        destructive
      />
    </Box>
  );
}

// Sub-component for policy result accordion
function PolicyResultAccordion({
  result,
  defaultExpanded = false,
}: {
  result: PolicyComparisonResult;
  defaultExpanded?: boolean;
}) {
  const config = getStatusConfig(result.status);
  const StatusIcon = config.icon;

  return (
    <Accordion defaultExpanded={defaultExpanded} sx={{ mb: 1 }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box display="flex" alignItems="center" gap={2} width="100%">
          <StatusIcon sx={{ color: config.color }} />
          <Box flexGrow={1}>
            <Typography fontWeight={600}>{result.policyTypeHe}</Typography>
            <Typography variant="caption" color="text.secondary">
              {result.policyType}
            </Typography>
          </Box>
          <Box display="flex" gap={0.5}>
            {result.limitCompliant !== undefined && (
              <Chip
                label="גבול"
                size="small"
                color={result.limitCompliant ? 'success' : 'error'}
                variant="outlined"
                sx={{ height: 22, fontSize: '0.65rem' }}
              />
            )}
            {result.endorsementsCompliant !== undefined && (
              <Chip
                label="הרחבות"
                size="small"
                color={result.endorsementsCompliant ? 'success' : 'error'}
                variant="outlined"
                sx={{ height: 22, fontSize: '0.65rem' }}
              />
            )}
            {result.validityCompliant !== undefined && (
              <Chip
                label="תוקף"
                size="small"
                color={result.validityCompliant ? 'success' : 'error'}
                variant="outlined"
                sx={{ height: 22, fontSize: '0.65rem' }}
              />
            )}
            {result.additionalInsuredCompliant !== undefined && (
              <Chip
                label="מבוטח נוסף"
                size="small"
                color={result.additionalInsuredCompliant ? 'success' : 'error'}
                variant="outlined"
                sx={{ height: 22, fontSize: '0.65rem' }}
              />
            )}
          </Box>
          <Chip
            label={config.label}
            size="small"
            color={getStatusColor(result.status)}
          />
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        {result.foundPolicy ? (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              פרטי פוליסה שנמצאה
            </Typography>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              {result.foundPolicy.policyNumber && (
                <Grid item xs={6} md={3}>
                  <Typography variant="caption" color="text.secondary">
                    מספר פוליסה
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {result.foundPolicy.policyNumber}
                  </Typography>
                </Grid>
              )}
              {result.foundPolicy.coverageLimit != null && (
                <Grid item xs={6} md={3}>
                  <Typography variant="caption" color="text.secondary">
                    גבול אחריות
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    ₪{result.foundPolicy.coverageLimit.toLocaleString()}
                  </Typography>
                </Grid>
              )}
              {result.foundPolicy.deductible != null && (
                <Grid item xs={6} md={3}>
                  <Typography variant="caption" color="text.secondary">
                    השתתפות עצמית
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    ₪{result.foundPolicy.deductible.toLocaleString()}
                  </Typography>
                </Grid>
              )}
              {result.foundPolicy.effectiveDate && (
                <Grid item xs={6} md={3}>
                  <Typography variant="caption" color="text.secondary">
                    תחילת תוקף
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {result.foundPolicy.effectiveDate}
                  </Typography>
                </Grid>
              )}
              {result.foundPolicy.expirationDate && (
                <Grid item xs={6} md={3}>
                  <Typography variant="caption" color="text.secondary">
                    סוף תוקף
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {result.foundPolicy.expirationDate}
                  </Typography>
                </Grid>
              )}
              {result.foundPolicy.endorsements && result.foundPolicy.endorsements.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    הרחבות ({result.foundPolicy.endorsements.length})
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={0.5} mt={0.5}>
                    {result.foundPolicy.endorsements.map((end, idx) => (
                      <Chip key={idx} label={end} size="small" variant="outlined" />
                    ))}
                  </Box>
                </Grid>
              )}
            </Grid>
          </Box>
        ) : (
          <Alert severity="warning" sx={{ mb: 2 }}>
            פוליסה זו לא נמצאה באישור הביטוח
          </Alert>
        )}

        {/* Gaps */}
        {result.gaps && result.gaps.length > 0 && (
          <Box>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" color="error.main" gutterBottom>
              פערים שנמצאו ({result.gaps.length})
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
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                  <Typography variant="body2" fontWeight={600}>
                    {gap.descriptionHe}
                  </Typography>
                  <Chip
                    label={gap.severity === 'critical' ? 'קריטי' : gap.severity === 'major' ? 'משמעותי' : 'קל'}
                    size="small"
                    sx={{
                      backgroundColor: getSeverityColor(gap.severity),
                      color: 'white',
                      fontWeight: 600,
                    }}
                  />
                </Box>
                {(gap.required != null || gap.found != null) && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                    נדרש: {typeof gap.required === 'number' ? `₪${gap.required.toLocaleString()}` : gap.required || '—'}{' '}
                    | נמצא: {typeof gap.found === 'number' ? `₪${gap.found.toLocaleString()}` : gap.found || '—'}
                  </Typography>
                )}
                {gap.recommendationHe && (
                  <Typography variant="body2" color="primary.main" fontWeight={500}>
                    המלצה: {gap.recommendationHe}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        )}
      </AccordionDetails>
    </Accordion>
  );
}
