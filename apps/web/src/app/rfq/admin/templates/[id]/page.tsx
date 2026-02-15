'use client';

import {
  ArrowBack as BackIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  DragIndicator as DragIcon,
  Rule as RulesIcon,
} from '@mui/icons-material';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Alert,
  FormControlLabel,
  Switch,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Tooltip,
  Divider,
} from '@mui/material';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';

import { QuestionEditor } from '@/components/rfq/QuestionEditor';
import {
  adminApi,
  type QuestionnaireTemplateAdmin,
  type QuestionnaireSectionAdmin,
  type QuestionAdmin,
} from '@/lib/api';

interface SectionFormData {
  title: string;
  titleHe: string;
  description: string;
  descriptionHe: string;
}

export default function TemplateEditorPage() {
  const params = useParams();
  const templateId = params.id as string;

  const [template, setTemplate] = useState<QuestionnaireTemplateAdmin | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Template edit state
  const [sectorHe, setSectorHe] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionHe, setDescriptionHe] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [version, setVersion] = useState('');

  // Section dialog state
  const [sectionDialogOpen, setSectionDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<QuestionnaireSectionAdmin | null>(null);
  const [sectionForm, setSectionForm] = useState<SectionFormData>({
    title: '',
    titleHe: '',
    description: '',
    descriptionHe: '',
  });

  // Question dialog state
  const [questionDialogOpen, setQuestionDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionAdmin | null>(null);
  const [currentSectionId, setCurrentSectionId] = useState<string | null>(null);

  // Delete dialogs
  const [deleteSectionDialog, setDeleteSectionDialog] = useState<QuestionnaireSectionAdmin | null>(
    null
  );
  const [deleteQuestionDialog, setDeleteQuestionDialog] = useState<QuestionAdmin | null>(null);

  const loadTemplate = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminApi.templates.get(templateId);
      if (response.success && response.data) {
        setTemplate(response.data);
        setSectorHe(response.data.sectorHe);
        setDescription(response.data.description || '');
        setDescriptionHe(response.data.descriptionHe || '');
        setIsActive(response.data.isActive);
        setVersion(response.data.version);
      }
    } catch (err: unknown) {
      setError('Failed to load template');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [templateId]);

  useEffect(() => {
    loadTemplate();
  }, [loadTemplate]);

  const handleSaveTemplate = async () => {
    setSaving(true);
    setError(null);
    try {
      await adminApi.templates.update(templateId, {
        sectorHe,
        description: description || undefined,
        descriptionHe: descriptionHe || undefined,
        isActive,
        version,
      });
      setSuccess('Template saved successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      setError('Failed to save template');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Section handlers
  const openSectionDialog = (section?: QuestionnaireSectionAdmin) => {
    if (section) {
      setEditingSection(section);
      setSectionForm({
        title: section.title,
        titleHe: section.titleHe,
        description: section.description || '',
        descriptionHe: section.descriptionHe || '',
      });
    } else {
      setEditingSection(null);
      setSectionForm({ title: '', titleHe: '', description: '', descriptionHe: '' });
    }
    setSectionDialogOpen(true);
  };

  const handleSaveSection = async () => {
    setSaving(true);
    try {
      if (editingSection) {
        await adminApi.sections.update(editingSection.id, sectionForm);
      } else {
        await adminApi.sections.create(templateId, sectionForm);
      }
      setSectionDialogOpen(false);
      loadTemplate();
    } catch (err: unknown) {
      setError('Failed to save section');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSection = async () => {
    if (!deleteSectionDialog) return;
    try {
      await adminApi.sections.delete(deleteSectionDialog.id);
      setDeleteSectionDialog(null);
      loadTemplate();
    } catch (err: unknown) {
      setError('Failed to delete section');
      console.error(err);
    }
  };

  // Question handlers
  const openQuestionDialog = (sectionId: string, question?: QuestionAdmin) => {
    setCurrentSectionId(sectionId);
    setEditingQuestion(question || null);
    setQuestionDialogOpen(true);
  };

  const handleSaveQuestion = async (
    data: Omit<QuestionAdmin, 'id' | 'sectionId' | 'createdAt' | 'updatedAt'>
  ) => {
    setSaving(true);
    try {
      if (editingQuestion) {
        await adminApi.questions.update(editingQuestion.id, data);
      } else if (currentSectionId) {
        await adminApi.questions.create(currentSectionId, data);
      }
      setQuestionDialogOpen(false);
      loadTemplate();
    } catch (err: unknown) {
      setError('Failed to save question');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteQuestion = async () => {
    if (!deleteQuestionDialog) return;
    try {
      await adminApi.questions.delete(deleteQuestionDialog.id);
      setDeleteQuestionDialog(null);
      loadTemplate();
    } catch (err: unknown) {
      setError('Failed to delete question');
      console.error(err);
    }
  };

  const getQuestionTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      text: 'טקסט',
      number: 'מספר',
      boolean: 'כן/לא',
      select: 'בחירה',
      multiselect: 'בחירה מרובה',
      date: 'תאריך',
      currency: 'סכום',
    };
    return types[type] || type;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!template) {
    return <Alert severity="error">Template not found</Alert>;
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={2} mb={4}>
        <Button component={Link} href="/rfq/admin/templates" startIcon={<BackIcon />}>
          חזרה לרשימה
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Template Settings */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5" fontWeight="bold">
              הגדרות תבנית: {template.sector}
            </Typography>
            <Button
              component={Link}
              href={`/rfq/admin/templates/${templateId}/rules`}
              variant="outlined"
              startIcon={<RulesIcon />}
            >
              ניהול כללים
            </Button>
          </Box>

          <Box display="grid" gap={3}>
            <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={3}>
              <TextField
                label="שם ענף (בעברית)"
                value={sectorHe}
                onChange={(e) => setSectorHe(e.target.value)}
                fullWidth
              />
              <TextField
                label="גרסה"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                fullWidth
              />
            </Box>

            <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={3}>
              <TextField
                label="תיאור (באנגלית)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                fullWidth
                multiline
                rows={2}
              />
              <TextField
                label="תיאור (בעברית)"
                value={descriptionHe}
                onChange={(e) => setDescriptionHe(e.target.value)}
                fullWidth
                multiline
                rows={2}
              />
            </Box>

            <Box display="flex" justifyContent="space-between" alignItems="center">
              <FormControlLabel
                control={
                  <Switch checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                }
                label="תבנית פעילה"
              />
              <Button onClick={handleSaveTemplate} variant="contained" disabled={saving}>
                {saving ? 'שומר...' : 'שמור הגדרות'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Sections */}
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5" fontWeight="bold">
              מקטעים ושאלות
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => openSectionDialog()}>
              הוסף מקטע
            </Button>
          </Box>

          {template.sections?.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Typography color="text.secondary" gutterBottom>
                אין מקטעים בתבנית זו
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => openSectionDialog()}
              >
                הוסף מקטע ראשון
              </Button>
            </Box>
          ) : (
            template.sections?.map((section, sectionIndex) => (
              <Accordion key={section.id} defaultExpanded={sectionIndex === 0}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box display="flex" alignItems="center" gap={2} width="100%">
                    <DragIcon sx={{ color: 'text.secondary' }} />
                    <Box flexGrow={1}>
                      <Typography fontWeight="medium">{section.titleHe}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {section.title} • {section.questions?.length || 0} שאלות
                      </Typography>
                    </Box>
                    <Box display="flex" gap={1} onClick={(e) => e.stopPropagation()}>
                      <Tooltip title="ערוך מקטע">
                        <IconButton size="small" onClick={() => openSectionDialog(section)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="מחק מקטע">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => setDeleteSectionDialog(section)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Button
                    startIcon={<AddIcon />}
                    size="small"
                    onClick={() => openQuestionDialog(section.id)}
                    sx={{ mb: 2 }}
                  >
                    הוסף שאלה
                  </Button>

                  {section.questions?.length === 0 ? (
                    <Typography color="text.secondary" textAlign="center" py={2}>
                      אין שאלות במקטע זה
                    </Typography>
                  ) : (
                    <List dense>
                      {section.questions?.map((question, qIndex) => (
                        <Box key={question.id}>
                          {qIndex > 0 && <Divider />}
                          <ListItem>
                            <DragIcon sx={{ color: 'text.secondary', mr: 2, cursor: 'grab' }} />
                            <ListItemText
                              primary={
                                <Box display="flex" alignItems="center" gap={1}>
                                  <Typography>{question.labelHe}</Typography>
                                  {question.required && (
                                    <Chip label="חובה" size="small" color="error" />
                                  )}
                                </Box>
                              }
                              secondary={
                                <Box display="flex" gap={1} mt={0.5}>
                                  <Chip
                                    label={getQuestionTypeLabel(question.type)}
                                    size="small"
                                    variant="outlined"
                                  />
                                  <Typography variant="caption" color="text.secondary">
                                    {question.questionId}
                                  </Typography>
                                  {question.showIf && question.showIf.length > 0 && (
                                    <Chip
                                      label="מותנה"
                                      size="small"
                                      color="info"
                                      variant="outlined"
                                    />
                                  )}
                                </Box>
                              }
                            />
                            <ListItemSecondaryAction>
                              <Tooltip title="ערוך שאלה">
                                <IconButton
                                  size="small"
                                  onClick={() => openQuestionDialog(section.id, question)}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="מחק שאלה">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => setDeleteQuestionDialog(question)}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </ListItemSecondaryAction>
                          </ListItem>
                        </Box>
                      ))}
                    </List>
                  )}
                </AccordionDetails>
              </Accordion>
            ))
          )}
        </CardContent>
      </Card>

      {/* Section Dialog */}
      <Dialog
        open={sectionDialogOpen}
        onClose={() => setSectionDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{editingSection ? 'עריכת מקטע' : 'הוספת מקטע'}</DialogTitle>
        <DialogContent>
          <Box display="grid" gap={2} sx={{ pt: 2 }}>
            <TextField
              label="כותרת (באנגלית)"
              value={sectionForm.title}
              onChange={(e) => setSectionForm({ ...sectionForm, title: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="כותרת (בעברית)"
              value={sectionForm.titleHe}
              onChange={(e) => setSectionForm({ ...sectionForm, titleHe: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="תיאור (באנגלית)"
              value={sectionForm.description}
              onChange={(e) => setSectionForm({ ...sectionForm, description: e.target.value })}
              fullWidth
              multiline
              rows={2}
            />
            <TextField
              label="תיאור (בעברית)"
              value={sectionForm.descriptionHe}
              onChange={(e) => setSectionForm({ ...sectionForm, descriptionHe: e.target.value })}
              fullWidth
              multiline
              rows={2}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSectionDialogOpen(false)}>ביטול</Button>
          <Button
            onClick={handleSaveSection}
            variant="contained"
            disabled={saving || !sectionForm.title || !sectionForm.titleHe}
          >
            {saving ? 'שומר...' : 'שמור'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Question Editor Dialog */}
      <QuestionEditor
        open={questionDialogOpen}
        onClose={() => setQuestionDialogOpen(false)}
        question={editingQuestion}
        onSave={handleSaveQuestion}
        allQuestions={template.sections?.flatMap((s) => s.questions || []) || []}
      />

      {/* Delete Section Dialog */}
      <Dialog open={!!deleteSectionDialog} onClose={() => setDeleteSectionDialog(null)}>
        <DialogTitle>מחיקת מקטע</DialogTitle>
        <DialogContent>
          <Typography>
            האם אתה בטוח שברצונך למחוק את המקטע "{deleteSectionDialog?.titleHe}"?
          </Typography>
          <Typography color="error" sx={{ mt: 2 }}>
            פעולה זו תמחק גם את כל השאלות במקטע.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteSectionDialog(null)}>ביטול</Button>
          <Button onClick={handleDeleteSection} color="error" variant="contained">
            מחק
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Question Dialog */}
      <Dialog open={!!deleteQuestionDialog} onClose={() => setDeleteQuestionDialog(null)}>
        <DialogTitle>מחיקת שאלה</DialogTitle>
        <DialogContent>
          <Typography>
            האם אתה בטוח שברצונך למחוק את השאלה "{deleteQuestionDialog?.labelHe}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteQuestionDialog(null)}>ביטול</Button>
          <Button onClick={handleDeleteQuestion} color="error" variant="contained">
            מחק
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
