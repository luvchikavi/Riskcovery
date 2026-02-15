'use client';

import {
  Save as SaveIcon,
  Send as SendIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon,
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
  LinearProgress,
  Snackbar,
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
  type QuestionnaireSection,
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
  const [savedNotification, setSavedNotification] = useState(false);
  const [hasExistingAnswers, setHasExistingAnswers] = useState(false);

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

        // Try to load existing questionnaire answers
        try {
          const existingResponse = await rfqApi.questionnaire.getByClient(clientId);
          if (
            existingResponse.success &&
            existingResponse.data &&
            existingResponse.data.length > 0
          ) {
            // Get the most recent draft or the latest one
            const latestQuestionnaire = existingResponse.data.sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )[0];
            if (latestQuestionnaire && latestQuestionnaire.answers) {
              setAnswers(latestQuestionnaire.answers as QuestionnaireAnswers);
              setHasExistingAnswers(true);
            }
          }
        } catch (err: unknown) {
          console.warn('No existing questionnaire answers found:', err);
        }
      } catch (err: unknown) {
        setError('Failed to load data');
        console.error('Failed to load questionnaire data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [clientId]);

  const handleAnswerChange = useCallback(
    (questionId: string, value: QuestionnaireAnswers[string]) => {
      setAnswers((prev) => ({
        ...prev,
        [questionId]: value,
      }));
    },
    []
  );

  const evaluateConditions = useCallback(
    (conditions: Array<{ questionId: string; operator: string; value: unknown }>): boolean => {
      return conditions.every((condition) => {
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

  const shouldShowQuestion = useCallback(
    (question: Question): boolean => {
      if (!question.showIf || question.showIf.length === 0) return true;
      return evaluateConditions(question.showIf);
    },
    [evaluateConditions]
  );

  const shouldShowSection = useCallback(
    (section: QuestionnaireSection): boolean => {
      if (!section.showIf || section.showIf.length === 0) return true;
      return evaluateConditions(section.showIf);
    },
    [evaluateConditions]
  );

  // Compute visible sections
  const visibleSections = questionnaire ? questionnaire.sections.filter(shouldShowSection) : [];

  // Calculate progress
  const calculateProgress = useCallback(() => {
    if (!questionnaire) return { answered: 0, total: 0, percentage: 0 };

    let answered = 0;
    let total = 0;

    for (const section of questionnaire.sections.filter(shouldShowSection)) {
      for (const question of section.questions) {
        if (shouldShowQuestion(question)) {
          total++;
          const answer = answers[question.id];
          if (answer !== undefined && answer !== null && answer !== '') {
            if (Array.isArray(answer) && answer.length === 0) continue;
            answered++;
          }
        }
      }
    }

    return {
      answered,
      total,
      percentage: total > 0 ? Math.round((answered / total) * 100) : 0,
    };
  }, [questionnaire, answers, shouldShowQuestion, shouldShowSection]);

  // Validate required fields in current section
  const validateCurrentSection = useCallback(() => {
    if (!questionnaire) return { isValid: true, missingFields: [] };

    const currentSection = visibleSections[activeStep];
    if (!currentSection) return { isValid: true, missingFields: [] };

    const missingFields: string[] = [];

    for (const question of currentSection.questions) {
      if (shouldShowQuestion(question) && question.required) {
        const answer = answers[question.id];
        if (answer === undefined || answer === null || answer === '') {
          missingFields.push(question.labelHe);
        } else if (Array.isArray(answer) && answer.length === 0) {
          missingFields.push(question.labelHe);
        }
      }
    }

    return {
      isValid: missingFields.length === 0,
      missingFields,
    };
  }, [questionnaire, activeStep, answers, shouldShowQuestion]);

  const handleSave = async (submit = false) => {
    setSaving(true);
    setError(null);

    // Validate before submit
    if (submit) {
      const validation = validateCurrentSection();
      if (!validation.isValid) {
        setError(`יש למלא את השדות הבאים: ${validation.missingFields.join(', ')}`);
        setSaving(false);
        return;
      }
    }

    try {
      if (submit) {
        await rfqApi.questionnaire.submit(clientId, answers);
        router.push(
          `/rfq/documents/${clientId}?answers=${encodeURIComponent(JSON.stringify(answers))}`
        );
      } else {
        await rfqApi.questionnaire.save(clientId, answers);
        setSavedNotification(true);
      }
    } catch (err: unknown) {
      setError('Failed to save questionnaire');
      console.error('Failed to save questionnaire:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleNext = () => {
    if (activeStep < visibleSections.length - 1) {
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
            onChange={(e) =>
              handleAnswerChange(question.id, e.target.value ? Number(e.target.value) : null)
            }
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
            onChange={(e) =>
              handleAnswerChange(question.id, e.target.value ? Number(e.target.value) : null)
            }
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
        <Button
          component={Link}
          href="/rfq/clients"
          variant="outlined"
          startIcon={<ArrowBackIcon />}
        >
          חזרה לרשימת לקוחות
        </Button>
      </Box>
    );
  }

  const currentSection = visibleSections[activeStep];
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
        <Link
          href={`/rfq/clients/${client.id}`}
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
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
          <Typography color="text.secondary">Risk Questionnaire</Typography>
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

      {/* Progress Bar */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ py: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="body2" color="text.secondary">
              התקדמות השאלון
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              {hasExistingAnswers && (
                <Chip
                  icon={<CheckCircleIcon />}
                  label="נטען מטיוטה קודמת"
                  size="small"
                  color="info"
                  variant="outlined"
                />
              )}
              <Typography variant="body2" fontWeight="bold">
                {calculateProgress().answered}/{calculateProgress().total} שאלות (
                {calculateProgress().percentage}%)
              </Typography>
            </Box>
          </Box>
          <LinearProgress
            variant="determinate"
            value={calculateProgress().percentage}
            sx={{ height: 8, borderRadius: 1 }}
          />
        </CardContent>
      </Card>

      {/* Stepper */}
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {visibleSections.map((section, index) => (
          <Step key={section.id}>
            <StepLabel onClick={() => setActiveStep(index)} sx={{ cursor: 'pointer' }}>
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
          {activeStep === visibleSections.length - 1 ? (
            <Button
              variant="contained"
              endIcon={<SendIcon />}
              onClick={() => handleSave(true)}
              disabled={saving}
            >
              {saving ? 'שומר...' : 'סיום ויצירת מסמך'}
            </Button>
          ) : (
            <Button variant="contained" endIcon={<ArrowBackIcon />} onClick={handleNext}>
              הבא
            </Button>
          )}
        </Box>
      </Box>

      {/* Save Notification */}
      <Snackbar
        open={savedNotification}
        autoHideDuration={3000}
        onClose={() => setSavedNotification(false)}
        message="השאלון נשמר בהצלחה"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}
