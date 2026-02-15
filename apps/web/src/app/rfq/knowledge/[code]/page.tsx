'use client';

import {
  ArrowBack as ArrowBackIcon,
  Extension as ExtensionIcon,
  Block as BlockIcon,
  Link as LinkIcon,
  KeyboardArrowDown,
  KeyboardArrowUp,
} from '@mui/icons-material';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Collapse,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Divider,
  Grid,
} from '@mui/material';
import NextLink from 'next/link';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import {
  rfqApi,
  type InsuranceProduct,
  type PolicyExtension,
  type PolicyExclusion,
  type CrossPolicyRelation,
} from '@/lib/api';

const CATEGORY_LABELS: Record<string, { he: string; en: string }> = {
  property: { he: 'רכוש', en: 'Property' },
  liability: { he: 'אחריות', en: 'Liability' },
  financial: { he: 'פיננסי', en: 'Financial' },
  engineering: { he: 'הנדסי', en: 'Engineering' },
};

const RELATION_TYPE_LABELS: Record<string, { he: string; color: 'primary' | 'secondary' | 'info' }> = {
  complementary: { he: 'משלים', color: 'primary' },
  bundled: { he: 'משולב', color: 'secondary' },
  residual: { he: 'שיורי', color: 'info' },
};

export default function ProductDetailPage() {
  const params = useParams();
  const code = params.code as string;

  const [product, setProduct] = useState<InsuranceProduct | null>(null);
  const [extensions, setExtensions] = useState<PolicyExtension[]>([]);
  const [exclusions, setExclusions] = useState<PolicyExclusion[]>([]);
  const [relations, setRelations] = useState<CrossPolicyRelation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [expandedExt, setExpandedExt] = useState<string | null>(null);
  const [expandedExcl, setExpandedExcl] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [productRes, extRes, exclRes, relRes] = await Promise.all([
          rfqApi.products.getByCode(code),
          rfqApi.products.getExtensions(code),
          rfqApi.products.getExclusions(code),
          rfqApi.products.getRelations(code),
        ]);

        if (productRes.success && productRes.data) {
          setProduct(productRes.data);
        } else {
          setError('Product not found');
        }
        if (extRes.success && extRes.data) setExtensions(extRes.data);
        if (exclRes.success && exclRes.data) setExclusions(exclRes.data);
        if (relRes.success && relRes.data) setRelations(relRes.data);
      } catch (err) {
        setError('Failed to load product');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [code]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !product) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 3 }}>{error || 'Product not found'}</Alert>
        <Button component={NextLink} href="/rfq/knowledge" variant="outlined" startIcon={<ArrowBackIcon />}>
          חזרה לקטלוג
        </Button>
      </Box>
    );
  }

  // Group extensions by chapter
  const extensionsByChapter = extensions.reduce<Record<string, PolicyExtension[]>>((acc, ext) => {
    const chapter = ext.chapterCode || 'general';
    if (!acc[chapter]) acc[chapter] = [];
    acc[chapter].push(ext);
    return acc;
  }, {});

  return (
    <Box>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <NextLink href="/rfq" style={{ textDecoration: 'none', color: 'inherit' }}>
          לוח בקרה
        </NextLink>
        <NextLink href="/rfq/knowledge" style={{ textDecoration: 'none', color: 'inherit' }}>
          קטלוג מוצרים
        </NextLink>
        <Typography color="text.primary">{product.nameHe}</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {product.nameHe}
          </Typography>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {product.nameEn}
          </Typography>
          <Box display="flex" gap={1} flexWrap="wrap">
            <Chip label={CATEGORY_LABELS[product.category]?.he || product.category} color="primary" />
            <Chip label={product.coverageTrigger} variant="outlined" />
            {product.insurer && <Chip label={product.insurer} variant="outlined" />}
            {product.bitStandard && <Chip label={product.bitStandard} variant="outlined" />}
          </Box>
        </Box>
        <Button
          component={NextLink}
          href="/rfq/knowledge"
          variant="outlined"
          startIcon={<ArrowBackIcon />}
        >
          חזרה לקטלוג
        </Button>
      </Box>

      {/* Overview Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                תיאור
              </Typography>
              <Typography gutterBottom>{product.descriptionHe}</Typography>
              <Typography color="text.secondary">{product.description}</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box display="flex" flexDirection="column" gap={2}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    מבנה הפוליסה
                  </Typography>
                  {(product.structure as { chapters?: string[] })?.chapters?.map((ch: string, i: number) => (
                    <Typography key={i} variant="body2">{ch}</Typography>
                  ))}
                </Box>
                <Divider />
                <Box display="flex" gap={2}>
                  <Box textAlign="center">
                    <Typography variant="h5" color="primary">{extensions.length}</Typography>
                    <Typography variant="caption">הרחבות</Typography>
                  </Box>
                  <Box textAlign="center">
                    <Typography variant="h5" color="error">{exclusions.length}</Typography>
                    <Typography variant="caption">חריגים</Typography>
                  </Box>
                  <Box textAlign="center">
                    <Typography variant="h5" color="info.main">{relations.length}</Typography>
                    <Typography variant="caption">קשרים</Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
          <Tab icon={<ExtensionIcon />} iconPosition="start" label={`הרחבות (${extensions.length})`} />
          <Tab icon={<BlockIcon />} iconPosition="start" label={`חריגים (${exclusions.length})`} />
          <Tab icon={<LinkIcon />} iconPosition="start" label={`קשרים (${relations.length})`} />
        </Tabs>
      </Box>

      {/* Extensions Tab */}
      {activeTab === 0 && (
        <Box>
          {Object.entries(extensionsByChapter).map(([chapter, chapterExts]) => (
            <Card key={chapter} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  {chapter === 'general' ? 'הרחבות כלליות' : `פרק ${chapter}`}
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell padding="checkbox" />
                        <TableCell>קוד</TableCell>
                        <TableCell>שם (עברית)</TableCell>
                        <TableCell>שם (אנגלית)</TableCell>
                        <TableCell>גבול ברירת מחדל</TableCell>
                        <TableCell>סוג</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {chapterExts.map((ext) => {
                        const isExpanded = expandedExt === ext.id;
                        return (
                          <React.Fragment key={ext.id}>
                            <TableRow
                              hover
                              onClick={() => setExpandedExt(isExpanded ? null : ext.id)}
                              sx={{ cursor: 'pointer', '& > *': { borderBottom: isExpanded ? 'unset' : undefined } }}
                            >
                              <TableCell padding="checkbox">
                                <IconButton size="small">
                                  {isExpanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                                </IconButton>
                              </TableCell>
                              <TableCell>
                                <Chip label={ext.code} size="small" variant="outlined" />
                              </TableCell>
                              <TableCell>
                                <Typography fontWeight="medium">{ext.nameHe}</Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" color="text.secondary">{ext.nameEn}</Typography>
                              </TableCell>
                              <TableCell>
                                {ext.defaultLimit ? `₪${Number(ext.defaultLimit).toLocaleString()}` : '-'}
                              </TableCell>
                              <TableCell>
                                {ext.isFirstLoss && (
                                  <Chip label="First Loss" size="small" color="info" variant="outlined" />
                                )}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell colSpan={6} sx={{ py: 0, px: 0 }}>
                                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                  <Box sx={{ py: 2, px: 3, bgcolor: 'grey.50', borderInlineStart: '4px solid', borderColor: 'primary.main' }}>
                                    <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                                      תיאור
                                    </Typography>
                                    <Typography variant="body2" sx={{ whiteSpace: 'pre-line', mb: 2 }}>
                                      {ext.description || 'אין תיאור זמין'}
                                    </Typography>
                                    <Box display="flex" gap={4} flexWrap="wrap">
                                      {ext.chapterCode && (
                                        <Box>
                                          <Typography variant="caption" color="text.secondary">פרק</Typography>
                                          <Typography variant="body2">{ext.chapterCode}</Typography>
                                        </Box>
                                      )}
                                      {ext.defaultLimit && (
                                        <Box>
                                          <Typography variant="caption" color="text.secondary">גבול ברירת מחדל</Typography>
                                          <Typography variant="body2">₪{Number(ext.defaultLimit).toLocaleString()}</Typography>
                                        </Box>
                                      )}
                                      <Box>
                                        <Typography variant="caption" color="text.secondary">סוג</Typography>
                                        <Typography variant="body2">
                                          {ext.isFirstLoss ? 'First Loss – כיסוי עד גבול הביטוח ללא יחס ביטוח חסר' : 'כיסוי רגיל'}
                                        </Typography>
                                      </Box>
                                    </Box>
                                  </Box>
                                </Collapse>
                              </TableCell>
                            </TableRow>
                          </React.Fragment>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          ))}

          {extensions.length === 0 && (
            <Alert severity="info">אין הרחבות זמינות למוצר זה</Alert>
          )}
        </Box>
      )}

      {/* Exclusions Tab */}
      {activeTab === 1 && (
        <Card>
          <CardContent>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox" />
                    <TableCell>חריג (עברית)</TableCell>
                    <TableCell>חריג (אנגלית)</TableCell>
                    <TableCell>סוג</TableCell>
                    <TableCell>פרק</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {exclusions.map((excl) => {
                    const isExpanded = expandedExcl === excl.id;
                    return (
                      <React.Fragment key={excl.id}>
                        <TableRow
                          hover
                          onClick={() => setExpandedExcl(isExpanded ? null : excl.id)}
                          sx={{ cursor: 'pointer', '& > *': { borderBottom: isExpanded ? 'unset' : undefined } }}
                        >
                          <TableCell padding="checkbox">
                            <IconButton size="small">
                              {isExpanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                            </IconButton>
                          </TableCell>
                          <TableCell>
                            <Typography fontWeight="medium">{excl.nameHe}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">{excl.nameEn}</Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={excl.isGeneral ? 'כללי' : 'ספציפי'}
                              size="small"
                              color={excl.isGeneral ? 'default' : 'info'}
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            {excl.chapterCode || '-'}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell colSpan={5} sx={{ py: 0, px: 0 }}>
                            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                              <Box sx={{ py: 2, px: 3, bgcolor: 'grey.50', borderInlineStart: '4px solid', borderColor: 'error.main' }}>
                                <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                                  תיאור
                                </Typography>
                                <Typography variant="body2" sx={{ whiteSpace: 'pre-line', mb: 2 }}>
                                  {excl.description || 'אין תיאור זמין'}
                                </Typography>
                                <Box display="flex" gap={4} flexWrap="wrap">
                                  <Box>
                                    <Typography variant="caption" color="text.secondary">סוג חריג</Typography>
                                    <Typography variant="body2">
                                      {excl.isGeneral ? 'כללי – חל על כל הפוליסה' : 'ספציפי – חל על פרק או כיסוי מסוים'}
                                    </Typography>
                                  </Box>
                                  {excl.chapterCode && (
                                    <Box>
                                      <Typography variant="caption" color="text.secondary">פרק</Typography>
                                      <Typography variant="body2">{excl.chapterCode}</Typography>
                                    </Box>
                                  )}
                                </Box>
                              </Box>
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            {exclusions.length === 0 && (
              <Box textAlign="center" py={3}>
                <Typography color="text.secondary">אין חריגים רשומים</Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Relations Tab */}
      {activeTab === 2 && (
        <Box>
          {relations.length > 0 ? (
            <Grid container spacing={2}>
              {relations.map((rel, idx) => (
                <Grid item xs={12} md={6} key={idx}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {rel.product.nameHe}
                        </Typography>
                        <Chip
                          label={RELATION_TYPE_LABELS[rel.relationType]?.he || rel.relationType}
                          size="small"
                          color={RELATION_TYPE_LABELS[rel.relationType]?.color || 'default'}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {rel.product.nameEn}
                      </Typography>
                      {rel.description && (
                        <Typography variant="body2">{rel.description}</Typography>
                      )}
                      <Box mt={1}>
                        <Button
                          component={NextLink}
                          href={`/rfq/knowledge/${rel.product.code}`}
                          size="small"
                          variant="text"
                        >
                          צפה במוצר
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Alert severity="info">אין קשרים בין-פוליסתיים למוצר זה</Alert>
          )}
        </Box>
      )}
    </Box>
  );
}
