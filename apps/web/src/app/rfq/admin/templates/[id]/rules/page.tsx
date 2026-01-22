'use client';

import {
  ArrowBack as BackIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as DuplicateIcon,
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
  Switch,
  FormControlLabel,
  Tooltip,
} from '@mui/material';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';

import { RuleBuilder } from '@/components/rfq/RuleBuilder';
import {
  adminApi,
  type QuestionnaireTemplateAdmin,
  type CoverageRuleAdmin,
  type QuestionAdmin,
} from '@/lib/api';

export default function RulesPage() {
  const params = useParams();
  const templateId = params.id as string;

  const [template, setTemplate] = useState<QuestionnaireTemplateAdmin | null>(null);
  const [rules, setRules] = useState<CoverageRuleAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [includeInactive, setIncludeInactive] = useState(true);

  // Rule dialog state
  const [ruleDialogOpen, setRuleDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<CoverageRuleAdmin | null>(null);

  // Delete dialog
  const [deleteRuleDialog, setDeleteRuleDialog] = useState<CoverageRuleAdmin | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [templateResponse, rulesResponse] = await Promise.all([
        adminApi.templates.get(templateId),
        adminApi.rules.list(templateId, includeInactive),
      ]);

      if (templateResponse.success && templateResponse.data) {
        setTemplate(templateResponse.data);
      }
      if (rulesResponse.success && rulesResponse.data) {
        setRules(rulesResponse.data);
      }
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [templateId, includeInactive]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggleActive = async (rule: CoverageRuleAdmin) => {
    try {
      await adminApi.rules.toggle(rule.id);
      loadData();
    } catch (err) {
      setError('Failed to toggle rule status');
      console.error(err);
    }
  };

  const handleDuplicate = async (rule: CoverageRuleAdmin) => {
    try {
      await adminApi.rules.duplicate(rule.id);
      loadData();
    } catch (err) {
      setError('Failed to duplicate rule');
      console.error(err);
    }
  };

  const handleDeleteRule = async () => {
    if (!deleteRuleDialog) return;
    try {
      await adminApi.rules.delete(deleteRuleDialog.id);
      setDeleteRuleDialog(null);
      loadData();
    } catch (err) {
      setError('Failed to delete rule');
      console.error(err);
    }
  };

  const handleSaveRule = async (
    data: Omit<CoverageRuleAdmin, 'id' | 'templateId' | 'createdAt' | 'updatedAt'>
  ) => {
    try {
      if (editingRule) {
        await adminApi.rules.update(editingRule.id, data);
      } else {
        await adminApi.rules.create(templateId, data);
      }
      setRuleDialogOpen(false);
      loadData();
    } catch (err) {
      setError('Failed to save rule');
      console.error(err);
    }
  };

  const openRuleDialog = (rule?: CoverageRuleAdmin) => {
    setEditingRule(rule || null);
    setRuleDialogOpen(true);
  };

  const getAllQuestions = (): QuestionAdmin[] => {
    return template?.sections?.flatMap((s) => s.questions || []) || [];
  };

  const getActionTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      addPolicy: 'הוסף פוליסה',
      removePolicy: 'הסר פוליסה',
      adjustLimit: 'התאם גבול',
      addEndorsement: 'הוסף הרחבה',
      setMandatory: 'קבע כחובה',
    };
    return types[type] || type;
  };

  // Priority labels for better UX
  // Lower number = runs first (higher priority)
  // Using 10-step gaps (10, 20, 30...) allows inserting rules between existing ones
  // without renumbering (e.g., add priority 15 between 10 and 20)
  const getPriorityLabel = (priority: number): { phase: string; description: string; color: 'error' | 'warning' | 'info' | 'success' | 'default' } => {
    if (priority <= 10) {
      return { phase: 'שלב 1', description: 'גודל חברה', color: 'error' };
    } else if (priority <= 20) {
      return { phase: 'שלב 2', description: 'הכנסות / מוצר', color: 'warning' };
    } else if (priority <= 30) {
      return { phase: 'שלב 3', description: 'תנאים מיוחדים', color: 'info' };
    } else if (priority <= 40) {
      return { phase: 'שלב 4', description: 'גיאוגרפיה / נתונים', color: 'info' };
    } else if (priority <= 50) {
      return { phase: 'שלב 5', description: 'הסמכות / הנחות', color: 'success' };
    } else {
      return { phase: 'שלב 6', description: 'היסטוריה', color: 'default' };
    }
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
        <Button
          component={Link}
          href={`/rfq/admin/templates/${templateId}`}
          startIcon={<BackIcon />}
        >
          חזרה לתבנית
        </Button>
      </Box>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            ניהול כללים: {template.sectorHe}
          </Typography>
          <Typography color="text.secondary">Coverage Rules Management</Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => openRuleDialog()}
        >
          הוסף כלל
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <FormControlLabel
            control={
              <Switch
                checked={includeInactive}
                onChange={(e) => setIncludeInactive(e.target.checked)}
              />
            }
            label="הצג כללים לא פעילים"
          />
        </CardContent>
      </Card>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>שם כלל</TableCell>
                <TableCell>עדיפות</TableCell>
                <TableCell>תנאים</TableCell>
                <TableCell>פעולות</TableCell>
                <TableCell>סטטוס</TableCell>
                <TableCell>פעולות</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">לא נמצאו כללים</Typography>
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      sx={{ mt: 2 }}
                      onClick={() => openRuleDialog()}
                    >
                      הוסף כלל ראשון
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                rules.map((rule) => (
                  <TableRow key={rule.id} hover sx={{ opacity: rule.isActive ? 1 : 0.6 }}>
                    <TableCell>
                      <Box>
                        <Typography fontWeight="medium">{rule.nameHe}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {rule.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Tooltip title={`עדיפות ${rule.priority} - ${getPriorityLabel(rule.priority).description}`}>
                        <Box display="flex" flexDirection="column" gap={0.5}>
                          <Chip
                            label={getPriorityLabel(rule.priority).phase}
                            size="small"
                            color={getPriorityLabel(rule.priority).color}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {getPriorityLabel(rule.priority).description}
                          </Typography>
                        </Box>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={0.5} flexWrap="wrap">
                        {rule.conditions.slice(0, 2).map((c, i) => (
                          <Chip
                            key={i}
                            label={`${c.field} ${c.operator}`}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                        {rule.conditions.length > 2 && (
                          <Chip
                            label={`+${rule.conditions.length - 2}`}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={0.5} flexWrap="wrap">
                        {rule.actions.slice(0, 2).map((a, i) => (
                          <Chip
                            key={i}
                            label={getActionTypeLabel(a.type)}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        ))}
                        {rule.actions.length > 2 && (
                          <Chip
                            label={`+${rule.actions.length - 2}`}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={rule.isActive ? <ActiveIcon /> : <InactiveIcon />}
                        label={rule.isActive ? 'פעיל' : 'לא פעיל'}
                        color={rule.isActive ? 'success' : 'default'}
                        size="small"
                        onClick={() => handleToggleActive(rule)}
                        sx={{ cursor: 'pointer' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={0.5}>
                        <Tooltip title="עריכה">
                          <IconButton size="small" onClick={() => openRuleDialog(rule)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="שכפול">
                          <IconButton size="small" onClick={() => handleDuplicate(rule)}>
                            <DuplicateIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="מחיקה">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => setDeleteRuleDialog(rule)}
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

      {/* Rule Builder Dialog */}
      <RuleBuilder
        open={ruleDialogOpen}
        onClose={() => setRuleDialogOpen(false)}
        rule={editingRule}
        onSave={handleSaveRule}
        allQuestions={getAllQuestions()}
      />

      {/* Delete Dialog */}
      <Dialog open={!!deleteRuleDialog} onClose={() => setDeleteRuleDialog(null)}>
        <DialogTitle>מחיקת כלל</DialogTitle>
        <DialogContent>
          <Typography>
            האם אתה בטוח שברצונך למחוק את הכלל "{deleteRuleDialog?.nameHe}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteRuleDialog(null)}>ביטול</Button>
          <Button onClick={handleDeleteRule} color="error" variant="contained">
            מחק
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
