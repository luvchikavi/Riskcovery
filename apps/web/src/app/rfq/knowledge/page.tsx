'use client';

import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import {
  Box,
  Card,
  CardContent,
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
} from '@mui/material';
import { useEffect, useState } from 'react';

import { rfqApi, type InsuranceRequirement } from '@/lib/api';

const SECTORS = [
  { value: '', label: 'הכל', labelEn: 'All' },
  { value: 'CONSTRUCTION', label: 'בנייה', labelEn: 'Construction' },
  { value: 'TECHNOLOGY', label: 'טכנולוגיה', labelEn: 'Technology' },
  { value: 'MANUFACTURING', label: 'ייצור', labelEn: 'Manufacturing' },
  { value: 'RETAIL', label: 'קמעונאות', labelEn: 'Retail' },
  { value: 'HEALTHCARE', label: 'בריאות', labelEn: 'Healthcare' },
  { value: 'LOGISTICS', label: 'לוגיסטיקה', labelEn: 'Logistics' },
  { value: 'CONSULTING', label: 'ייעוץ', labelEn: 'Consulting' },
];

export default function KnowledgeBasePage() {
  const [requirements, setRequirements] = useState<InsuranceRequirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sector, setSector] = useState('');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const response = sector
          ? await rfqApi.knowledgeBase.getBySector(sector)
          : await rfqApi.knowledgeBase.getAll();
        if (response.success && response.data) {
          setRequirements(response.data);
        }
      } catch (err) {
        setError('Failed to load knowledge base');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [sector]);

  // Group requirements by sector
  const groupedRequirements = requirements.reduce<Record<string, InsuranceRequirement[]>>((acc, req) => {
    const sectorReqs = acc[req.sector] ?? [];
    sectorReqs.push(req);
    acc[req.sector] = sectorReqs;
    return acc;
  }, {});

  const getSectorLabel = (sectorValue: string) => {
    return SECTORS.find((s) => s.value === sectorValue)?.label || sectorValue;
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            מאגר ידע ביטוחי
          </Typography>
          <Typography color="text.secondary">Insurance Knowledge Base</Typography>
        </Box>
      </Box>

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

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Box>
          {Object.entries(groupedRequirements).map(([sectorKey, reqs]) => (
            <Accordion key={sectorKey} defaultExpanded={sector !== ''}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Typography variant="h6">{getSectorLabel(sectorKey)}</Typography>
                  <Chip label={`${reqs.length} פוליסות`} size="small" />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>סוג הביטוח</TableCell>
                        <TableCell>גבול אחריות מומלץ</TableCell>
                        <TableCell>סטטוס</TableCell>
                        <TableCell>הרחבות נפוצות</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reqs.map((req) => (
                        <TableRow key={req.id} hover>
                          <TableCell>
                            <Typography fontWeight="medium">{req.policyTypeHe}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {req.policyType}
                            </Typography>
                            {req.descriptionHe && (
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                {req.descriptionHe}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            ₪{req.recommendedLimit.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {req.isMandatory ? (
                              <Chip label="חובה" color="error" size="small" />
                            ) : (
                              <Chip label="מומלץ" variant="outlined" size="small" />
                            )}
                          </TableCell>
                          <TableCell>
                            <Box display="flex" flexWrap="wrap" gap={0.5}>
                              {req.commonEndorsements.length > 0 ? (
                                req.commonEndorsements.map((end, idx) => (
                                  <Chip key={idx} label={end} size="small" variant="outlined" />
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
              </AccordionDetails>
            </Accordion>
          ))}

          {Object.keys(groupedRequirements).length === 0 && (
            <Card>
              <CardContent>
                <Box textAlign="center" py={4}>
                  <Typography color="text.secondary">
                    לא נמצאו דרישות ביטוח
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          )}
        </Box>
      )}
    </Box>
  );
}
