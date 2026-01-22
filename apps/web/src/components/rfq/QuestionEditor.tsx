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
  Chip,
  Autocomplete,
  Divider,
} from '@mui/material';
import { useState, useEffect } from 'react';

import type { QuestionAdmin, QuestionOption, QuestionCondition } from '@/lib/api';

interface QuestionEditorProps {
  open: boolean;
  onClose: () => void;
  question: QuestionAdmin | null;
  onSave: (data: Omit<QuestionAdmin, 'id' | 'sectionId' | 'createdAt' | 'updatedAt'>) => void;
  allQuestions: QuestionAdmin[];
}

const QUESTION_TYPES = [
  { value: 'text', label: 'טקסט', labelEn: 'Text' },
  { value: 'number', label: 'מספר', labelEn: 'Number' },
  { value: 'boolean', label: 'כן/לא', labelEn: 'Boolean' },
  { value: 'select', label: 'בחירה', labelEn: 'Select' },
  { value: 'multiselect', label: 'בחירה מרובה', labelEn: 'Multi-select' },
  { value: 'date', label: 'תאריך', labelEn: 'Date' },
  { value: 'currency', label: 'סכום כסף', labelEn: 'Currency' },
];

const OPERATORS = [
  { value: 'equals', label: 'שווה ל' },
  { value: 'notEquals', label: 'שונה מ' },
  { value: 'greaterThan', label: 'גדול מ' },
  { value: 'lessThan', label: 'קטן מ' },
  { value: 'contains', label: 'מכיל' },
  { value: 'in', label: 'אחד מ' },
];

const POLICY_TYPES = [
  'GENERAL_LIABILITY',
  'EMPLOYER_LIABILITY',
  'PROFESSIONAL_INDEMNITY',
  'CYBER_LIABILITY',
  'CAR_INSURANCE',
  'PROPERTY_INSURANCE',
  'D&O_LIABILITY',
  'PRODUCT_LIABILITY',
];

export function QuestionEditor({
  open,
  onClose,
  question,
  onSave,
  allQuestions,
}: QuestionEditorProps) {
  const [questionId, setQuestionId] = useState('');
  const [label, setLabel] = useState('');
  const [labelHe, setLabelHe] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionHe, setDescriptionHe] = useState('');
  const [type, setType] = useState<QuestionAdmin['type']>('text');
  const [options, setOptions] = useState<QuestionOption[]>([]);
  const [placeholder, setPlaceholder] = useState('');
  const [placeholderHe, setPlaceholderHe] = useState('');
  const [required, setRequired] = useState(false);
  const [min, setMin] = useState<string>('');
  const [max, setMax] = useState<string>('');
  const [showIf, setShowIf] = useState<QuestionCondition[]>([]);
  const [riskWeight, setRiskWeight] = useState<string>('');
  const [policyAffinity, setPolicyAffinity] = useState<string[]>([]);

  useEffect(() => {
    if (question) {
      setQuestionId(question.questionId);
      setLabel(question.label);
      setLabelHe(question.labelHe);
      setDescription(question.description || '');
      setDescriptionHe(question.descriptionHe || '');
      setType(question.type);
      setOptions(question.options || []);
      setPlaceholder(question.placeholder || '');
      setPlaceholderHe(question.placeholderHe || '');
      setRequired(question.required);
      setMin(question.min?.toString() || '');
      setMax(question.max?.toString() || '');
      setShowIf(question.showIf || []);
      setRiskWeight(question.riskWeight?.toString() || '');
      setPolicyAffinity(question.policyAffinity || []);
    } else {
      setQuestionId('');
      setLabel('');
      setLabelHe('');
      setDescription('');
      setDescriptionHe('');
      setType('text');
      setOptions([]);
      setPlaceholder('');
      setPlaceholderHe('');
      setRequired(false);
      setMin('');
      setMax('');
      setShowIf([]);
      setRiskWeight('');
      setPolicyAffinity([]);
    }
  }, [question, open]);

  const handleSave = () => {
    onSave({
      questionId,
      label,
      labelHe,
      description: description || undefined,
      descriptionHe: descriptionHe || undefined,
      type,
      options: options.length > 0 ? options : undefined,
      placeholder: placeholder || undefined,
      placeholderHe: placeholderHe || undefined,
      required,
      order: question?.order || 0,
      min: min ? parseFloat(min) : undefined,
      max: max ? parseFloat(max) : undefined,
      showIf: showIf.length > 0 ? showIf : undefined,
      riskWeight: riskWeight ? parseFloat(riskWeight) : undefined,
      policyAffinity,
    });
  };

  const addOption = () => {
    setOptions([...options, { value: '', label: '', labelHe: '' }]);
  };

  const updateOption = (index: number, field: keyof QuestionOption, value: string) => {
    const newOptions = [...options];
    const current = newOptions[index];
    if (!current) return;
    newOptions[index] = {
      value: current.value,
      label: current.label,
      labelHe: current.labelHe,
      [field]: value,
    };
    setOptions(newOptions);
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const addCondition = () => {
    setShowIf([...showIf, { questionId: '', operator: 'equals', value: '' }]);
  };

  const updateCondition = (index: number, field: keyof QuestionCondition, value: unknown) => {
    const newConditions = [...showIf];
    const current = newConditions[index];
    if (!current) return;
    newConditions[index] = {
      questionId: current.questionId,
      operator: current.operator,
      value: current.value,
      [field]: value,
    } as QuestionCondition;
    setShowIf(newConditions);
  };

  const removeCondition = (index: number) => {
    setShowIf(showIf.filter((_, i) => i !== index));
  };

  const isValid = questionId && label && labelHe;
  const showOptions = type === 'select' || type === 'multiselect';
  const showMinMax = type === 'number' || type === 'currency';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{question ? 'עריכת שאלה' : 'הוספת שאלה'}</DialogTitle>
      <DialogContent>
        <Box display="grid" gap={3} sx={{ pt: 2 }}>
          {/* Basic Info */}
          <Typography variant="subtitle2" color="text.secondary">
            פרטי שאלה
          </Typography>
          <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={2}>
            <TextField
              label="מזהה שאלה"
              value={questionId}
              onChange={(e) => setQuestionId(e.target.value.replace(/\s/g, ''))}
              required
              fullWidth
              placeholder="employeeCount"
              helperText="מזהה ייחודי לשאלה (ללא רווחים)"
            />
            <FormControl fullWidth required>
              <InputLabel>סוג שאלה</InputLabel>
              <Select
                value={type}
                label="סוג שאלה"
                onChange={(e) => setType(e.target.value as QuestionAdmin['type'])}
              >
                {QUESTION_TYPES.map((t) => (
                  <MenuItem key={t.value} value={t.value}>
                    {t.label} ({t.labelEn})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={2}>
            <TextField
              label="תווית (באנגלית)"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              required
              fullWidth
            />
            <TextField
              label="תווית (בעברית)"
              value={labelHe}
              onChange={(e) => setLabelHe(e.target.value)}
              required
              fullWidth
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

          <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={2}>
            <TextField
              label="Placeholder (באנגלית)"
              value={placeholder}
              onChange={(e) => setPlaceholder(e.target.value)}
              fullWidth
            />
            <TextField
              label="Placeholder (בעברית)"
              value={placeholderHe}
              onChange={(e) => setPlaceholderHe(e.target.value)}
              fullWidth
            />
          </Box>

          <FormControlLabel
            control={<Switch checked={required} onChange={(e) => setRequired(e.target.checked)} />}
            label="שדה חובה"
          />

          {/* Min/Max for number types */}
          {showMinMax && (
            <>
              <Divider />
              <Typography variant="subtitle2" color="text.secondary">
                טווח ערכים
              </Typography>
              <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
                <TextField
                  label="ערך מינימלי"
                  value={min}
                  onChange={(e) => setMin(e.target.value)}
                  type="number"
                  fullWidth
                />
                <TextField
                  label="ערך מקסימלי"
                  value={max}
                  onChange={(e) => setMax(e.target.value)}
                  type="number"
                  fullWidth
                />
              </Box>
            </>
          )}

          {/* Options for select types */}
          {showOptions && (
            <>
              <Divider />
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle2" color="text.secondary">
                  אפשרויות בחירה
                </Typography>
                <Button startIcon={<AddIcon />} size="small" onClick={addOption}>
                  הוסף אפשרות
                </Button>
              </Box>
              {options.map((option, index) => (
                <Box key={index} display="grid" gridTemplateColumns="1fr 1fr 1fr auto" gap={2}>
                  <TextField
                    label="ערך"
                    value={option.value}
                    onChange={(e) => updateOption(index, 'value', e.target.value)}
                    size="small"
                    fullWidth
                  />
                  <TextField
                    label="תווית (אנגלית)"
                    value={option.label}
                    onChange={(e) => updateOption(index, 'label', e.target.value)}
                    size="small"
                    fullWidth
                  />
                  <TextField
                    label="תווית (עברית)"
                    value={option.labelHe}
                    onChange={(e) => updateOption(index, 'labelHe', e.target.value)}
                    size="small"
                    fullWidth
                  />
                  <IconButton color="error" onClick={() => removeOption(index)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
            </>
          )}

          {/* Conditional Display */}
          <Divider />
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle2" color="text.secondary">
              תנאי תצוגה (אופציונלי)
            </Typography>
            <Button startIcon={<AddIcon />} size="small" onClick={addCondition}>
              הוסף תנאי
            </Button>
          </Box>
          <Typography variant="caption" color="text.secondary">
            השאלה תוצג רק אם כל התנאים מתקיימים
          </Typography>
          {showIf.map((condition, index) => (
            <Box key={index} display="grid" gridTemplateColumns="1fr 1fr 1fr auto" gap={2}>
              <FormControl size="small" fullWidth>
                <InputLabel>שאלה</InputLabel>
                <Select
                  value={condition.questionId}
                  label="שאלה"
                  onChange={(e) => updateCondition(index, 'questionId', e.target.value)}
                >
                  {allQuestions
                    .filter((q) => q.questionId !== questionId)
                    .map((q) => (
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
                  else if (!isNaN(Number(value)) && value !== '') value = Number(value);
                  updateCondition(index, 'value', value);
                }}
                size="small"
                fullWidth
                helperText="true/false למשתנים בוליאניים"
              />
              <IconButton color="error" onClick={() => removeCondition(index)}>
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}

          {/* Risk Weight */}
          <Divider />
          <Typography variant="subtitle2" color="text.secondary">
            משקל סיכון ושיוך לפוליסות
          </Typography>
          <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={2}>
            <TextField
              label="משקל סיכון"
              value={riskWeight}
              onChange={(e) => setRiskWeight(e.target.value)}
              type="number"
              inputProps={{ step: 0.01, min: -1, max: 1 }}
              fullWidth
              helperText="ערך בין -1 ל-1. ערך שלילי מפחית סיכון"
            />
            <Autocomplete
              multiple
              options={POLICY_TYPES}
              value={policyAffinity}
              onChange={(_, newValue) => setPolicyAffinity(newValue)}
              renderInput={(params) => (
                <TextField {...params} label="פוליסות מושפעות" />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    {...getTagProps({ index })}
                    key={option}
                    label={option}
                    size="small"
                  />
                ))
              }
            />
          </Box>
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
