'use client';

import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as DuplicateIcon,
  Rule as RulesIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
} from '@mui/icons-material';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  Tooltip,
} from '@mui/material';
import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';

import { adminApi, type QuestionnaireTemplateAdmin } from '@/lib/api';

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<QuestionnaireTemplateAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [includeInactive, setIncludeInactive] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<QuestionnaireTemplateAdmin | null>(null);
  const [duplicateSector, setDuplicateSector] = useState('');
  const [duplicateSectorHe, setDuplicateSectorHe] = useState('');

  const loadTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminApi.templates.list(includeInactive);
      if (response.success && response.data) {
        setTemplates(response.data);
      }
    } catch (err) {
      setError('Failed to load templates');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [includeInactive]);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const handleDelete = async () => {
    if (!selectedTemplate) return;
    try {
      await adminApi.templates.delete(selectedTemplate.id);
      setDeleteDialogOpen(false);
      setSelectedTemplate(null);
      loadTemplates();
    } catch (err) {
      setError('Failed to delete template');
      console.error(err);
    }
  };

  const handleDuplicate = async () => {
    if (!selectedTemplate || !duplicateSector || !duplicateSectorHe) return;
    try {
      await adminApi.templates.duplicate(selectedTemplate.id, duplicateSector, duplicateSectorHe);
      setDuplicateDialogOpen(false);
      setSelectedTemplate(null);
      setDuplicateSector('');
      setDuplicateSectorHe('');
      loadTemplates();
    } catch (err) {
      setError('Failed to duplicate template');
      console.error(err);
    }
  };

  const openDeleteDialog = (template: QuestionnaireTemplateAdmin) => {
    setSelectedTemplate(template);
    setDeleteDialogOpen(true);
  };

  const openDuplicateDialog = (template: QuestionnaireTemplateAdmin) => {
    setSelectedTemplate(template);
    setDuplicateSector('');
    setDuplicateSectorHe('');
    setDuplicateDialogOpen(true);
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            ניהול תבניות שאלונים
          </Typography>
          <Typography color="text.secondary">Questionnaire Template Management</Typography>
        </Box>
        <Button
          component={Link}
          href="/rfq/admin/templates/new"
          variant="contained"
          startIcon={<AddIcon />}
          size="large"
        >
          תבנית חדשה
        </Button>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <FormControlLabel
            control={
              <Switch
                checked={includeInactive}
                onChange={(e) => setIncludeInactive(e.target.checked)}
              />
            }
            label="הצג תבניות לא פעילות"
          />
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ענף</TableCell>
                <TableCell>גרסה</TableCell>
                <TableCell>סטטוס</TableCell>
                <TableCell>מקטעים</TableCell>
                <TableCell>כללים</TableCell>
                <TableCell>עודכן</TableCell>
                <TableCell>פעולות</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : templates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">לא נמצאו תבניות</Typography>
                    <Button
                      component={Link}
                      href="/rfq/admin/templates/new"
                      variant="outlined"
                      startIcon={<AddIcon />}
                      sx={{ mt: 2 }}
                    >
                      הוסף תבנית ראשונה
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                templates.map((template) => (
                  <TableRow key={template.id} hover>
                    <TableCell>
                      <Box>
                        <Typography fontWeight="medium">{template.sectorHe}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {template.sector}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{template.version}</TableCell>
                    <TableCell>
                      <Chip
                        icon={template.isActive ? <ActiveIcon /> : <InactiveIcon />}
                        label={template.isActive ? 'פעיל' : 'לא פעיל'}
                        color={template.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip label={template._count?.sections || 0} size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip label={template._count?.rules || 0} size="small" />
                    </TableCell>
                    <TableCell>
                      {new Date(template.updatedAt).toLocaleDateString('he-IL')}
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={0.5}>
                        <Tooltip title="עריכה">
                          <IconButton
                            component={Link}
                            href={`/rfq/admin/templates/${template.id}`}
                            size="small"
                            color="primary"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="כללים">
                          <IconButton
                            component={Link}
                            href={`/rfq/admin/templates/${template.id}/rules`}
                            size="small"
                          >
                            <RulesIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="שכפול">
                          <IconButton
                            size="small"
                            onClick={() => openDuplicateDialog(template)}
                          >
                            <DuplicateIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="מחיקה">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => openDeleteDialog(template)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>מחיקת תבנית</DialogTitle>
        <DialogContent>
          <Typography>
            האם אתה בטוח שברצונך למחוק את התבנית "{selectedTemplate?.sectorHe}"?
          </Typography>
          <Typography color="error" sx={{ mt: 2 }}>
            פעולה זו תמחק גם את כל המקטעים, השאלות והכללים המשויכים לתבנית.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>ביטול</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            מחק
          </Button>
        </DialogActions>
      </Dialog>

      {/* Duplicate Dialog */}
      <Dialog open={duplicateDialogOpen} onClose={() => setDuplicateDialogOpen(false)}>
        <DialogTitle>שכפול תבנית</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography sx={{ mb: 3 }}>
            יצירת עותק של התבנית "{selectedTemplate?.sectorHe}" עבור ענף חדש.
          </Typography>
          <TextField
            label="קוד ענף (באנגלית)"
            value={duplicateSector}
            onChange={(e) => setDuplicateSector(e.target.value.toUpperCase())}
            fullWidth
            sx={{ mb: 2 }}
            placeholder="HOSPITALITY"
          />
          <TextField
            label="שם ענף (בעברית)"
            value={duplicateSectorHe}
            onChange={(e) => setDuplicateSectorHe(e.target.value)}
            fullWidth
            placeholder="אירוח"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDuplicateDialogOpen(false)}>ביטול</Button>
          <Button
            onClick={handleDuplicate}
            variant="contained"
            disabled={!duplicateSector || !duplicateSectorHe}
          >
            שכפל
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
