'use client';

import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  UploadFile as UploadFileIcon,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Alert,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { comparisonApi, type ComparisonTemplate, type ComparisonRequirement } from '@/lib/api';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useSnackbar } from '@/components/SnackbarProvider';

interface NewRequirement {
  policyType: string;
  policyTypeHe: string;
  minimumLimit: number;
  maximumDeductible?: number;
  requiredEndorsements: string[];
  requireAdditionalInsured: boolean;
  requireWaiverSubrogation: boolean;
  minimumValidityDays?: number;
  isMandatory: boolean;
  notes?: string;
  notesHe?: string;
}

const initialRequirement: NewRequirement = {
  policyType: '',
  policyTypeHe: '',
  minimumLimit: 0,
  requiredEndorsements: [],
  requireAdditionalInsured: false,
  requireWaiverSubrogation: false,
  isMandatory: true,
};

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<ComparisonTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    nameHe: '',
    description: '',
    descriptionHe: '',
    sector: '',
    contractType: '',
    requirements: [] as NewRequirement[],
  });
  const [newRequirement, setNewRequirement] = useState<NewRequirement>(initialRequirement);
  const [deleteTarget, setDeleteTarget] = useState<ComparisonTemplate | null>(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showSuccess, showError } = useSnackbar();

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await comparisonApi.templates.list();
      setTemplates(response.data || []);
    } catch (err) {
      setError('Failed to load templates');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async () => {
    try {
      await comparisonApi.templates.create({
        name: newTemplate.name,
        nameHe: newTemplate.nameHe,
        description: newTemplate.description || undefined,
        descriptionHe: newTemplate.descriptionHe || undefined,
        sector: newTemplate.sector || undefined,
        contractType: newTemplate.contractType || undefined,
        requirements: newTemplate.requirements,
      });
      setDialogOpen(false);
      setNewTemplate({
        name: '',
        nameHe: '',
        description: '',
        descriptionHe: '',
        sector: '',
        contractType: '',
        requirements: [],
      });
      showSuccess('התבנית נוצרה בהצלחה');
      loadTemplates();
    } catch (err) {
      showError('שגיאה ביצירת תבנית');
      console.error(err);
    }
  };

  const handleDeleteTemplate = async () => {
    if (!deleteTarget) return;
    try {
      await comparisonApi.templates.delete(deleteTarget.id);
      setTemplates(templates.filter((t) => t.id !== deleteTarget.id));
      showSuccess('התבנית נמחקה בהצלחה');
    } catch (err) {
      showError('שגיאה במחיקת תבנית');
      console.error(err);
    } finally {
      setDeleteTarget(null);
    }
  };

  const addRequirement = () => {
    if (newRequirement.policyType && newRequirement.policyTypeHe) {
      setNewTemplate({
        ...newTemplate,
        requirements: [...newTemplate.requirements, newRequirement],
      });
      setNewRequirement(initialRequirement);
    }
  };

  const removeRequirement = (index: number) => {
    setNewTemplate({
      ...newTemplate,
      requirements: newTemplate.requirements.filter((_, i) => i !== index),
    });
  };

  const handleImportDocx = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
      );

      await comparisonApi.templates.importDocx(file.name, base64);
      showSuccess('התבנית יובאה בהצלחה');
      loadTemplates();
    } catch (err) {
      showError('שגיאה בייבוא קובץ DOCX');
      console.error(err);
    } finally {
      setImporting(false);
      // Reset file input so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
            תבניות דרישות
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Manage requirement templates for certificate comparison
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <input
            type="file"
            accept=".docx"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleImportDocx}
          />
          <Button
            variant="outlined"
            startIcon={<UploadFileIcon />}
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
          >
            {importing ? 'מייבא...' : 'ייבוא מ-DOCX'}
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
            תבנית חדשה
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {templates.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              אין תבניות עדיין
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Create your first requirement template to start comparing certificates
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
              צור תבנית חדשה
            </Button>
          </CardContent>
        </Card>
      ) : (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', width: '25%' }}>שם תבנית</TableCell>
                <TableCell sx={{ fontWeight: 'bold', width: '25%' }}>תיאור</TableCell>
                <TableCell sx={{ fontWeight: 'bold', width: '15%' }}>ענף / סוג חוזה</TableCell>
                <TableCell sx={{ fontWeight: 'bold', width: '5%' }}>דרישות</TableCell>
                <TableCell sx={{ fontWeight: 'bold', width: '22%' }}>סוגי פוליסות</TableCell>
                <TableCell sx={{ fontWeight: 'bold', width: '8%' }}>פעולות</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {templates.map((template) => (
                <TableRow key={template.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {template.nameHe}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {template.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {template.description && (
                      <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 250 }}>
                        {template.descriptionHe || template.description}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {template.sector && (
                        <Chip label={template.sector} size="small" variant="outlined" />
                      )}
                      {template.contractType && (
                        <Chip label={template.contractType} size="small" variant="outlined" />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={`${template.requirements?.length || 0} דרישות`}
                      size="small"
                      color="primary"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {template.requirements?.slice(0, 4).map((req) => (
                        <Chip
                          key={req.id}
                          label={req.policyTypeHe}
                          size="small"
                          variant="outlined"
                          color={req.isMandatory ? 'error' : 'default'}
                        />
                      ))}
                      {(template.requirements?.length || 0) > 4 && (
                        <Chip
                          label={`+${(template.requirements?.length || 0) - 4}`}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton
                        size="small"
                        color="primary"
                        component={Link}
                        href={`/comparison/templates/${template.id}`}
                      >
                        <ViewIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setDeleteTarget(template)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Create Template Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">
            יצירת תבנית חדשה
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="שם בעברית"
                value={newTemplate.nameHe}
                onChange={(e) => setNewTemplate({ ...newTemplate, nameHe: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Name (English)"
                value={newTemplate.name}
                onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="תיאור בעברית"
                value={newTemplate.descriptionHe}
                onChange={(e) => setNewTemplate({ ...newTemplate, descriptionHe: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Description (English)"
                value={newTemplate.description}
                onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="ענף"
                value={newTemplate.sector}
                onChange={(e) => setNewTemplate({ ...newTemplate, sector: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="סוג חוזה"
                value={newTemplate.contractType}
                onChange={(e) => setNewTemplate({ ...newTemplate, contractType: e.target.value })}
              />
            </Grid>

            {/* Requirements Section */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2, mb: 1 }}>
                דרישות פוליסה
              </Typography>

              {newTemplate.requirements.map((req, idx) => (
                <Box
                  key={idx}
                  sx={{
                    p: 2,
                    mb: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {req.policyTypeHe} ({req.policyType})
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      מינימום: ₪{req.minimumLimit.toLocaleString()}
                      {req.isMandatory && ' | חובה'}
                    </Typography>
                  </Box>
                  <IconButton size="small" onClick={() => removeRequirement(idx)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}

              <Box sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 1, mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  הוסף דרישה
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="סוג פוליסה (עברית)"
                      value={newRequirement.policyTypeHe}
                      onChange={(e) =>
                        setNewRequirement({ ...newRequirement, policyTypeHe: e.target.value })
                      }
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Policy Type (English)"
                      value={newRequirement.policyType}
                      onChange={(e) =>
                        setNewRequirement({ ...newRequirement, policyType: e.target.value })
                      }
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      label="סכום מינימלי (₪)"
                      value={newRequirement.minimumLimit}
                      onChange={(e) =>
                        setNewRequirement({
                          ...newRequirement,
                          minimumLimit: Number(e.target.value),
                        })
                      }
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      label="השתתפות עצמית מקסימלית (₪)"
                      value={newRequirement.maximumDeductible || ''}
                      onChange={(e) =>
                        setNewRequirement({
                          ...newRequirement,
                          maximumDeductible: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={newRequirement.isMandatory}
                            onChange={(e) =>
                              setNewRequirement({
                                ...newRequirement,
                                isMandatory: e.target.checked,
                              })
                            }
                          />
                        }
                        label="חובה"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={newRequirement.requireAdditionalInsured}
                            onChange={(e) =>
                              setNewRequirement({
                                ...newRequirement,
                                requireAdditionalInsured: e.target.checked,
                              })
                            }
                          />
                        }
                        label="מבוטח נוסף"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={newRequirement.requireWaiverSubrogation}
                            onChange={(e) =>
                              setNewRequirement({
                                ...newRequirement,
                                requireWaiverSubrogation: e.target.checked,
                              })
                            }
                          />
                        }
                        label="ויתור התחלוף"
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Button variant="outlined" onClick={addRequirement}>
                      הוסף דרישה
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>ביטול</Button>
          <Button
            variant="contained"
            onClick={handleCreateTemplate}
            disabled={!newTemplate.name || !newTemplate.nameHe}
          >
            צור תבנית
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        title="מחיקת תבנית"
        message={`האם למחוק את התבנית "${deleteTarget?.nameHe}"? פעולה זו אינה הפיכה.`}
        confirmLabel="מחק"
        destructive
        onConfirm={handleDeleteTemplate}
        onCancel={() => setDeleteTarget(null)}
      />
    </Box>
  );
}
