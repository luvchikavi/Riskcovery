'use client';

import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Typography,
  IconButton,
  Divider,
  Card,
  CardContent,
} from '@mui/material';
import { useState, useEffect } from 'react';

import type {
  CoverageRuleAdmin,
  RuleCondition,
  RuleAction,
  QuestionAdmin,
} from '@/lib/api';

interface RuleBuilderProps {
  open: boolean;
  onClose: () => void;
  rule: CoverageRuleAdmin | null;
  onSave: (data: Omit<CoverageRuleAdmin, 'id' | 'templateId' | 'createdAt' | 'updatedAt'>) => void;
  allQuestions: QuestionAdmin[];
}

const OPERATORS = [
  { value: 'equals', label: 'שווה ל', labelEn: 'equals' },
  { value: 'notEquals', label: 'שונה מ', labelEn: 'not equals' },
  { value: 'greaterThan', label: 'גדול מ', labelEn: 'greater than' },
  { value: 'lessThan', label: 'קטן מ', labelEn: 'less than' },
  { value: 'contains', label: 'מכיל', labelEn: 'contains' },
  { value: 'in', label: 'אחד מ', labelEn: 'in' },
];

const ACTION_TYPES = [
  { value: 'addPolicy', label: 'הוסף פוליסה', labelEn: 'Add Policy' },
  { value: 'removePolicy', label: 'הסר פוליסה', labelEn: 'Remove Policy' },
  { value: 'adjustLimit', label: 'התאם גבול', labelEn: 'Adjust Limit' },
  { value: 'addEndorsement', label: 'הוסף הרחבה', labelEn: 'Add Endorsement' },
  { value: 'setMandatory', label: 'קבע כחובה', labelEn: 'Set Mandatory' },
];

const POLICY_TYPES = [
  { value: 'GENERAL_LIABILITY', label: 'אחריות כלפי צד שלישי' },
  { value: 'EMPLOYER_LIABILITY', label: 'אחריות מעבידים' },
  { value: 'PROFESSIONAL_INDEMNITY', label: 'אחריות מקצועית' },
  { value: 'CYBER_LIABILITY', label: 'אחריות סייבר' },
  { value: 'CAR_INSURANCE', label: 'ביטוח עבודות קבלניות' },
  { value: 'PROPERTY_INSURANCE', label: 'ביטוח רכוש' },
  { value: 'D&O_LIABILITY', label: 'אחריות דירקטורים ונושאי משרה' },
  { value: 'PRODUCT_LIABILITY', label: 'אחריות מוצר' },
];

// Priority phases - using 10-step gaps allows inserting rules between phases
// without renumbering (e.g., add priority 15 between 10 and 20)
// Lower number = higher priority = runs first
const PRIORITY_PHASES = [
  { value: '10', label: 'שלב 1 - גודל חברה', description: 'כללים לפי מספר עובדים / גודל עסק' },
  { value: '20', label: 'שלב 2 - הכנסות / מוצר', description: 'כללים לפי מחזור או סוג מוצר' },
  { value: '30', label: 'שלב 3 - תנאים מיוחדים', description: 'כללים לפי חומרים מסוכנים, עבודה בגובה וכו\'' },
  { value: '40', label: 'שלב 4 - גיאוגרפיה / נתונים', description: 'כללים לפי מיקום פעילות או סוג מידע' },
  { value: '50', label: 'שלב 5 - הסמכות / הנחות', description: 'הנחות עבור הסמכות (ISO, SOC2 וכו\')' },
  { value: '60', label: 'שלב 6 - היסטוריה', description: 'התאמות לפי היסטוריית תביעות' },
];

export function RuleBuilder({
  open,
  onClose,
  rule,
  onSave,
  allQuestions,
}: RuleBuilderProps) {
  const [name, setName] = useState('');
  const [nameHe, setNameHe] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionHe, setDescriptionHe] = useState('');
  const [priority, setPriority] = useState('50');
  const [isActive, setIsActive] = useState(true);
  const [conditions, setConditions] = useState<RuleCondition[]>([]);
  const [actions, setActions] = useState<RuleAction[]>([]);

  useEffect(() => {
    if (rule) {
      setName(rule.name);
      setNameHe(rule.nameHe);
      setDescription(rule.description || '');
      setDescriptionHe(rule.descriptionHe || '');
      setPriority(rule.priority.toString());
      setIsActive(rule.isActive);
      setConditions(rule.conditions);
      setActions(rule.actions);
    } else {
      setName('');
      setNameHe('');
      setDescription('');
      setDescriptionHe('');
      setPriority('50');
      setIsActive(true);
      setConditions([]);
      setActions([]);
    }
  }, [rule, open]);

  const handleSave = () => {
    onSave({
      name,
      nameHe,
      description: description || undefined,
      descriptionHe: descriptionHe || undefined,
      priority: parseInt(priority, 10),
      isActive,
      conditions,
      actions,
    });
  };

  // Condition handlers
  const addCondition = () => {
    setConditions([
      ...conditions,
      { field: '', operator: 'equals' as const, value: '' },
    ]);
  };

  const updateCondition = (
    index: number,
    field: keyof RuleCondition,
    value: unknown
  ) => {
    const newConditions = [...conditions];
    const current = newConditions[index];
    if (!current) return;
    newConditions[index] = {
      field: current.field,
      operator: current.operator,
      value: current.value,
      [field]: value,
    } as RuleCondition;
    setConditions(newConditions);
  };

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  // Action handlers
  const addAction = () => {
    setActions([
      ...actions,
      { type: 'adjustLimit' as const, policyType: '', multiplier: 1 },
    ]);
  };

  const updateAction = (index: number, field: keyof RuleAction, value: unknown) => {
    const newActions = [...actions];
    const current = newActions[index];
    if (!current) return;
    newActions[index] = {
      type: current.type,
      policyType: current.policyType,
      endorsement: current.endorsement,
      multiplier: current.multiplier,
      amount: current.amount,
      mandatory: current.mandatory,
      [field]: value,
    } as RuleAction;
    setActions(newActions);
  };

  const removeAction = (index: number) => {
    setActions(actions.filter((_, i) => i !== index));
  };

  const isValid =
    name && nameHe && conditions.length > 0 && actions.length > 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{rule ? 'עריכת כלל' : 'הוספת כלל'}</DialogTitle>
      <DialogContent>
        <Box display="grid" gap={3} sx={{ pt: 2 }}>
          {/* Basic Info */}
          <Typography variant="subtitle2" color="text.secondary">
            פרטי כלל
          </Typography>
          <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={2}>
            <TextField
              label="שם (באנגלית)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              fullWidth
              placeholder="Height work coverage"
            />
            <TextField
              label="שם (בעברית)"
              value={nameHe}
              onChange={(e) => setNameHe(e.target.value)}
              required
              fullWidth
              placeholder="כיסוי עבודה בגובה"
            />
          </Box>

          <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={2}>
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

          <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
            <FormControl fullWidth>
              <InputLabel>שלב עדיפות</InputLabel>
              <Select
                value={priority}
                label="שלב עדיפות"
                onChange={(e) => setPriority(e.target.value)}
              >
                {PRIORITY_PHASES.map((phase) => (
                  <MenuItem key={phase.value} value={phase.value}>
                    <Box>
                      <Typography variant="body2">{phase.label}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {phase.description}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControlLabel
              control={
                <Switch
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
              }
              label="כלל פעיל"
            />
          </Box>

          {/* Conditions */}
          <Divider />
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle2" color="text.secondary">
              תנאים (IF)
            </Typography>
            <Button startIcon={<AddIcon />} size="small" onClick={addCondition}>
              הוסף תנאי
            </Button>
          </Box>
          <Typography variant="caption" color="text.secondary">
            הכלל יופעל רק אם כל התנאים מתקיימים
          </Typography>

          {conditions.length === 0 ? (
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography color="text.secondary">אין תנאים</Typography>
                <Button
                  startIcon={<AddIcon />}
                  size="small"
                  onClick={addCondition}
                  sx={{ mt: 1 }}
                >
                  הוסף תנאי ראשון
                </Button>
              </CardContent>
            </Card>
          ) : (
            conditions.map((condition, index) => (
              <Card key={index} variant="outlined">
                <CardContent>
                  <Box display="grid" gridTemplateColumns="1fr 1fr 1fr auto" gap={2}>
                    <FormControl size="small" fullWidth>
                      <InputLabel>שדה</InputLabel>
                      <Select
                        value={condition.field}
                        label="שדה"
                        onChange={(e) => updateCondition(index, 'field', e.target.value)}
                      >
                        {allQuestions.map((q) => (
                          <MenuItem key={q.questionId} value={q.questionId}>
                            {q.labelHe}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl size="small" fullWidth>
                      <InputLabel>אופרטור</InputLabel>
                      <Select
                        value={condition.operator}
                        label="אופרטור"
                        onChange={(e) => updateCondition(index, 'operator', e.target.value)}
                      >
                        {OPERATORS.map((op) => (
                          <MenuItem key={op.value} value={op.value}>
                            {op.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <TextField
                      label="ערך"
                      value={String(condition.value)}
                      onChange={(e) => {
                        let value: unknown = e.target.value;
                        if (value === 'true') value = true;
                        else if (value === 'false') value = false;
                        else if (!isNaN(Number(value)) && value !== '')
                          value = Number(value);
                        updateCondition(index, 'value', value);
                      }}
                      size="small"
                      fullWidth
                      helperText="true/false לערכים בוליאניים"
                    />
                    <IconButton color="error" onClick={() => removeCondition(index)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            ))
          )}

          {/* Actions */}
          <Divider />
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle2" color="text.secondary">
              פעולות (THEN)
            </Typography>
            <Button startIcon={<AddIcon />} size="small" onClick={addAction}>
              הוסף פעולה
            </Button>
          </Box>

          {actions.length === 0 ? (
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography color="text.secondary">אין פעולות</Typography>
                <Button
                  startIcon={<AddIcon />}
                  size="small"
                  onClick={addAction}
                  sx={{ mt: 1 }}
                >
                  הוסף פעולה ראשונה
                </Button>
              </CardContent>
            </Card>
          ) : (
            actions.map((action, index) => (
              <Card key={index} variant="outlined">
                <CardContent>
                  <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2} mb={2}>
                    <FormControl size="small" fullWidth>
                      <InputLabel>סוג פעולה</InputLabel>
                      <Select
                        value={action.type}
                        label="סוג פעולה"
                        onChange={(e) => updateAction(index, 'type', e.target.value)}
                      >
                        {ACTION_TYPES.map((t) => (
                          <MenuItem key={t.value} value={t.value}>
                            {t.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl size="small" fullWidth>
                      <InputLabel>סוג פוליסה</InputLabel>
                      <Select
                        value={action.policyType || ''}
                        label="סוג פוליסה"
                        onChange={(e) => updateAction(index, 'policyType', e.target.value)}
                      >
                        {POLICY_TYPES.map((p) => (
                          <MenuItem key={p.value} value={p.value}>
                            {p.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>

                  <Box display="grid" gridTemplateColumns="1fr 1fr 1fr auto" gap={2}>
                    {(action.type === 'adjustLimit' || action.type === 'addPolicy') && (
                      <TextField
                        label="מכפיל"
                        value={action.multiplier || ''}
                        onChange={(e) =>
                          updateAction(index, 'multiplier', parseFloat(e.target.value) || 1)
                        }
                        type="number"
                        inputProps={{ step: 0.1, min: 0 }}
                        size="small"
                        fullWidth
                        helperText="1.5 = +50%"
                      />
                    )}

                    {action.type === 'addPolicy' && (
                      <TextField
                        label="סכום"
                        value={action.amount || ''}
                        onChange={(e) =>
                          updateAction(index, 'amount', parseInt(e.target.value, 10) || 0)
                        }
                        type="number"
                        size="small"
                        fullWidth
                      />
                    )}

                    {action.type === 'addEndorsement' && (
                      <TextField
                        label="הרחבה"
                        value={action.endorsement || ''}
                        onChange={(e) => updateAction(index, 'endorsement', e.target.value)}
                        size="small"
                        fullWidth
                        placeholder="עבודה בגובה"
                      />
                    )}

                    {action.type === 'setMandatory' && (
                      <FormControlLabel
                        control={
                          <Switch
                            checked={action.mandatory !== false}
                            onChange={(e) => updateAction(index, 'mandatory', e.target.checked)}
                          />
                        }
                        label="חובה"
                      />
                    )}

                    <IconButton color="error" onClick={() => removeAction(index)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            ))
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>ביטול</Button>
        <Button onClick={handleSave} variant="contained" disabled={!isValid}>
          שמור
        </Button>
      </DialogActions>
    </Dialog>
  );
}
