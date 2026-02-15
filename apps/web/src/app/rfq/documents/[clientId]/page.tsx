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
  Extension as ExtensionIcon,
  Link as LinkIcon,
  Business as BusinessIcon,
  Star as StarIcon,
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';

import {
  rfqApi,
  type Client,
  type QuestionnaireAnswers,
  type DocumentPreview,
  type EnrichedRecommendationsResponse,
  type InsurerSuggestion,
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
  const [enriched, setEnriched] = useState<EnrichedRecommendationsResponse | null>(null);
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
          const [previewResponse, enrichedResponse] = await Promise.all([
            rfqApi.documents.preview(clientId, answers),
            rfqApi.products.getEnrichedRecommendations(clientResponse.data.sector, answers),
          ]);

          if (previewResponse.success && previewResponse.data) {
            setPreview(previewResponse.data);
          }
          if (enrichedResponse.success && enrichedResponse.data) {
            setEnriched(enrichedResponse.data);
          }
        }
      } catch (err: unknown) {
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
    } catch {
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
        <Button
          component={Link}
          href="/rfq/clients"
          variant="outlined"
          startIcon={<ArrowBackIcon />}
        >
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
        <Link
          href={`/rfq/clients/${client.id}`}
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
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
                      <Typography color="text.secondary">Risk Assessment Summary</Typography>
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

            {/* Enriched Recommendations */}
            {enriched && enriched.recommendations.length > 0 && (
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      המלצות כיסוי ביטוחי מורחבות
                    </Typography>
                    <Typography color="text.secondary" gutterBottom>
                      Enriched Insurance Coverage Recommendations
                    </Typography>
                    <Divider sx={{ my: 2 }} />

                    {enriched.recommendations.map((rec) => (
                      <Accordion key={rec.productCode} defaultExpanded={rec.isMandatory}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Box display="flex" alignItems="center" gap={2} width="100%">
                            <Box flexGrow={1}>
                              <Typography fontWeight="bold">{rec.productNameHe}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {rec.productNameEn}
                              </Typography>
                            </Box>
                            <Chip
                              label={
                                rec.isMandatory
                                  ? 'חובה'
                                  : rec.necessity === 'recommended'
                                    ? 'מומלץ'
                                    : 'אופציונלי'
                              }
                              size="small"
                              color={rec.isMandatory ? 'error' : 'warning'}
                            />
                            <Chip label={rec.coverageTrigger} size="small" variant="outlined" />
                            <Typography fontWeight="bold">
                              ₪{rec.recommendedLimit.toLocaleString()}
                            </Typography>
                          </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Grid container spacing={2}>
                            {/* Extensions */}
                            {rec.extensions.length > 0 && (
                              <Grid item xs={12} md={6}>
                                <Box display="flex" alignItems="center" gap={1} mb={1}>
                                  <ExtensionIcon fontSize="small" color="primary" />
                                  <Typography variant="subtitle2">
                                    הרחבות ({rec.extensions.length})
                                  </Typography>
                                </Box>
                                <Box display="flex" flexWrap="wrap" gap={0.5}>
                                  {rec.extensions.slice(0, 8).map((ext) => (
                                    <Tooltip key={ext.code} title={ext.nameEn}>
                                      <Chip
                                        label={`${ext.code} ${ext.nameHe}`}
                                        size="small"
                                        variant="outlined"
                                      />
                                    </Tooltip>
                                  ))}
                                  {rec.extensions.length > 8 && (
                                    <Chip
                                      label={`+${rec.extensions.length - 8} נוספים`}
                                      size="small"
                                      variant="outlined"
                                      color="info"
                                    />
                                  )}
                                </Box>
                              </Grid>
                            )}

                            {/* Related Products */}
                            {rec.relatedProducts.length > 0 && (
                              <Grid item xs={12} md={6}>
                                <Box display="flex" alignItems="center" gap={1} mb={1}>
                                  <LinkIcon fontSize="small" color="info" />
                                  <Typography variant="subtitle2">קשרים בין-פוליסתיים</Typography>
                                </Box>
                                <Box display="flex" flexWrap="wrap" gap={0.5}>
                                  {rec.relatedProducts.map((rel) => (
                                    <Chip
                                      key={rel.productCode}
                                      label={`${rel.productNameHe} (${rel.relationType})`}
                                      size="small"
                                      color="info"
                                      variant="outlined"
                                    />
                                  ))}
                                </Box>
                              </Grid>
                            )}

                            {/* Adjustment reason */}
                            {rec.adjustmentReason && (
                              <Grid item xs={12}>
                                <Typography variant="caption" color="text.secondary">
                                  כללים שהופעלו: {rec.adjustmentReason}
                                </Typography>
                              </Grid>
                            )}

                            {/* Exclusion count */}
                            {rec.exclusionCount > 0 && (
                              <Grid item xs={12}>
                                <Typography variant="caption" color="text.secondary">
                                  {rec.exclusionCount} חריגים | צפה בפרטים מלאים ב
                                  <Link
                                    href={`/rfq/knowledge/${rec.productCode}`}
                                    style={{ marginRight: 4 }}
                                  >
                                    קטלוג המוצרים
                                  </Link>
                                </Typography>
                              </Grid>
                            )}

                            {/* Insurer Suggestions */}
                            {enriched.insurerSuggestions?.[rec.productCode] &&
                              enriched.insurerSuggestions[rec.productCode]!.length > 0 && (
                                <Grid item xs={12}>
                                  <Divider sx={{ my: 1 }} />
                                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                                    <BusinessIcon fontSize="small" color="secondary" />
                                    <Typography variant="subtitle2">מבטחים מומלצים</Typography>
                                  </Box>
                                  <Box display="flex" gap={1.5} flexWrap="wrap">
                                    {enriched.insurerSuggestions[rec.productCode]!.map(
                                      (ins, idx) => (
                                        <Card
                                          key={ins.insurerCode}
                                          variant="outlined"
                                          sx={{ minWidth: 180, flex: '1 1 180px', maxWidth: 280 }}
                                        >
                                          <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                                            <Box
                                              display="flex"
                                              alignItems="center"
                                              gap={0.5}
                                              mb={0.5}
                                            >
                                              {idx === 0 && (
                                                <StarIcon sx={{ fontSize: 14, color: '#FFB800' }} />
                                              )}
                                              <Typography variant="body2" fontWeight={600}>
                                                {ins.insurerNameHe}
                                              </Typography>
                                            </Box>
                                            <Box display="flex" gap={0.5} mb={0.5} flexWrap="wrap">
                                              <Chip
                                                label={ins.bitStandard || 'N/A'}
                                                size="small"
                                                variant="outlined"
                                                sx={{ height: 20, fontSize: '0.65rem' }}
                                              />
                                              <Chip
                                                label={`${ins.extensionCount} הרחבות`}
                                                size="small"
                                                color="success"
                                                variant="outlined"
                                                sx={{ height: 20, fontSize: '0.65rem' }}
                                              />
                                            </Box>
                                            {ins.strengths.slice(0, 1).map((s, i) => (
                                              <Typography
                                                key={i}
                                                variant="caption"
                                                sx={{
                                                  color: '#34C759',
                                                  display: 'block',
                                                  lineHeight: 1.3,
                                                }}
                                              >
                                                + {s}
                                              </Typography>
                                            ))}
                                            <Box mt={0.5}>
                                              <Link
                                                href={`/insurers/${ins.insurerCode}`}
                                                style={{ fontSize: '0.7rem' }}
                                              >
                                                פרטים מלאים
                                              </Link>
                                            </Box>
                                          </CardContent>
                                        </Card>
                                      )
                                    )}
                                  </Box>
                                </Grid>
                              )}
                          </Grid>
                        </AccordionDetails>
                      </Accordion>
                    ))}

                    {/* Coverage Gaps */}
                    {enriched.coverageGaps.length > 0 && (
                      <Box mt={3}>
                        <Alert severity="warning" sx={{ mb: 2 }}>
                          <Typography fontWeight="bold" gutterBottom>
                            פערי כיסוי ({enriched.coverageGaps.length})
                          </Typography>
                          {enriched.coverageGaps.map((gap) => (
                            <Box key={gap.type} mb={1}>
                              <Typography variant="body2" fontWeight="medium">
                                {gap.nameHe}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {gap.descriptionHe}
                              </Typography>
                            </Box>
                          ))}
                        </Alert>
                      </Box>
                    )}

                    {/* Summary */}
                    <Box mt={3} p={2} bgcolor="grey.50" borderRadius={1}>
                      <Grid container spacing={2}>
                        <Grid item xs={3}>
                          <Typography variant="body2" color="text.secondary">
                            סה&quot;כ מוצרים
                          </Typography>
                          <Typography variant="h6">{enriched.recommendations.length}</Typography>
                        </Grid>
                        <Grid item xs={3}>
                          <Typography variant="body2" color="text.secondary">
                            חובה
                          </Typography>
                          <Typography variant="h6">
                            {enriched.recommendations.filter((r) => r.isMandatory).length}
                          </Typography>
                        </Grid>
                        <Grid item xs={3}>
                          <Typography variant="body2" color="text.secondary">
                            סה&quot;כ גבולות
                          </Typography>
                          <Typography variant="h6">
                            ₪
                            {enriched.recommendations
                              .reduce((sum, r) => sum + r.recommendedLimit, 0)
                              .toLocaleString()}
                          </Typography>
                        </Grid>
                        <Grid item xs={3}>
                          <Typography variant="body2" color="text.secondary">
                            פערי כיסוי
                          </Typography>
                          <Typography variant="h6" color="warning.main">
                            {enriched.coverageGaps.length}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Legacy Recommendations Table (fallback) */}
            {(!enriched || enriched.recommendations.length === 0) &&
              preview.recommendations.length > 0 && (
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        המלצות כיסוי ביטוחי
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
                              <TableCell>כללים שהופעלו</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {preview.recommendations.map((rec) => (
                              <TableRow key={rec.policyType}>
                                <TableCell>
                                  <Typography fontWeight="medium">{rec.policyTypeHe}</Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {rec.policyType}
                                  </Typography>
                                </TableCell>
                                <TableCell>₪{rec.recommendedLimit.toLocaleString()}</TableCell>
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
                                <TableCell>
                                  {rec.adjustmentReason ? (
                                    <Box display="flex" flexWrap="wrap" gap={0.5}>
                                      {rec.adjustmentReason.split(', ').map((rule, idx) => (
                                        <Chip
                                          key={idx}
                                          label={rule}
                                          size="small"
                                          color="info"
                                          variant="outlined"
                                        />
                                      ))}
                                    </Box>
                                  ) : (
                                    <Typography variant="caption" color="text.secondary">
                                      ברירת מחדל
                                    </Typography>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Grid>
              )}
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
                      <DocxIcon
                        fontSize="large"
                        color={format === 'docx' ? 'primary' : 'inherit'}
                      />
                      <Typography variant="caption">Word</Typography>
                    </Box>
                  </ToggleButton>
                  <ToggleButton value="xlsx">
                    <Box display="flex" flexDirection="column" alignItems="center" px={2}>
                      <XlsxIcon
                        fontSize="large"
                        color={format === 'xlsx' ? 'primary' : 'inherit'}
                      />
                      <Typography variant="caption">Excel</Typography>
                    </Box>
                  </ToggleButton>
                </ToggleButtonGroup>

                <Button
                  variant="contained"
                  size="large"
                  startIcon={
                    generating ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />
                  }
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
