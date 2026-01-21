'use client';

import {
  Save as SaveIcon,
  Send as SendIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Stepper,
  Step,
  StepLabel,
  Chip,
  InputAdornment,
} from '@mui/material';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';

import {
  rfqApi,
  type Client,
  type Questionnaire,
  type QuestionnaireAnswers,
  type Question,
} from '@/lib/api';

export default function QuestionnairePage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.clientId as string;

  const [client, setClient] = useState<Client | null>(null);
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);
  const [answers, setAnswers] = useState<QuestionnaireAnswers>({});
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        // Load client
        const clientResponse = await rfqApi.clients.get(clientId);
        if (!clientResponse.success || !clientResponse.data) {
          setError('Client not found');
          setLoading(false);
          return;
        }
        setClient(clientResponse.data);

        // Load questionnaire template for client's sector
        const templateResponse = await rfqApi.questionnaire.getTemplate(clientResponse.data.sector);
        if (templateResponse.success && templateResponse.data) {
          setQuestionnaire(templateResponse.data);
        } else {
          setError('Failed to load questionnaire template');
        }
      } catch (err) {
        setError('Failed to load data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [clientId]);

  const handleAnswerChange = useCallback((questionId: string, value: QuestionnaireAnswers[string]) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  }, []);

  const shouldShowQuestion = useCallback(
    (question: Question): boolean => {
      if (!question.showIf || question.showIf.length === 0) return true;

      return question.showIf.every((condition) => {
        const value = answers[condition.questionId];
        if (value === undefined || value === null) return false;

        switch (condition.operator) {
          case 'equals':
            return value === condition.value;
          case 'notEquals':
            return value !== condition.value;
          case 'greaterThan':
            return typeof value === 'number' && value > (condition.value as number);
          case 'lessThan':
            return typeof value === 'number' && value < (condition.value as number);
          case 'contains':
            return Array.isArray(value) && value.includes(condition.value as string);
          case 'in':
            return Array.isArray(condition.value) && condition.value.includes(value as string);
          default:
            return true;
        }
      });
    },
    [answers]
  );

  const handleSave = async (submit = false) => {
    setSaving(true);
    setError(null);
    try {
      if (submit) {
        await rfqApi.questionnaire.submit(clientId, answers);
        router.push(`/rfq/documents/${clientId}?answers=${encodeURIComponent(JSON.stringify(answers))}`);
      } else {
        await rfqApi.questionnaire.save(clientId, answers);
      }
    } catch (err) {
      setError('Failed to save questionnaire');
    } finally {
      setSaving(false);
    }
  };

  const handleNext = () => {
    if (questionnaire && activeStep < questionnaire.sections.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const renderQuestion = (question: Question) => {
    if (!shouldShowQuestion(question)) return null;

    const value = answers[question.id];

    switch (question.type) {
      case 'text':
        return (
          <TextField
            fullWidth
            label={question.labelHe}
            placeholder={question.placeholderHe || question.placeholder}
            value={(value as string) || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            required={question.required}
            helperText={question.descriptionHe || question.description}
          />
        );

      case 'number':
        return (
          <TextField
            fullWidth
            type="number"
            label={question.labelHe}
            placeholder={question.placeholderHe || question.placeholder}
            value={value !== undefined && value !== null ? value : ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value ? Number(e.target.value) : null)}
            required={question.required}
            inputProps={{ min: question.min, max: question.max }}
            helperText={question.descriptionHe || question.description}
          />
        );

      case 'currency':
        return (
          <TextField
            fullWidth
            type="number"
            label={question.labelHe}
            placeholder={question.placeholderHe || question.placeholder}
            value={value !== undefined && value !== null ? value : ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value ? Number(e.target.value) : null)}
            required={question.required}
            InputProps={{
              startAdornment: <InputAdornment position="start">₪</InputAdornment>,
            }}
            inputProps={{ min: question.min, max: question.max }}
            helperText={question.descriptionHe || question.description}
          />
        );

      case 'select':
        return (
          <FormControl fullWidth required={question.required}>
            <InputLabel>{question.labelHe}</InputLabel>
            <Select
              value={(value as string) || ''}
              label={question.labelHe}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            >
              {question.options?.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.labelHe}
                </MenuItem>
              ))}
            </Select>
            {(question.descriptionHe || question.description) && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                {question.descriptionHe || question.description}
              </Typography>
            )}
          </FormControl>
        );

      case 'multiselect': {
        const selectedValues = (value as string[]) || [];
        return (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              {question.labelHe}
              {question.required && ' *'}
            </Typography>
            {(question.descriptionHe || question.description) && (
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {question.descriptionHe || question.description}
              </Typography>
            )}
            <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
              {question.options?.map((option) => (
                <Chip
                  key={option.value}
                  label={option.labelHe}
                  onClick={() => {
                    const newValues = selectedValues.includes(option.value)
                      ? selectedValues.filter((v) => v !== option.value)
                      : [...selectedValues, option.value];
                    handleAnswerChange(question.id, newValues);
                  }}
                  color={selectedValues.includes(option.value) ? 'primary' : 'default'}
                  variant={selectedValues.includes(option.value) ? 'filled' : 'outlined'}
                />
              ))}
            </Box>
          </Box>
        );
      }

      case 'boolean':
        return (
          <FormControlLabel
            control={
              <Checkbox
                checked={(value as boolean) || false}
                onChange={(e) => handleAnswerChange(question.id, e.target.checked)}
              />
            }
            label={
              <Box>
                <Typography>{question.labelHe}</Typography>
                {(question.descriptionHe || question.description) && (
                  <Typography variant="caption" color="text.secondary">
                    {question.descriptionHe || question.description}
                  </Typography>
                )}
              </Box>
            }
          />
        );

      case 'date':
        return (
          <TextField
            fullWidth
            type="date"
            label={question.labelHe}
            value={(value as string) || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            required={question.required}
            InputLabelProps={{ shrink: true }}
            helperText={question.descriptionHe || question.description}
          />
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !client || !questionnaire) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || 'Failed to load questionnaire'}
        </Alert>
        <Button component={Link} href="/rfq/clients" variant="outlined" startIcon={<ArrowBackIcon />}>
          חזרה לרשימת לקוחות
        </Button>
      </Box>
    );
  }

  const currentSection = questionnaire.sections[activeStep];
  if (!currentSection) {
    return (
      <Box>
        <Alert severity="error">Invalid questionnaire section</Alert>
      </Box>
    );
  }
  const visibleQuestions = currentSection.questions.filter(shouldShowQuestion);

  return (
    <Box>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link href="/rfq" style={{ textDecoration: 'none', color: 'inherit' }}>
          לוח בקרה
        </Link>
        <Link href="/rfq/clients" style={{ textDecoration: 'none', color: 'inherit' }}>
          לקוחות
        </Link>
        <Link href={`/rfq/clients/${client.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          {client.name}
        </Link>
        <Typography color="text.primary">שאלון</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            שאלון סיכונים - {client.name}
          </Typography>
          <Typography color="text.secondary">
            Risk Questionnaire
          </Typography>
        </Box>
        <Button
          component={Link}
          href={`/rfq/clients/${client.id}`}
          variant="outlined"
          startIcon={<ArrowBackIcon />}
        >
          חזרה ללקוח
        </Button>
      </Box>

      {/* Stepper */}
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {questionnaire.sections.map((section, index) => (
          <Step key={section.id}>
            <StepLabel
              onClick={() => setActiveStep(index)}
              sx={{ cursor: 'pointer' }}
            >
              {section.titleHe}
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Current Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            {currentSection.titleHe}
          </Typography>
          {currentSection.descriptionHe && (
            <Typography color="text.secondary" gutterBottom>
              {currentSection.descriptionHe}
            </Typography>
          )}
          <Box mt={3}>
            <Grid container spacing={3}>
              {visibleQuestions.map((question) => (
                <Grid item xs={12} md={question.type === 'boolean' ? 12 : 6} key={question.id}>
                  {renderQuestion(question)}
                </Grid>
              ))}
            </Grid>
          </Box>
        </CardContent>
      </Card>

      {/* Navigation */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Button
          variant="outlined"
          startIcon={<ArrowForwardIcon />}
          onClick={handleBack}
          disabled={activeStep === 0}
        >
          הקודם
        </Button>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<SaveIcon />}
            onClick={() => handleSave(false)}
            disabled={saving}
          >
            שמור טיוטה
          </Button>
          {activeStep === questionnaire.sections.length - 1 ? (
            <Button
              variant="contained"
              endIcon={<SendIcon />}
              onClick={() => handleSave(true)}
              disabled={saving}
            >
              {saving ? 'שומר...' : 'סיום ויצירת מסמך'}
            </Button>
          ) : (
            <Button
              variant="contained"
              endIcon={<ArrowBackIcon />}
              onClick={handleNext}
            >
              הבא
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
}
