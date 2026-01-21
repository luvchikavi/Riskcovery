'use client';

import {
  PictureAsPdf as PdfIcon,
  Description as DocxIcon,
  TableChart as XlsxIcon,
  Download as DownloadIcon,
  ArrowBack as ArrowBackIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
} from '@mui/material';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';

import {
  rfqApi,
  type Client,
  type QuestionnaireAnswers,
  type DocumentPreview,
} from '@/lib/api';

type DocumentFormat = 'pdf' | 'docx' | 'xlsx';

const RISK_COLORS = {
  LOW: 'success',
  MEDIUM: 'warning',
  HIGH: 'error',
} as const;

const RISK_LABELS = {
  LOW: 'סיכון נמוך',
  MEDIUM: 'סיכון בינוני',
  HIGH: 'סיכון גבוה',
};

export default function DocumentsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const clientId = params.clientId as string;

  const [client, setClient] = useState<Client | null>(null);
  const [preview, setPreview] = useState<DocumentPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [format, setFormat] = useState<DocumentFormat>('pdf');

  // Parse answers from URL if present
  const answers = useMemo(() => {
    const answersParam = searchParams.get('answers');
    if (answersParam) {
      try {
        return JSON.parse(decodeURIComponent(answersParam)) as QuestionnaireAnswers;
      } catch {
        return {};
      }
    }
    return {};
  }, [searchParams]);

  useEffect(() => {
    async function loadData() {
      try {
        // Load client
        const clientResponse = await rfqApi.clients.get(clientId);
        if (!clientResponse.success || !clientResponse.data) {
          setError('Client not found');
          setLoading(false);
          return;
        }
        setClient(clientResponse.data);

        // Load preview if we have answers
        if (Object.keys(answers).length > 0) {
          const previewResponse = await rfqApi.documents.preview(clientId, answers);
          if (previewResponse.success && previewResponse.data) {
            setPreview(previewResponse.data);
          }
        }
      } catch (err) {
        setError('Failed to load data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [clientId, answers]);

  const handleDownload = async () => {
    if (!client) return;

    setGenerating(true);
    setError(null);

    try {
      const blob = await rfqApi.documents.generate(clientId, answers, format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      a.href = url;
      a.download = `RFQ_${client.name.replace(/\s+/g, '_')}_${timestamp}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Failed to generate document');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !client) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || 'Client not found'}
        </Alert>
        <Button component={Link} href="/rfq/clients" variant="outlined" startIcon={<ArrowBackIcon />}>
          חזרה לרשימת לקוחות
        </Button>
      </Box>
    );
  }

  const hasAnswers = Object.keys(answers).length > 0;

  return (
    <Box>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link href="/rfq" style={{ textDecoration: 'none', color: 'inherit' }}>
          לוח בקרה
        </Link>
        <Link href="/rfq/clients" style={{ textDecoration: 'none', color: 'inherit' }}>
          לקוחות
        </Link>
        <Link href={`/rfq/clients/${client.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          {client.name}
        </Link>
        <Typography color="text.primary">יצירת מסמך</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            יצירת בקשה להצעת מחיר
          </Typography>
          <Typography color="text.secondary">
            Generate Request for Quotation - {client.name}
          </Typography>
        </Box>
        <Button
          component={Link}
          href={`/rfq/clients/${client.id}`}
          variant="outlined"
          startIcon={<ArrowBackIcon />}
        >
          חזרה ללקוח
        </Button>
      </Box>

      {!hasAnswers && (
        <Alert severity="info" sx={{ mb: 3 }}>
          לא נמצאו תשובות לשאלון. יש למלא את השאלון תחילה.
          <Button
            component={Link}
            href={`/rfq/questionnaire/${clientId}`}
            sx={{ ml: 2 }}
            size="small"
          >
            מילוי שאלון
          </Button>
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Preview */}
        {preview && (
          <>
            {/* Risk Summary */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        סיכום הערכת סיכונים
                      </Typography>
                      <Typography color="text.secondary">
                        Risk Assessment Summary
                      </Typography>
                    </Box>
                    <Box textAlign="center">
                      <Chip
                        icon={
                          preview.riskLevel === 'LOW' ? (
                            <CheckIcon />
                          ) : preview.riskLevel === 'HIGH' ? (
                            <ErrorIcon />
                          ) : (
                            <WarningIcon />
                          )
                        }
                        label={`${RISK_LABELS[preview.riskLevel]} - ${preview.riskScore}%`}
                        color={RISK_COLORS[preview.riskLevel]}
                        size="medium"
                      />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Recommendations Table */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    המלצות כיסוי ביטוחי
                  </Typography>
                  <Typography color="text.secondary" gutterBottom>
                    Insurance Coverage Recommendations
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>סוג הביטוח</TableCell>
                          <TableCell>גבול אחריות מומלץ</TableCell>
                          <TableCell>חובה</TableCell>
                          <TableCell>הרחבות נדרשות</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {preview.recommendations.map((rec) => (
                          <TableRow key={rec.policyType}>
                            <TableCell>
                              <Typography fontWeight="medium">
                                {rec.policyTypeHe}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {rec.policyType}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              ₪{rec.recommendedLimit.toLocaleString()}
                            </TableCell>
                            <TableCell>
                              {rec.isMandatory ? (
                                <Chip label="חובה" color="error" size="small" />
                              ) : (
                                <Chip label="מומלץ" variant="outlined" size="small" />
                              )}
                            </TableCell>
                            <TableCell>
                              <Box display="flex" flexWrap="wrap" gap={0.5}>
                                {rec.endorsements.length > 0 ? (
                                  rec.endorsements.map((end, idx) => (
                                    <Chip
                                      key={idx}
                                      label={end}
                                      size="small"
                                      variant="outlined"
                                    />
                                  ))
                                ) : (
                                  <Typography color="text.secondary">-</Typography>
                                )}
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {/* Summary */}
                  <Box mt={3} p={2} bgcolor="grey.50" borderRadius={1}>
                    <Grid container spacing={2}>
                      <Grid item xs={4}>
                        <Typography variant="body2" color="text.secondary">
                          סה&quot;כ פוליסות
                        </Typography>
                        <Typography variant="h6">
                          {preview.recommendations.length}
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="body2" color="text.secondary">
                          פוליסות חובה
                        </Typography>
                        <Typography variant="h6">
                          {preview.recommendations.filter((r) => r.isMandatory).length}
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="body2" color="text.secondary">
                          סה&quot;כ גבולות אחריות
                        </Typography>
                        <Typography variant="h6">
                          ₪{preview.recommendations
                            .reduce((sum, r) => sum + r.recommendedLimit, 0)
                            .toLocaleString()}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </>
        )}

        {/* Download Section */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                הורדת מסמך
              </Typography>
              <Typography color="text.secondary" gutterBottom>
                Select format and download
              </Typography>
              <Divider sx={{ my: 2 }} />

              <Box display="flex" flexDirection="column" alignItems="center" gap={3} py={2}>
                <ToggleButtonGroup
                  value={format}
                  exclusive
                  onChange={(_, newFormat) => newFormat && setFormat(newFormat)}
                  size="large"
                >
                  <ToggleButton value="pdf">
                    <Box display="flex" flexDirection="column" alignItems="center" px={2}>
                      <PdfIcon fontSize="large" color={format === 'pdf' ? 'primary' : 'inherit'} />
                      <Typography variant="caption">PDF</Typography>
                    </Box>
                  </ToggleButton>
                  <ToggleButton value="docx">
                    <Box display="flex" flexDirection="column" alignItems="center" px={2}>
                      <DocxIcon fontSize="large" color={format === 'docx' ? 'primary' : 'inherit'} />
                      <Typography variant="caption">Word</Typography>
                    </Box>
                  </ToggleButton>
                  <ToggleButton value="xlsx">
                    <Box display="flex" flexDirection="column" alignItems="center" px={2}>
                      <XlsxIcon fontSize="large" color={format === 'xlsx' ? 'primary' : 'inherit'} />
                      <Typography variant="caption">Excel</Typography>
                    </Box>
                  </ToggleButton>
                </ToggleButtonGroup>

                <Button
                  variant="contained"
                  size="large"
                  startIcon={generating ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
                  onClick={handleDownload}
                  disabled={!hasAnswers || generating}
                  sx={{ minWidth: 200 }}
                >
                  {generating ? 'מייצר...' : 'הורד מסמך'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
