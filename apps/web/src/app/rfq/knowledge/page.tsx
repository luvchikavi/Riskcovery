'use client';

import {
  ExpandMore as ExpandMoreIcon,
  Security as SecurityIcon,
  Warning as WarningIcon,
  OpenInNew as OpenInNewIcon,
} from '@mui/icons-material';
import {
  Box,
  Card,
  CardContent,
  CardActionArea,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Tabs,
  Tab,
  Tooltip,
} from '@mui/material';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import {
  rfqApi,
  type InsuranceProduct,
  type SectorMatrix,
} from '@/lib/api';

const SECTORS = [
  { value: '', label: 'הכל', labelEn: 'All' },
  { value: 'MANUFACTURING', label: 'ייצור', labelEn: 'Manufacturing' },
  { value: 'CONSTRUCTION', label: 'בנייה', labelEn: 'Construction' },
  { value: 'TECHNOLOGY', label: 'טכנולוגיה', labelEn: 'Technology' },
  { value: 'RETAIL', label: 'קמעונאות', labelEn: 'Retail' },
  { value: 'HEALTHCARE', label: 'בריאות', labelEn: 'Healthcare' },
  { value: 'LOGISTICS', label: 'לוגיסטיקה', labelEn: 'Logistics' },
  { value: 'CONSULTING', label: 'ייעוץ', labelEn: 'Consulting' },
  { value: 'FINANCIAL_SERVICES', label: 'שירותים פיננסיים', labelEn: 'Financial Services' },
  { value: 'AGRICULTURE', label: 'חקלאות', labelEn: 'Agriculture' },
  { value: 'REAL_ESTATE', label: 'נדל"ן', labelEn: 'Real Estate' },
];

const CATEGORY_COLORS: Record<string, 'primary' | 'secondary' | 'success' | 'warning' | 'info'> = {
  property: 'primary',
  liability: 'secondary',
  financial: 'warning',
  engineering: 'info',
};

const CATEGORY_LABELS: Record<string, { he: string; en: string }> = {
  property: { he: 'רכוש', en: 'Property' },
  liability: { he: 'אחריות', en: 'Liability' },
  financial: { he: 'פיננסי', en: 'Financial' },
  engineering: { he: 'הנדסי', en: 'Engineering' },
};

const NECESSITY_LABELS: Record<string, { he: string; color: 'error' | 'warning' | 'default' }> = {
  mandatory: { he: 'חובה', color: 'error' },
  recommended: { he: 'מומלץ', color: 'warning' },
  optional: { he: 'אופציונלי', color: 'default' },
};

export default function KnowledgeBasePage() {
  const [products, setProducts] = useState<InsuranceProduct[]>([]);
  const [sectorMatrix, setSectorMatrix] = useState<SectorMatrix | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sector, setSector] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        if (sector) {
          const response = await rfqApi.products.getBySector(sector);
          if (response.success && response.data) {
            setProducts(response.data);
          }
        } else {
          const response = await rfqApi.products.list();
          if (response.success && response.data) {
            setProducts(response.data);
          }
        }

        // Load sector matrix for the matrix tab
        if (activeTab === 1 && !sectorMatrix) {
          const matrixResponse = await rfqApi.products.getSectorMatrix();
          if (matrixResponse.success && matrixResponse.data) {
            setSectorMatrix(matrixResponse.data);
          }
        }
      } catch (err) {
        setError('Failed to load product catalog');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [sector, activeTab]);

  const getSectorLabel = (sectorValue: string) => {
    return SECTORS.find((s) => s.value === sectorValue)?.label || sectorValue;
  };

  // Group products by category
  const groupedProducts = products.reduce<Record<string, InsuranceProduct[]>>((acc, p) => {
    const cat = p.category || 'other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(p);
    return acc;
  }, {});

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            קטלוג מוצרי ביטוח
          </Typography>
          <Typography color="text.secondary">
            Insurance Product Catalog - 12 BIT Standard Policies
          </Typography>
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
          <Tab label="קטלוג מוצרים" />
          <Tab label="מטריצת ענפים" />
          <Tab label="פערי כיסוי" />
        </Tabs>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Tab 0: Product Catalog */}
      {activeTab === 0 && (
        <>
          {/* Filters */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>סינון לפי ענף</InputLabel>
                <Select
                  value={sector}
                  label="סינון לפי ענף"
                  onChange={(e) => setSector(e.target.value)}
                >
                  {SECTORS.map((s) => (
                    <MenuItem key={s.value} value={s.value}>
                      {s.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </CardContent>
          </Card>

          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : (
            <Box>
              {Object.entries(groupedProducts).map(([category, categoryProducts]) => (
                <Accordion key={category} defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Chip
                        label={CATEGORY_LABELS[category]?.he || category}
                        color={CATEGORY_COLORS[category] || 'default'}
                        size="small"
                      />
                      <Typography variant="h6">
                        {CATEGORY_LABELS[category]?.en || category}
                      </Typography>
                      <Chip label={`${categoryProducts.length} מוצרים`} size="small" variant="outlined" />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      {categoryProducts.map((product) => (
                        <Grid item xs={12} md={6} lg={4} key={product.code}>
                          <Card variant="outlined" sx={{ height: '100%' }}>
                            <CardActionArea
                              component={Link}
                              href={`/rfq/knowledge/${product.code}`}
                              sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                            >
                              <CardContent sx={{ flexGrow: 1 }}>
                                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                                  <Box>
                                    <Typography variant="subtitle1" fontWeight="bold">
                                      {product.nameHe}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      {product.nameEn}
                                    </Typography>
                                  </Box>
                                  <OpenInNewIcon fontSize="small" color="action" />
                                </Box>

                                <Box display="flex" gap={0.5} flexWrap="wrap" mb={1}>
                                  <Chip
                                    label={product.coverageTrigger}
                                    size="small"
                                    variant="outlined"
                                  />
                                  {product.necessity && (
                                    <Chip
                                      label={NECESSITY_LABELS[product.necessity]?.he || product.necessity}
                                      size="small"
                                      color={NECESSITY_LABELS[product.necessity]?.color || 'default'}
                                    />
                                  )}
                                </Box>

                                {product.descriptionHe && (
                                  <Typography variant="body2" color="text.secondary" sx={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                  }}>
                                    {product.descriptionHe}
                                  </Typography>
                                )}

                                <Box display="flex" gap={1} mt={1}>
                                  {product.insurer && (
                                    <Typography variant="caption" color="text.secondary">
                                      {product.insurer}
                                    </Typography>
                                  )}
                                  {product.bitStandard && (
                                    <Typography variant="caption" color="text.secondary">
                                      | {product.bitStandard}
                                    </Typography>
                                  )}
                                </Box>
                              </CardContent>
                            </CardActionArea>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              ))}

              {products.length === 0 && (
                <Card>
                  <CardContent>
                    <Box textAlign="center" py={4}>
                      <Typography color="text.secondary">
                        לא נמצאו מוצרי ביטוח
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              )}
            </Box>
          )}
        </>
      )}

      {/* Tab 1: Sector Matrix */}
      {activeTab === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              מטריצת ענף ← מוצר
            </Typography>
            <Typography color="text.secondary" gutterBottom>
              Industry → Product Matrix
            </Typography>

            {loading ? (
              <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress />
              </Box>
            ) : sectorMatrix ? (
              <TableContainer sx={{ overflowX: 'auto' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold', minWidth: 140, position: 'sticky', left: 0, bgcolor: 'background.paper', zIndex: 1 }}>
                        ענף
                      </TableCell>
                      {products.map((p) => (
                        <TableCell key={p.code} align="center" sx={{ minWidth: 80, fontSize: '0.7rem' }}>
                          <Tooltip title={p.nameHe}>
                            <span>{p.nameEn.split(' ').slice(0, 2).join(' ')}</span>
                          </Tooltip>
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(sectorMatrix).map(([sectorKey, items]) => (
                      <TableRow key={sectorKey} hover>
                        <TableCell sx={{ fontWeight: 'bold', position: 'sticky', left: 0, bgcolor: 'background.paper', zIndex: 1 }}>
                          {getSectorLabel(sectorKey)}
                        </TableCell>
                        {products.map((p) => {
                          const mapping = items.find((i) => i.product.code === p.code);
                          return (
                            <TableCell key={p.code} align="center">
                              {mapping ? (
                                <Chip
                                  label={mapping.necessity === 'mandatory' ? 'M' : 'R'}
                                  size="small"
                                  color={mapping.necessity === 'mandatory' ? 'error' : 'warning'}
                                  sx={{ minWidth: 32, height: 24 }}
                                />
                              ) : (
                                <Typography color="text.disabled">-</Typography>
                              )}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography color="text.secondary">No data available</Typography>
            )}

            <Box mt={2} display="flex" gap={2}>
              <Chip label="M = חובה / Mandatory" size="small" color="error" />
              <Chip label="R = מומלץ / Recommended" size="small" color="warning" />
              <Typography variant="caption" color="text.secondary">- = לא נדרש</Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Tab 2: Coverage Gaps */}
      {activeTab === 2 && (
        <Box>
          <Alert severity="info" sx={{ mb: 3 }}>
            הכיסויים הבאים אינם מכוסים על ידי 12 הפוליסות התקניות (BIT) ודורשים פוליסות נפרדות.
          </Alert>

          <Grid container spacing={2}>
            {[
              { type: 'E&O', nameHe: 'אחריות מקצועית', nameEn: 'Professional Liability', icon: <SecurityIcon />, desc: 'לא מכוסה באף פוליסת BIT תקנית. נדרשת לייעוץ, טכנולוגיה, שירותים פיננסיים.' },
              { type: 'D&O', nameHe: 'אחריות נושאי משרה', nameEn: 'Directors & Officers', icon: <SecurityIcon />, desc: 'נדרשת לחברות ציבוריות ולחברות גדולות עם דירקטוריון.' },
              { type: 'Cyber', nameHe: 'ביטוח סייבר', nameEn: 'Cyber Insurance', icon: <WarningIcon />, desc: 'ציוד אלקטרוני מכסה נזק פיזי בלבד. אחריות סייבר ודליפת מידע דורשים כיסוי נפרד.' },
              { type: 'Environmental', nameHe: 'אחריות סביבתית', nameEn: 'Environmental Liability', icon: <WarningIcon />, desc: 'רק זיהום פתאומי מכוסה תחת צד שלישי. זיהום הדרגתי דורש פוליסה נפרדת.' },
              { type: 'Marine', nameHe: 'ביטוח ימי', nameEn: 'Marine Insurance', icon: <SecurityIcon />, desc: 'מוחרג במפורש ממספר פוליסות BIT. נדרש ביטוח ימי נפרד.' },
              { type: 'Motor', nameHe: 'ביטוח רכב', nameEn: 'Motor Vehicle', icon: <SecurityIcon />, desc: 'מוחרג מפוליסות אחריות. נדרש ביטוח רכב חובה + מקיף.' },
            ].map((gap) => (
              <Grid item xs={12} md={6} key={gap.type}>
                <Card variant="outlined">
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      {gap.icon}
                      <Typography variant="subtitle1" fontWeight="bold">
                        {gap.nameHe}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {gap.nameEn}
                    </Typography>
                    <Typography variant="body2">
                      {gap.desc}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
}
