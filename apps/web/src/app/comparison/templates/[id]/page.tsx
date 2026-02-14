'use client';

import {
  ArrowBack as BackIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Star as MandatoryIcon,
} from '@mui/icons-material';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  Typography,
  Alert,
} from '@mui/material';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { comparisonApi, type ComparisonTemplate, type ComparisonRequirement } from '@/lib/api';

// Endorsement codes map (mirror of backend ENDORSEMENT_CODES)
const ENDORSEMENT_CODES: Record<string, { he: string; en: string }> = {
  '301': { he: 'אובדן מסמכים', en: 'Loss of documents' },
  '302': { he: 'אחריות צולבת', en: 'Cross liability' },
  '303': { he: 'דיבה, השמצה והוצאת לשון הרע', en: 'Defamation and libel' },
  '304': { he: 'הרחב שיפוי', en: 'Extended indemnification' },
  '305': { he: 'הרחבת כלי ירייה המוחזק כדין', en: 'Firearms extension' },
  '306': { he: 'הרחבת צד ג\' - נזק בעת שהות זמנית בחו"ל', en: 'Third party abroad extension' },
  '307': { he: 'הרחבת צד ג\' - קבלנים וקבלני משנה', en: 'Contractors and subcontractors extension' },
  '308': { he: 'ויתור על תחלוף לטובת גורם אחר', en: 'Waiver of subrogation for other party' },
  '309': { he: 'ויתור על תחלוף לטובת מבקש האישור', en: 'Waiver of subrogation for certificate requester' },
  '310': { he: 'כיסוי למשווקים במסגרת חבות מוצר', en: 'Marketers coverage in product liability' },
  '311': { he: 'כיסוי אובדן תוצאתי בגין נזק לרכוש', en: 'Consequential loss coverage' },
  '312': { he: 'כיסוי בגין נזק גוף משימוש בצמ"ה', en: 'Bodily injury from heavy equipment' },
  '313': { he: 'כיסוי בגין נזקי טבע', en: 'Natural disaster coverage' },
  '314': { he: 'כיסוי גניבה פריצה ושוד', en: 'Theft, burglary and robbery' },
  '315': { he: 'כיסוי לתביעות המל"ל', en: 'National Insurance claims coverage' },
  '316': { he: 'כיסוי רעידת אדמה', en: 'Earthquake coverage' },
  '317': { he: 'מבוטח נוסף - אחר', en: 'Additional insured - other' },
  '318': { he: 'מבוטח נוסף - מבקש האישור', en: 'Additional insured - certificate requester' },
  '319': { he: 'מבוטח נוסף - כמעבידם של עובדי המבוטח', en: 'Additional insured - as employer' },
  '320': { he: 'מבוטח נוסף בגין מעשי המבוטח - אחר', en: 'Additional insured for insured acts - other' },
  '321': { he: 'מבוטח נוסף בגין מעשי המבוטח - מבקש האישור', en: 'Additional insured for insured acts - requester' },
  '322': { he: 'מבקש האישור מוגדר כצד ג\'', en: 'Requester defined as third party' },
  '323': { he: 'מוטב לתגמולי ביטוח - אחר', en: 'Insurance beneficiary - other' },
  '324': { he: 'מוטב לתגמולי ביטוח - מבקש האישור', en: 'Insurance beneficiary - requester' },
  '325': { he: 'מרמה ואי יושר עובדים', en: 'Employee fraud and dishonesty' },
  '326': { he: 'פגיעה בפרטיות במסגרת אחריות מקצועית', en: 'Privacy breach in professional liability' },
  '327': { he: 'עיכוב/שיהוי עקב מקרה ביטוח', en: 'Delay due to insurance event' },
  '328': { he: 'ראשוניות - המבטח מוותר על דרישה ממבטח מבקש האישור', en: 'Primary - insurer waives claims against requester insurer' },
  '329': { he: 'רכוש מבקש האישור ייחשב כצד ג\'', en: 'Requester property considered third party' },
  '330': { he: 'שעבוד לטובת גורם אחר', en: 'Lien for other party' },
  '331': { he: 'שעבוד לטובת מבקש האישור', en: 'Lien for certificate requester' },
  '332': { he: 'תקופת גילוי', en: 'Discovery period' },
  '333': { he: 'גבול האחריות לטובת ההתקשרות בלבד', en: 'Limit for contract only' },
  '334': { he: 'תקופת תחזוקה', en: 'Maintenance period' },
  '335': { he: 'תקופת שיפוי', en: 'Indemnification period' },
  '336': { he: 'ביטול חריג אחריות מקצועית בצד ג\'', en: 'Cancel professional liability exclusion in TPL' },
  '337': { he: 'ביטול חריג חבות מוצר בצד ג\'', en: 'Cancel product liability exclusion in TPL' },
  '338': { he: 'הרחבת כיסוי על בסיס ערך כינון', en: 'Replacement value coverage' },
  '339': { he: 'הרחבה לסיכון סייבר', en: 'Cyber risk extension' },
  '340': { he: 'הרחבת רעידות והחלשת משען', en: 'Vibration and weakening of support' },
  '341': { he: 'הרחבת נזק עקיף למתקנים תת קרקעיים', en: 'Indirect damage to underground facilities' },
  '342': { he: 'הרחבת מעבידים - כלי ירייה', en: 'Employer extension - firearms' },
  '343': { he: 'הרחבת הכיסוי לנזקים בעת פריקה וטעינה', en: 'Loading/unloading coverage' },
  '344': { he: 'הרחבת הכיסוי לעבודות בגובה', en: 'Working at heights coverage' },
  '345': { he: 'הרחבה לנזק בגין פרעות ושביתות', en: 'Riots and strikes coverage' },
  '346': { he: 'הרחבה לנזקי חשמל', en: 'Electrical damage coverage' },
  '347': { he: 'הרחבת שם המבוטח בביטוח חבות מוצר', en: 'Insured name extension in product liability' },
  '348': { he: 'ביטול סייג רכוש עליו פעלו במישרין', en: 'Cancel direct work on property exclusion' },
  '349': { he: 'ביטול סייג רכוש בשליטה בחזקה ופיקוח', en: 'Cancel property in care custody control exclusion' },
  '350': { he: 'הרחבת חבות כלפי קבלנים בחבות מעבידים', en: 'Contractor liability in employer coverage' },
};

function formatCurrency(amount: number | undefined | null): string {
  if (amount == null) return '—';
  return `₪${amount.toLocaleString()}`;
}

function getEndorsementLabel(code: string): string {
  const entry = ENDORSEMENT_CODES[code];
  return entry ? `${entry.he} (${code})` : code;
}

function BooleanFlag({ value, label }: { value: boolean; label: string }) {
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, mr: 2 }}>
      {value ? (
        <CheckIcon sx={{ fontSize: 18, color: 'success.main' }} />
      ) : (
        <CancelIcon sx={{ fontSize: 18, color: 'grey.400' }} />
      )}
      <Typography variant="body2" color={value ? 'text.primary' : 'text.secondary'}>
        {label}
      </Typography>
    </Box>
  );
}

function RequirementCard({ requirement }: { requirement: ComparisonRequirement }) {
  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        {/* Header: Policy Type + Mandatory badge */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              {requirement.policyTypeHe}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {requirement.policyType}
            </Typography>
          </Box>
          {requirement.isMandatory && (
            <Chip
              icon={<MandatoryIcon sx={{ fontSize: 16 }} />}
              label="חובה"
              size="small"
              color="error"
              variant="outlined"
            />
          )}
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Limits */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {requirement.minimumLimitPerPeriod != null && requirement.minimumLimitPerPeriod > 0 && (
            <Grid item xs={6} sm={4}>
              <Typography variant="caption" color="text.secondary">
                גבול אחריות לתקופה
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {formatCurrency(requirement.minimumLimitPerPeriod)}
              </Typography>
            </Grid>
          )}
          {requirement.minimumLimitPerOccurrence != null && requirement.minimumLimitPerOccurrence > 0 && (
            <Grid item xs={6} sm={4}>
              <Typography variant="caption" color="text.secondary">
                גבול אחריות למקרה
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {formatCurrency(requirement.minimumLimitPerOccurrence)}
              </Typography>
            </Grid>
          )}
          {requirement.minimumLimit > 0 && (
            <Grid item xs={6} sm={4}>
              <Typography variant="caption" color="text.secondary">
                גבול אחריות מינימלי
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {formatCurrency(requirement.minimumLimit)}
              </Typography>
            </Grid>
          )}
          {requirement.maximumDeductible != null && (
            <Grid item xs={6} sm={4}>
              <Typography variant="caption" color="text.secondary">
                השתתפות עצמית מקסימלית
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {formatCurrency(requirement.maximumDeductible)}
              </Typography>
            </Grid>
          )}
        </Grid>

        {/* Flags */}
        <Box sx={{ mb: 2 }}>
          <BooleanFlag value={requirement.requireAdditionalInsured} label="מבוטח נוסף" />
          <BooleanFlag value={requirement.requireWaiverSubrogation} label="ויתור על תחלוף" />
        </Box>

        {/* Endorsements */}
        {requirement.requiredEndorsements && requirement.requiredEndorsements.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              הרחבות נדרשות ({requirement.requiredEndorsements.length})
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
              {requirement.requiredEndorsements.map((code) => (
                <Chip
                  key={code}
                  label={getEndorsementLabel(code)}
                  size="small"
                  variant="outlined"
                  color="primary"
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Notes */}
        {(requirement.notesHe || requirement.notes) && (
          <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {requirement.notesHe || requirement.notes}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export default function TemplateDetailPage() {
  const params = useParams();
  const templateId = params.id as string;

  const [template, setTemplate] = useState<ComparisonTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTemplate();
  }, [templateId]);

  const loadTemplate = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await comparisonApi.templates.get(templateId);
      if (response.success && response.data) {
        setTemplate(response.data);
      } else {
        setError('התבנית לא נמצאה');
      }
    } catch (err) {
      setError('שגיאה בטעינת התבנית');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LinearProgress />;

  if (error || !template) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 3 }}>{error || 'התבנית לא נמצאה'}</Alert>
        <IconButton component={Link} href="/comparison/templates">
          <BackIcon />
        </IconButton>
      </Box>
    );
  }

  const mandatoryCount = template.requirements?.filter((r) => r.isMandatory).length || 0;

  return (
    <Box>
      {/* Header */}
      <Box display="flex" alignItems="center" gap={2} mb={4}>
        <IconButton component={Link} href="/comparison/templates">
          <BackIcon />
        </IconButton>
        <Box flexGrow={1}>
          <Typography variant="h4" sx={{ fontWeight: 600, color: '#1D1D1F' }}>
            {template.nameHe}
          </Typography>
          <Typography variant="body2" sx={{ color: '#86868B' }}>
            {template.name}
          </Typography>
        </Box>
      </Box>

      {/* Template Info Card */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          {template.descriptionHe && (
            <Typography variant="body1" sx={{ mb: 2 }}>
              {template.descriptionHe}
            </Typography>
          )}
          {template.description && !template.descriptionHe && (
            <Typography variant="body1" sx={{ mb: 2 }}>
              {template.description}
            </Typography>
          )}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {template.sector && (
              <Chip label={template.sector} size="small" variant="outlined" />
            )}
            {template.contractType && (
              <Chip label={template.contractType} size="small" variant="outlined" />
            )}
            <Chip
              label={`${template.requirements?.length || 0} דרישות`}
              size="small"
              color="primary"
            />
            {mandatoryCount > 0 && (
              <Chip
                label={`${mandatoryCount} חובה`}
                size="small"
                color="error"
                variant="outlined"
              />
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Requirements */}
      <Typography variant="h5" fontWeight={600} gutterBottom>
        דרישות פוליסה ({template.requirements?.length || 0})
      </Typography>

      {template.requirements && template.requirements.length > 0 ? (
        template.requirements.map((req) => (
          <RequirementCard key={req.id} requirement={req} />
        ))
      ) : (
        <Alert severity="info">לא הוגדרו דרישות לתבנית זו</Alert>
      )}
    </Box>
  );
}
