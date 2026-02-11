'use client';

import {
  CheckCircle as CheckIcon,
  Cancel as MissingIcon,
  Remove as DashIcon,
} from '@mui/icons-material';
import {
  Box,
  Card,
  CardContent,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
} from '@mui/material';
import { useEffect, useState } from 'react';

import { api, type InsurerComparison, type ExtensionMatrixRow } from '@/lib/api';
import { EmptyState } from '@/components/EmptyState';

const PRODUCT_TYPES = [
  { code: 'FIRE_CONSEQUENTIAL_LOSS', label: 'אש ואובדן רווחים' },
  { code: 'GENERAL_LIABILITY', label: 'צד שלישי' },
  { code: 'EMPLOYER_LIABILITY', label: 'חבות מעבידים' },
  { code: 'PROFESSIONAL_INDEMNITY', label: 'אחריות מקצועית' },
  { code: 'PRODUCT_LIABILITY', label: 'חבות מוצר' },
  { code: 'CONTRACTOR_ALL_RISKS', label: 'כל הסיכונים קבלנים' },
  { code: 'ERECTION_ALL_RISKS', label: 'כל הסיכונים הרכבה' },
  { code: 'ELECTRONIC_EQUIPMENT', label: 'ציוד אלקטרוני' },
  { code: 'MACHINERY_BREAKDOWN', label: 'שבר מכני' },
  { code: 'CYBER_LIABILITY', label: 'סייבר' },
  { code: 'D_AND_O', label: 'נושאי משרה' },
  { code: 'ENVIRONMENTAL_LIABILITY', label: 'אחריות סביבתית' },
];

export default function ComparePage() {
  const [selectedProduct, setSelectedProduct] = useState('');
  const [comparisons, setComparisons] = useState<InsurerComparison[]>([]);
  const [extensionMatrix, setExtensionMatrix] = useState<ExtensionMatrixRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedProduct) return;
    setLoading(true);

    Promise.all([
      api.get<InsurerComparison[]>(`/insurers/compare/${selectedProduct}`),
      api.get<ExtensionMatrixRow[]>(`/insurers/compare/${selectedProduct}/extensions`),
    ])
      .then(([compRes, matrixRes]) => {
        if (compRes.success && compRes.data) setComparisons(compRes.data);
        if (matrixRes.success && matrixRes.data) setExtensionMatrix(matrixRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedProduct]);

  const insurerCodes = comparisons.map((c) => c.insurer.code);

  return (
    <Box>
      <Box mb={4}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: '#1D1D1F', mb: 0.5 }}>
          השוואת פוליסות
        </Typography>
        <Typography variant="body2" sx={{ color: '#86868B' }}>
          Compare policies across all insurers for a specific product type
        </Typography>
      </Box>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <FormControl fullWidth>
            <InputLabel>בחר סוג פוליסה</InputLabel>
            <Select
              value={selectedProduct}
              label="בחר סוג פוליסה"
              onChange={(e) => setSelectedProduct(e.target.value)}
            >
              {PRODUCT_TYPES.map((p) => (
                <MenuItem key={p.code} value={p.code}>
                  {p.label} ({p.code.replace(/_/g, ' ')})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </CardContent>
      </Card>

      {loading && <LinearProgress sx={{ mb: 3 }} />}

      {!selectedProduct && !loading && (
        <EmptyState
          title="בחר סוג פוליסה להשוואה"
          description="Select a product type above to compare across all insurers"
        />
      )}

      {/* Insurer Summary Cards */}
      {comparisons.length > 0 && (
        <>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            סיכום לפי מבטח
          </Typography>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {comparisons.map((comp) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={comp.insurer.code}>
                <Card>
                  <CardContent sx={{ p: 2 }}>
                    <Typography sx={{ fontWeight: 600, mb: 1 }}>{comp.insurer.nameHe}</Typography>
                    <Box display="flex" gap={0.5} flexWrap="wrap" mb={1}>
                      <Chip
                        label={comp.policy?.bitStandard || 'N/A'}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        label={`${comp.extensions?.length || 0} הרחבות`}
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                    </Box>
                    {comp.policy?.strengths && (comp.policy.strengths as string[]).slice(0, 2).map((s, i) => (
                      <Typography key={i} variant="caption" sx={{ color: '#34C759', display: 'block' }}>
                        + {s}
                      </Typography>
                    ))}
                    {comp.policy?.weaknesses && (comp.policy.weaknesses as string[]).slice(0, 2).map((w, i) => (
                      <Typography key={i} variant="caption" sx={{ color: '#FF3B30', display: 'block' }}>
                        - {w}
                      </Typography>
                    ))}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Extension Matrix */}
          {extensionMatrix.length > 0 && (
            <>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                מטריצת הרחבות
              </Typography>
              <Card>
                <TableContainer sx={{ maxHeight: 600 }}>
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, minWidth: 200 }}>הרחבה</TableCell>
                        {insurerCodes.map((code) => {
                          const comp = comparisons.find((c) => c.insurer.code === code);
                          return (
                            <TableCell key={code} align="center" sx={{ fontWeight: 600, minWidth: 80 }}>
                              {comp?.insurer.nameHe?.slice(0, 6) || code}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {extensionMatrix.map((row) => (
                        <TableRow key={row.code} hover>
                          <TableCell>
                            <Typography variant="caption" sx={{ fontWeight: 500 }}>
                              {row.code} - {row.nameHe}
                            </Typography>
                          </TableCell>
                          {insurerCodes.map((code) => {
                            const cell = row.insurers?.[code];
                            return (
                              <TableCell key={code} align="center">
                                {cell?.has ? (
                                  <CheckIcon sx={{ fontSize: 18, color: '#34C759' }} />
                                ) : cell === undefined ? (
                                  <DashIcon sx={{ fontSize: 18, color: '#86868B' }} />
                                ) : (
                                  <MissingIcon sx={{ fontSize: 18, color: '#FF3B30' }} />
                                )}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>
            </>
          )}
        </>
      )}
    </Box>
  );
}
