'use client';

import {
  ExpandMore as ExpandMoreIcon,
  Security as SecurityIcon,
  Warning as WarningIcon,
  OpenInNew as OpenInNewIcon,
  QuestionAnswer as QuestionAnswerIcon,
  KeyboardArrowDown,
  KeyboardArrowUp,
} from '@mui/icons-material';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Collapse,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Tabs,
  Tab,
  Tooltip,
  Paper,
} from '@mui/material';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

import { rfqApi, type InsuranceProduct, type SectorMatrix } from '@/lib/api';

const SECTORS = [
  { value: '', label: 'הכל', labelEn: 'All' },
  { value: 'MANUFACTURING', label: 'ייצור', labelEn: 'Manufacturing' },
  { value: 'CONSTRUCTION', label: 'בנייה', labelEn: 'Construction' },
  { value: 'TECHNOLOGY', label: 'טכנולוגיה', labelEn: 'Technology' },
  { value: 'RETAIL', label: 'קמעונאות', labelEn: 'Retail' },
  { value: 'HEALTHCARE', label: 'בריאות', labelEn: 'Healthcare' },
  { value: 'LOGISTICS', label: 'לוגיסטיקה', labelEn: 'Logistics' },
  { value: 'CONSULTING', label: 'ייעוץ', labelEn: 'Consulting' },
  { value: 'FINANCIAL_SERVICES', label: 'שירותים פיננסיים', labelEn: 'Financial Services' },
  { value: 'AGRICULTURE', label: 'חקלאות', labelEn: 'Agriculture' },
  { value: 'REAL_ESTATE', label: 'נדל"ן', labelEn: 'Real Estate' },
];

const CATEGORY_COLORS: Record<string, 'primary' | 'secondary' | 'success' | 'warning' | 'info'> = {
  property: 'primary',
  liability: 'secondary',
  financial: 'warning',
  engineering: 'info',
};

const CATEGORY_LABELS: Record<string, { he: string; en: string }> = {
  property: { he: 'רכוש', en: 'Property' },
  liability: { he: 'אחריות', en: 'Liability' },
  financial: { he: 'פיננסי', en: 'Financial' },
  engineering: { he: 'הנדסי', en: 'Engineering' },
};

const NECESSITY_LABELS: Record<string, { he: string; color: 'error' | 'warning' | 'default' }> = {
  mandatory: { he: 'חובה', color: 'error' },
  recommended: { he: 'מומלץ', color: 'warning' },
  optional: { he: 'אופציונלי', color: 'default' },
};

// ============================================================
// QUESTION-TO-COVERAGE MAPPING DATA
// ============================================================

interface QuestionCoverageEntry {
  questionId: string;
  labelHe: string;
  type: string;
  coverageImpact: string;
  ruleEffect?: string;
}

interface ProductCoverageSection {
  productCode: string;
  productNameHe: string;
  productNameEn: string;
  category: 'property' | 'liability' | 'financial' | 'engineering';
  triggerDescription: string;
  questions: QuestionCoverageEntry[];
}

const QUESTION_COVERAGE_MAP: ProductCoverageSection[] = [
  {
    productCode: 'FIRE_CONSEQUENTIAL_LOSS',
    productNameHe: 'אש ואובדן רווחים',
    productNameEn: 'Fire & Consequential Loss',
    category: 'property',
    triggerDescription: 'מופיע כאשר לעסק יש נכס פיזי (בעלות או שכירות)',
    questions: [
      {
        questionId: 'fire_totalPropertyValue',
        labelHe: 'שווי רכוש כולל',
        type: 'currency',
        coverageImpact:
          'קובע את סכום הביטוח הכולל לפוליסת אש. חוסר ביטוח ייגרום להפעלת כלל יחסיות.',
        ruleEffect: 'קביעת סכום ביטוח',
      },
      {
        questionId: 'fire_annualGrossProfit',
        labelHe: 'רווח גולמי שנתי ועלות שכר',
        type: 'currency',
        coverageImpact:
          'בסיס לחישוב כיסוי אובדן רווחים (BI). מכפיל תקופת ההשבה קובע את הסכום הכולל.',
        ruleEffect: 'חישוב סכום BI',
      },
      {
        questionId: 'fire_maxReinstatementPeriod',
        labelHe: 'תקופת השבה מקסימלית',
        type: 'select',
        coverageImpact: 'קובע את אורך תקופת השיפוי לאובדן רווחים. תקופה ארוכה = פרמיה גבוהה יותר.',
        ruleEffect: 'x תקופת שיפוי',
      },
      {
        questionId: 'fire_needsEarthquake',
        labelHe: 'נדרש כיסוי רעידת אדמה?',
        type: 'boolean',
        coverageImpact: 'הוספת הרחבת רעידת אדמה לפוליסה. כרוך בפרמיה נוספת והשתתפות עצמית גבוהה.',
        ruleEffect: 'הוספת הרחבה',
      },
      {
        questionId: 'fire_propertyOutsidePremises',
        labelHe: 'רכוש מחוץ לחצרים העיקריים?',
        type: 'boolean',
        coverageImpact: 'הוספת הרחבת רכוש מחוץ לחצרים. דורש הגדרת מיקומים ותת-גבולות.',
        ruleEffect: 'הוספת הרחבה',
      },
      {
        questionId: 'fire_needsTheftCoverage',
        labelHe: 'נדרש כיסוי גניבה/פריצה?',
        type: 'boolean',
        coverageImpact: 'הוספת הרחבת גניבה ופריצה. מותנה באמצעי מיגון מינימליים.',
        ruleEffect: 'הוספת הרחבה',
      },
      {
        questionId: 'fire_acceptableDeductible',
        labelHe: 'רמת השתתפות עצמית',
        type: 'select',
        coverageImpact: 'השפעה ישירה על גובה הפרמיה. השתתפות גבוהה = פרמיה נמוכה יותר.',
        ruleEffect: 'תמחור פרמיה',
      },
      {
        questionId: 'fire_propertyInTransitOrConstruction',
        labelHe: 'רכוש בהעברה או בבנייה?',
        type: 'boolean',
        coverageImpact:
          'סימון סיכון: רכוש בהעברה/בנייה מוחרג בדרך כלל. דורש פוליסה נפרדת (מטען/קבלנים).',
        ruleEffect: 'סימון פער כיסוי',
      },
    ],
  },
  {
    productCode: 'MECHANICAL_BREAKDOWN',
    productNameHe: 'שבר מכונות',
    productNameEn: 'Mechanical Breakdown',
    category: 'property',
    triggerDescription: 'מופיע כאשר שווי ציוד ומכונות גדול מ-0',
    questions: [
      {
        questionId: 'mech_machineryList',
        labelHe: 'רשימת מכונות ושווי החלפה',
        type: 'text',
        coverageImpact: 'בסיס לרשימת הציוד המבוטח. כל פריט מכוסה לפי שווי ההחלפה שהוצהר.',
        ruleEffect: 'קביעת סכום ביטוח',
      },
      {
        questionId: 'mech_equipmentAge',
        labelHe: 'גיל ומצב הציוד',
        type: 'select',
        coverageImpact:
          'ציוד ישן (מעל 10 שנים) מגדיל פרמיה ועלול לדרוש בדיקה הנדסית. משקל סיכון: 0.15.',
        ruleEffect: 'מכפיל פרמיה',
      },
      {
        questionId: 'mech_maintenanceSchedule',
        labelHe: 'לוח תחזוקה',
        type: 'select',
        coverageImpact: 'תחזוקה לא סדירה או ללא תחזוקה מגדילים סיכון משמעותית. משקל סיכון: 0.2.',
        ruleEffect: 'מכפיל סיכון',
      },
      {
        questionId: 'mech_hasFirePolicy',
        labelHe: 'יש פוליסת אש קיימת?',
        type: 'boolean',
        coverageImpact:
          'תיאום כיסויים: שבר מכני מכסה נזק פנימי, אש מכסה נזק חיצוני. מונע כפל ביטוח.',
        ruleEffect: 'תיאום פוליסות',
      },
      {
        questionId: 'mech_specializedImportedEquipment',
        labelHe: 'ציוד מיוחד/מיובא עם חלפים קשים להשגה?',
        type: 'boolean',
        coverageImpact: 'ציוד מיובא דורש הרחבת הובלה אווירית לחלפים ותקופת תיקון ארוכה יותר.',
        ruleEffect: 'הוספת הרחבה',
      },
      {
        questionId: 'mech_deductiblePreference',
        labelHe: 'העדפת השתתפות עצמית',
        type: 'select',
        coverageImpact: 'קובע את רמת ההשתתפות העצמית. השפעה ישירה על מחיר הפוליסה.',
        ruleEffect: 'תמחור פרמיה',
      },
    ],
  },
  {
    productCode: 'THIRD_PARTY_LIABILITY',
    productNameHe: 'אחריות כלפי צד שלישי',
    productNameEn: 'Third Party Liability',
    category: 'liability',
    triggerDescription: 'מופיע תמיד - נדרש לכל עסק',
    questions: [
      {
        questionId: 'tpl_businessNature',
        labelHe: 'אופי הפעילות העסקית',
        type: 'text',
        coverageImpact:
          'בסיס לסיווג סיכון ותמחור. פעילויות מסוכנות (כימיקלים, מזון) = פרמיה גבוהה.',
        ruleEffect: 'סיווג סיכון',
      },
      {
        questionId: 'tpl_visitorsCustomers',
        labelHe: 'מספר מבקרים/לקוחות בחצרים',
        type: 'number',
        coverageImpact: 'מספר מבקרים גבוה מגדיל חשיפה לתביעות. משקל סיכון: 0.1.',
        ruleEffect: 'מכפיל סיכון',
      },
      {
        questionId: 'tpl_usesSubcontractors',
        labelHe: 'שימוש בקבלני משנה?',
        type: 'boolean',
        coverageImpact: 'שימוש בקבלני משנה דורש הרחבת אחריות שילוחית והכללתם כמבוטחים נוספים.',
        ruleEffect: 'הוספת הרחבה',
      },
      {
        questionId: 'tpl_organizesEvents',
        labelHe: 'מארגן אירועים / מגיש מזון?',
        type: 'boolean',
        coverageImpact: 'אירועים ומזון מגדילים חשיפה לתביעות גוף ומזון. משקל סיכון: 0.1.',
        ruleEffect: 'מכפיל סיכון',
      },
      {
        questionId: 'tpl_employeesCarryWeapons',
        labelHe: 'עובדים נושאים נשק?',
        type: 'boolean',
        coverageImpact: 'נשיאת נשק דורשת הרחבת נשק חם ומגדילה סיכון משמעותית. משקל סיכון: 0.15.',
        ruleEffect: 'הוספת הרחבה + מכפיל',
      },
      {
        questionId: 'tpl_requiredLimits',
        labelHe: 'גבול אחריות נדרש (לאירוע ומצטבר)',
        type: 'currency',
        coverageImpact: 'קובע את גבול האחריות בפוליסה. גבול גבוה = פרמיה גבוהה יותר.',
        ruleEffect: 'קביעת גבול אחריות',
      },
      {
        questionId: 'tpl_acceptableDeductible',
        labelHe: 'רמת השתתפות עצמית מקובלת',
        type: 'select',
        coverageImpact: 'קובע את גובה ההשתתפות העצמית בתביעה. השפעה הפוכה על הפרמיה.',
        ruleEffect: 'תמחור פרמיה',
      },
    ],
  },
  {
    productCode: 'EMPLOYERS_LIABILITY',
    productNameHe: 'חבות מעבידים',
    productNameEn: 'Employers Liability',
    category: 'liability',
    triggerDescription: 'מופיע כאשר מספר העובדים גדול מ-0',
    questions: [
      {
        questionId: 'el_totalPayroll',
        labelHe: 'סך שכר שנתי',
        type: 'currency',
        coverageImpact: 'בסיס לחישוב פרמיה. שכר שנתי כולל הוא הבסיס העיקרי לתמחור חבות מעבידים.',
        ruleEffect: 'בסיס פרמיה',
      },
      {
        questionId: 'el_subcontractorWorkers',
        labelHe: 'מעסיק עובדי קבלן משנה?',
        type: 'boolean',
        coverageImpact: 'עובדי קבלן דורשים הרחבת כיסוי. ללא הרחבה - אחריות המעביד לא תכוסה.',
        ruleEffect: 'הוספת הרחבה',
      },
      {
        questionId: 'el_employeesAbroad',
        labelHe: 'שולח עובדים לחו"ל?',
        type: 'boolean',
        coverageImpact: 'עובדים בחו"ל דורשים הרחבה טריטוריאלית. ללא הרחבה - אין כיסוי מחוץ לישראל.',
        ruleEffect: 'הרחבה טריטוריאלית',
      },
      {
        questionId: 'el_controllingShareholderPayroll',
        labelHe: 'בעלי שליטה בשכר?',
        type: 'boolean',
        coverageImpact: 'בעלי שליטה מוחרגים בדרך כלל. הכללתם דורשת הרחבה מפורשת בפוליסה.',
        ruleEffect: 'הוספת הרחבה',
      },
      {
        questionId: 'el_heldTerritoriesWorkers',
        labelHe: 'עובדים מהשטחים?',
        type: 'boolean',
        coverageImpact: 'עובדים מהשטחים כפופים לחקיקה שונה ודורשים כיסוי ספציפי. משקל סיכון: 0.1.',
        ruleEffect: 'הוספת הרחבה + מכפיל',
      },
      {
        questionId: 'el_workplaceHazardType',
        labelHe: 'סוג סביבת עבודה',
        type: 'select',
        coverageImpact: 'סביבה תעשייתית/בנייה מגדילה סיכון לתאונות עבודה. משקל סיכון: 0.15.',
        ruleEffect: 'מכפיל סיכון',
      },
      {
        questionId: 'el_requiredLimits',
        labelHe: 'גבול אחריות נדרש',
        type: 'currency',
        coverageImpact: 'קובע גבול אחריות למקרה ומצטבר. מינימום מומלץ: 5M ש"ח.',
        ruleEffect: 'קביעת גבול אחריות',
      },
      {
        questionId: 'el_nightShiftWork',
        labelHe: 'עבודה במשמרות לילה?',
        type: 'boolean',
        coverageImpact: 'משמרות לילה מגדילות סיכון לתאונות (עייפות, תאורה). משקל סיכון: 0.1.',
        ruleEffect: 'מכפיל סיכון',
      },
    ],
  },
  {
    productCode: 'PRODUCT_LIABILITY',
    productNameHe: 'אחריות מוצר',
    productNameEn: 'Product Liability',
    category: 'liability',
    triggerDescription: 'מופיע כאשר העסק מייצר, מייבא או מפיץ מוצרים',
    questions: [
      {
        questionId: 'prodLiab_productsDescription',
        labelHe: 'תיאור המוצרים המיוצרים/מיובאים/מופצים',
        type: 'text',
        coverageImpact: 'בסיס לסיווג סיכון מוצר. מוצרי מזון/ילדים/רפואה = סיכון גבוה יותר.',
        ruleEffect: 'סיווג סיכון',
      },
      {
        questionId: 'prodLiab_annualProductTurnover',
        labelHe: 'מחזור שנתי ממוצרים',
        type: 'currency',
        coverageImpact: 'בסיס לחישוב פרמיה. מחזור גבוה = חשיפה גדולה יותר.',
        ruleEffect: 'בסיס פרמיה',
      },
      {
        questionId: 'prodLiab_exportActivity',
        labelHe: 'פעילות יצוא?',
        type: 'boolean',
        coverageImpact: 'יצוא דורש הרחבה טריטוריאלית. חשיפה לחקיקה זרה (במיוחד USA).',
        ruleEffect: 'הרחבה טריטוריאלית',
      },
      {
        questionId: 'prodLiab_exportPercentage',
        labelHe: 'אחוז יצוא',
        type: 'number',
        coverageImpact:
          'אחוז יצוא גבוה מגדיל את הפרמיה. יצוא ל-USA מעל 20% = פרמיה גבוהה משמעותית.',
        ruleEffect: 'מכפיל פרמיה',
      },
      {
        questionId: 'prodLiab_priorClaims',
        labelHe: 'תביעות קודמות או פגמים ידועים?',
        type: 'boolean',
        coverageImpact:
          'תביעות קודמות מגדילות פרמיה ועלולות לגרום לסייגים ספציפיים. משקל סיכון: 0.2.',
        ruleEffect: 'סימון סיכון + מכפיל',
      },
      {
        questionId: 'prodLiab_downstreamDistributors',
        labelHe: 'מפיצים הדורשים הרחבת ספק?',
        type: 'boolean',
        coverageImpact:
          'הרחבת ספק מכסה את המפיצים תחת הפוליסה. נדרשת כאשר מפיצים דורשים אישור ביטוח.',
        ruleEffect: 'הוספת הרחבה',
      },
      {
        questionId: 'prodLiab_installsOrRepairs',
        labelHe: 'מבצע התקנה/תיקון?',
        type: 'boolean',
        coverageImpact: 'התקנה/תיקון מרחיב את החבות מעבר למוצר עצמו. דורש הרחבת שירותי לאחר מכירה.',
        ruleEffect: 'הוספת הרחבה',
      },
      {
        questionId: 'prodLiab_requiredLimits',
        labelHe: 'גבול אחריות נדרש',
        type: 'currency',
        coverageImpact: 'קובע את גבול האחריות למקרה ומצטבר. מומלץ לא פחות מ-2M ש"ח.',
        ruleEffect: 'קביעת גבול אחריות',
      },
    ],
  },
  {
    productCode: 'CASH_MONEY',
    productNameHe: 'ביטוח כספים',
    productNameEn: 'Cash/Money Insurance',
    category: 'financial',
    triggerDescription: 'מופיע כאשר העסק מטפל במזומנים',
    questions: [
      {
        questionId: 'cash_maxOnPremises',
        labelHe: 'מקסימום מזומן בחצרים',
        type: 'currency',
        coverageImpact: 'קובע את גבול הכיסוי למזומן בחצרים. חריגה מהסכום = חוסר ביטוח.',
        ruleEffect: 'קביעת תת-גבול',
      },
      {
        questionId: 'cash_maxInTransit',
        labelHe: 'מקסימום מזומן בהעברה',
        type: 'currency',
        coverageImpact: 'קובע את גבול הכיסוי למזומן בהעברה. תנאי מיגון משתנים לפי הסכום.',
        ruleEffect: 'קביעת תת-גבול',
      },
      {
        questionId: 'cash_transportMethod',
        labelHe: 'אופן העברת מזומן',
        type: 'select',
        coverageImpact:
          'רכב משוריין/חברת אבטחה מפחיתים פרמיה. העברה ע"י עובדים = פרמיה גבוהה יותר.',
        ruleEffect: 'תמחור פרמיה',
      },
      {
        questionId: 'cash_keptAtManagerHomes',
        labelHe: 'מזומן בבתי מנהלים?',
        type: 'boolean',
        coverageImpact: 'החזקת מזומן בבתי מנהלים דורשת הרחבת כיסוי מחוץ לחצרים. משקל סיכון: 0.1.',
        ruleEffect: 'הוספת הרחבה',
      },
      {
        questionId: 'cash_usesNegotiableInstruments',
        labelHe: "שימוש בצ'קים/שטרות סחירים?",
        type: 'boolean',
        coverageImpact: "צ'קים ושטרות סחירים דורשים הרחבת כיסוי נפרדת עם תנאים ספציפיים.",
        ruleEffect: 'הוספת הרחבה',
      },
      {
        questionId: 'cash_safeSecurityMeasures',
        labelHe: 'אמצעי אבטחת כספות',
        type: 'multiselect',
        coverageImpact:
          'אמצעי מיגון הם תנאי מוקדם לכיסוי. כספת+אזעקה = מינימום. חסר מיגון = סירוב כיסוי.',
        ruleEffect: 'תנאי מוקדם',
      },
      {
        questionId: 'cash_workingHoursType',
        labelHe: 'סוג שעות עבודה',
        type: 'select',
        coverageImpact: 'שעות עבודה מורחבות (24/7) דורשות כיסוי מורחב ומיגון נוסף.',
        ruleEffect: 'הרחבת כיסוי',
      },
    ],
  },
  {
    productCode: 'FIDELITY_CRIME',
    productNameHe: 'ביטוח נאמנות עובדים',
    productNameEn: 'Fidelity/Crime Insurance',
    category: 'financial',
    triggerDescription: 'מופיע כאשר לעובדים יש גישה לכספים או נכסים',
    questions: [
      {
        questionId: 'fidelity_employeesWithAccess',
        labelHe: 'מספר עובדים עם גישה לכספים/נכסים',
        type: 'number',
        coverageImpact: 'מספר עובדים עם גישה קובע את רמת החשיפה. יותר עובדים = סיכון גבוה יותר.',
        ruleEffect: 'מכפיל סיכון',
      },
      {
        questionId: 'fidelity_totalAssetsAtRisk',
        labelHe: 'סך נכסים בסיכון',
        type: 'currency',
        coverageImpact: 'בסיס לקביעת סכום הביטוח. גבול אחריות צריך לכסות את מקסימום החשיפה הסביר.',
        ruleEffect: 'קביעת סכום ביטוח',
      },
      {
        questionId: 'fidelity_internalControls',
        labelHe: 'בקרות פנימיות',
        type: 'multiselect',
        coverageImpact:
          'בקרות חזקות (הפרדת תפקידים + ביקורות + חתימות כפולות) מפחיתות פרמיה. ללא בקרות = סירוב/פרמיה גבוהה.',
        ruleEffect: 'תנאי מוקדם + תמחור',
      },
      {
        questionId: 'fidelity_priorDishonesty',
        labelHe: 'מקרי מעילה קודמים?',
        type: 'boolean',
        coverageImpact:
          'מעילות קודמות מגדילות פרמיה משמעותית ועלולות לגרום לסירוב. משקל סיכון: 0.25.',
        ruleEffect: 'סימון סיכון + מכפיל',
      },
      {
        questionId: 'fidelity_retroactiveDate',
        labelHe: 'נדרש תאריך רטרואקטיבי?',
        type: 'boolean',
        coverageImpact: 'תאריך רטרואקטיבי מרחיב את הכיסוי למעשים שנעשו לפני תחילת הפוליסה.',
        ruleEffect: 'הרחבת כיסוי',
      },
      {
        questionId: 'fidelity_requiredLimits',
        labelHe: 'גבול אחריות נדרש',
        type: 'currency',
        coverageImpact: 'קובע את גבול האחריות המקסימלי. מומלץ: 100%-150% מהנכסים בסיכון.',
        ruleEffect: 'קביעת גבול אחריות',
      },
    ],
  },
  {
    productCode: 'CARGO_IN_TRANSIT',
    productNameHe: 'ביטוח מטען בהעברה',
    productNameEn: 'Cargo in Transit',
    category: 'property',
    triggerDescription: 'מופיע כאשר העסק מוביל סחורות',
    questions: [
      {
        questionId: 'cargo_maxValuePerShipment',
        labelHe: 'שווי מקסימלי למשלוח',
        type: 'currency',
        coverageImpact: 'קובע את גבול הכיסוי למשלוח בודד. חריגה = חוסר ביטוח על עודף הערך.',
        ruleEffect: 'קביעת תת-גבול',
      },
      {
        questionId: 'cargo_annualCargoValue',
        labelHe: 'שווי שנתי כולל של מטענים',
        type: 'currency',
        coverageImpact: 'בסיס לחישוב פרמיה שנתית. פוליסה כללית (Open Policy) נקבעת לפי שווי שנתי.',
        ruleEffect: 'בסיס פרמיה',
      },
      {
        questionId: 'cargo_goodsTypes',
        labelHe: 'סוגי סחורות',
        type: 'multiselect',
        coverageImpact: 'סחורות שבירות/מסוכנות/מתכלות דורשות תנאי כיסוי מיוחדים ופרמיה גבוהה יותר.',
        ruleEffect: 'תמחור + תנאים מיוחדים',
      },
      {
        questionId: 'cargo_ownVehiclesOrThirdParty',
        labelHe: 'רכבים עצמיים או מובילים חיצוניים',
        type: 'select',
        coverageImpact:
          'הובלה ברכבים עצמיים דורשת תנאי כיסוי שונים ממובילים חיצוניים. משפיע על סוג הפוליסה.',
        ruleEffect: 'סוג כיסוי',
      },
      {
        questionId: 'cargo_importExportActivity',
        labelHe: 'פעילות יבוא/יצוא?',
        type: 'boolean',
        coverageImpact:
          'יבוא/יצוא דורש הרחבה ימית/אווירית ותנאי CIF/FOB. מרחיב את הכיסוי הטריטוריאלי.',
        ruleEffect: 'הרחבה טריטוריאלית',
      },
      {
        questionId: 'cargo_vehicleSecurityMeasures',
        labelHe: 'אמצעי אבטחת רכבים',
        type: 'multiselect',
        coverageImpact:
          'אמצעי אבטחה (GPS, אזעקה, חנייה שמורה) הם תנאי לכיסוי גניבה ומפחיתים פרמיה.',
        ruleEffect: 'תנאי מוקדם + תמחור',
      },
      {
        questionId: 'cargo_driverCompliance',
        labelHe: 'כל הנהגים עם רישיון מתאים?',
        type: 'boolean',
        coverageImpact: 'רישיון מתאים הוא תנאי מוקדם לכיסוי. נהג ללא רישיון = דחיית תביעה.',
        ruleEffect: 'תנאי מוקדם',
      },
    ],
  },
  {
    productCode: 'TERRORISM',
    productNameHe: 'ביטוח טרור',
    productNameEn: 'Terrorism Insurance',
    category: 'property',
    triggerDescription: 'מופיע כאשר לעסק יש נכס פיזי (בעלות או שכירות)',
    questions: [
      {
        questionId: 'terror_totalPropertyValue',
        labelHe: 'שווי רכוש לביטוח טרור',
        type: 'currency',
        coverageImpact: 'קובע את סכום הביטוח. חשוב: קרן מס רכוש מכסה חלקית, הפוליסה מכסה את הפער.',
        ruleEffect: 'קביעת סכום ביטוח',
      },
      {
        questionId: 'terror_expectedCompensationFund',
        labelHe: 'פיצוי צפוי מקרן מס רכוש',
        type: 'currency',
        coverageImpact:
          'סכום הפיצוי הממשלתי. ביטוח טרור מכסה את הפער בין שווי הרכוש לפיצוי הממשלתי.',
        ruleEffect: 'חישוב פער כיסוי',
      },
      {
        questionId: 'terror_coverageGap',
        labelHe: 'פער כיסוי נדרש',
        type: 'currency',
        coverageImpact: 'הסכום שיש לבטח: שווי רכוש פחות פיצוי ממשלתי. זהו סכום הביטוח בפוליסה.',
        ruleEffect: 'קביעת סכום ביטוח',
      },
      {
        questionId: 'terror_needsBI',
        labelHe: 'נדרש כיסוי אבדן רווחים מטרור?',
        type: 'boolean',
        coverageImpact: 'הרחבת אובדן רווחים מטרור מכסה הפסדים עסקיים בעקבות אירוע טרור.',
        ruleEffect: 'הוספת הרחבה',
      },
      {
        questionId: 'terror_indemnityPeriod',
        labelHe: 'תקופת שיפוי',
        type: 'select',
        coverageImpact: 'תקופת שיפוי ארוכה מגדילה את סכום הכיסוי לאובדן רווחים ואת הפרמיה.',
        ruleEffect: 'x תקופת שיפוי',
      },
      {
        questionId: 'terror_locationRisk',
        labelHe: 'הערכת סיכון מיקום',
        type: 'select',
        coverageImpact: 'מיקום בסיכון גבוה/קריטי מגדיל פרמיה משמעותית. משקל סיכון: 0.2.',
        ruleEffect: 'מכפיל סיכון',
      },
      {
        questionId: 'terror_hasFirePolicy',
        labelHe: 'יש פוליסת אש קיימת?',
        type: 'boolean',
        coverageImpact: 'תיאום עם פוליסת אש קיימת. אירוע טרור עם אש - חשוב לקבוע איזו פוליסה מכסה.',
        ruleEffect: 'תיאום פוליסות',
      },
    ],
  },
  {
    productCode: 'ELECTRONIC_EQUIPMENT',
    productNameHe: 'ביטוח ציוד אלקטרוני',
    productNameEn: 'Electronic Equipment',
    category: 'property',
    triggerDescription: 'מופיע כאשר שווי ציוד אלקטרוני גדול מ-0',
    questions: [
      {
        questionId: 'elecEquip_inventoryDescription',
        labelHe: 'תיאור ציוד אלקטרוני (יצרן, דגם, שנה, שווי)',
        type: 'text',
        coverageImpact: 'בסיס לרשימת הציוד המבוטח. כל פריט מכוסה לפי שווי ההחלפה שהוצהר.',
        ruleEffect: 'קביעת סכום ביטוח',
      },
      {
        questionId: 'elecEquip_totalReplacementValue',
        labelHe: 'שווי החלפה כולל',
        type: 'currency',
        coverageImpact: 'קובע את סכום הביטוח הכולל לפוליסה. חוסר ביטוח = הפעלת כלל יחסיות.',
        ruleEffect: 'קביעת סכום ביטוח',
      },
      {
        questionId: 'elecEquip_leasedOrFinanced',
        labelHe: 'ציוד בליסינג/מימון?',
        type: 'boolean',
        coverageImpact: 'ציוד בליסינג דורש הכללת חברת הליסינג כמוטב ומבוטח נוסף.',
        ruleEffect: 'הוספת מבוטח נוסף',
      },
      {
        questionId: 'elecEquip_portableVsFixed',
        labelHe: 'נייד מול קבוע',
        type: 'select',
        coverageImpact: 'ציוד נייד דורש הרחבת כיסוי מחוץ לחצרים. סיכון גבוה יותר לנזק/גניבה.',
        ruleEffect: 'הוספת הרחבה',
      },
      {
        questionId: 'elecEquip_dataTypeAndVolume',
        labelHe: 'סוג ונפח נתונים',
        type: 'select',
        coverageImpact: 'נתונים קריטיים דורשים הרחבת שחזור נתונים ועלויות IT מוגדלות.',
        ruleEffect: 'הרחבת כיסוי',
      },
      {
        questionId: 'elecEquip_needsSoftwareCover',
        labelHe: 'נדרש כיסוי תוכנה מקיף?',
        type: 'boolean',
        coverageImpact: 'כיסוי תוכנה מרחיב את הפוליסה לשחזור רישיונות והתקנה מחדש של תוכנה.',
        ruleEffect: 'הוספת הרחבה',
      },
      {
        questionId: 'elecEquip_backupRegime',
        labelHe: 'משטר גיבוי',
        type: 'select',
        coverageImpact:
          'גיבוי לא סדיר/ללא גיבוי מגדיל סיכון ופרמיה. גיבוי יומי מפחית עלות שחזור. משקל סיכון: 0.15.',
        ruleEffect: 'מכפיל סיכון + תנאי',
      },
      {
        questionId: 'elecEquip_antiVirusPatching',
        labelHe: 'אנטי-וירוס ועדכוני מערכת מעודכנים?',
        type: 'boolean',
        coverageImpact: 'תוכנת אבטחה מעודכנת היא תנאי מוקדם. חוסר עדכון עלול לגרום לדחיית תביעה.',
        ruleEffect: 'תנאי מוקדם',
      },
      {
        questionId: 'elecEquip_upsInstalled',
        labelHe: 'מותקנות מערכות UPS?',
        type: 'boolean',
        coverageImpact: 'UPS מגן מפני נזקי הפסקת חשמל. תנאי מומלץ לציוד רגיש.',
        ruleEffect: 'תנאי מומלץ',
      },
      {
        questionId: 'elecEquip_downtimeTolerance',
        labelHe: 'סבילות להשבתה',
        type: 'select',
        coverageImpact: 'סבילות נמוכה (שעות) דורשת כיסוי הוצאות מוגברות לשחזור מהיר.',
        ruleEffect: 'הרחבת כיסוי',
      },
      {
        questionId: 'elecEquip_dailyFinancialImpact',
        labelHe: 'השפעה כספית יומית מהשבתה',
        type: 'currency',
        coverageImpact: 'בסיס לחישוב כיסוי אובדן רווחים מהשבתת ציוד אלקטרוני.',
        ruleEffect: 'חישוב סכום BI',
      },
      {
        questionId: 'elecEquip_contractualPenalties',
        labelHe: 'קנסות חוזיות על השבתה?',
        type: 'boolean',
        coverageImpact: 'קנסות חוזיות דורשות הרחבת כיסוי הוצאות נוספות כולל פיצויים חוזיים.',
        ruleEffect: 'הוספת הרחבה',
      },
      {
        questionId: 'elecEquip_physicalSecurity',
        labelHe: 'אבטחה פיזית',
        type: 'multiselect',
        coverageImpact: 'אמצעי אבטחה פיזיים (מיזוג, כיבוי אש, בקרת גישה) הם תנאי מוקדם לכיסוי.',
        ruleEffect: 'תנאי מוקדם',
      },
    ],
  },
  {
    productCode: 'HEAVY_ENGINEERING_EQUIPMENT',
    productNameHe: 'ביטוח ציוד מכני הנדסי',
    productNameEn: 'Heavy/Engineering Equipment',
    category: 'engineering',
    triggerDescription: 'מופיע כאשר העסק משתמש בציוד מכני כבד',
    questions: [
      {
        questionId: 'heavyEquip_inventoryList',
        labelHe: 'רשימת ציוד (סוג, יצרן, דגם, שנה, מספר סידורי, שווי)',
        type: 'text',
        coverageImpact: 'רשימת הציוד המבוטח. כל פריט מכוסה בנפרד לפי השווי שהוצהר.',
        ruleEffect: 'קביעת סכום ביטוח',
      },
      {
        questionId: 'heavyEquip_totalValue',
        labelHe: 'שווי מזומן נוכחי כולל',
        type: 'currency',
        coverageImpact: 'סכום הביטוח הכולל. ציוד כבד מבוטח על בסיס שווי מזומן (לא החלפה).',
        ruleEffect: 'קביעת סכום ביטוח',
      },
      {
        questionId: 'heavyEquip_ownershipType',
        labelHe: 'סוג בעלות',
        type: 'select',
        coverageImpact: 'ציוד שכור/בליסינג דורש הכללת הבעלים כמבוטח נוסף ומוטב.',
        ruleEffect: 'הוספת מבוטח נוסף',
      },
      {
        questionId: 'heavyEquip_operatingLocations',
        labelHe: 'מיקומי הפעלה (גבולות טריטוריאליים)',
        type: 'text',
        coverageImpact: 'קובע את הגבולות הטריטוריאליים של הכיסוי. פעילות מחוץ לגבולות = ללא כיסוי.',
        ruleEffect: 'הגדרת טריטוריה',
      },
      {
        questionId: 'heavyEquip_projectTypes',
        labelHe: 'סוגי פרויקטים',
        type: 'multiselect',
        coverageImpact: 'פרויקטים מסוכנים (הריסות, קידוח) מגדילים פרמיה ודורשים תנאים מיוחדים.',
        ruleEffect: 'תמחור + תנאים',
      },
      {
        questionId: 'heavyEquip_operatesNearWater',
        labelHe: 'פעילות ליד מים?',
        type: 'boolean',
        coverageImpact:
          'פעילות ליד מים מגדילה סיכון טביעה/שקיעה. דורשת כיסוי מורחב. משקל סיכון: 0.15.',
        ruleEffect: 'הוספת הרחבה + מכפיל',
      },
      {
        questionId: 'heavyEquip_allOperatorsLicensed',
        labelHe: 'כל המפעילים בעלי רישיון?',
        type: 'boolean',
        coverageImpact: 'רישיון מפעיל הוא תנאי מוקדם לכיסוי. מפעיל ללא רישיון = דחיית תביעה.',
        ruleEffect: 'תנאי מוקדם',
      },
      {
        questionId: 'heavyEquip_storageArrangements',
        labelHe: 'סידורי אחסון',
        type: 'select',
        coverageImpact: 'אחסון באתר פתוח מגדיל סיכון גניבה ונזק. מגרש שמור = פרמיה נמוכה יותר.',
        ruleEffect: 'תמחור פרמיה',
      },
      {
        questionId: 'heavyEquip_needsTheftCoverage',
        labelHe: 'נדרש כיסוי גניבה/שוד?',
        type: 'boolean',
        coverageImpact: 'כיסוי גניבה הוא הרחבה אופציונלית. מותנה באמצעי מיגון מינימליים.',
        ruleEffect: 'הוספת הרחבה',
      },
      {
        questionId: 'heavyEquip_needsSalvageTowing',
        labelHe: 'נדרש כיסוי חילוץ/גרירה?',
        type: 'boolean',
        coverageImpact: 'הרחבת חילוץ וגרירה מכסה עלויות העברת ציוד שניזוק. חשוב לאתרים מרוחקים.',
        ruleEffect: 'הוספת הרחבה',
      },
      {
        questionId: 'heavyEquip_claimsHistory',
        labelHe: 'היסטוריית תביעות (3-5 שנים)?',
        type: 'boolean',
        coverageImpact: 'היסטוריית תביעות משפיעה על תמחור ותנאי קבלה. משקל סיכון: 0.15.',
        ruleEffect: 'מכפיל סיכון',
      },
      {
        questionId: 'heavyEquip_securityMeasures',
        labelHe: 'אמצעי אבטחה',
        type: 'multiselect',
        coverageImpact: 'אמצעי אבטחה (GPS, שומרים, גידור) הם תנאי לכיסוי גניבה ומפחיתים פרמיה.',
        ruleEffect: 'תנאי מוקדם + תמחור',
      },
      {
        questionId: 'heavyEquip_maintenanceProgram',
        labelHe: 'תוכנית תחזוקה סדירה ותעודות בדיקה?',
        type: 'boolean',
        coverageImpact: 'תחזוקה סדירה היא תנאי מוקדם. ללא תחזוקה = דחיית תביעה בגין רשלנות.',
        ruleEffect: 'תנאי מוקדם',
      },
      {
        questionId: 'heavyEquip_inspectionCertificates',
        labelHe: 'תעודות בדיקה בתוקף?',
        type: 'boolean',
        coverageImpact: 'תעודות בדיקה (טסט, בדיקה שנתית) נדרשות על פי חוק ולכיסוי ביטוחי.',
        ruleEffect: 'תנאי מוקדם',
      },
    ],
  },
  {
    productCode: 'CONTRACTOR_WORKS_CAR',
    productNameHe: 'ביטוח עבודות קבלניות',
    productNameEn: 'Contractor All Risks (CAR)',
    category: 'engineering',
    triggerDescription: 'מופיע כאשר העסק מבצע עבודות בנייה/קבלנות',
    questions: [
      {
        questionId: 'car_projectNature',
        labelHe: 'אופי הפרויקט',
        type: 'select',
        coverageImpact:
          'סוג הפרויקט קובע את סיווג הסיכון ותנאי הכיסוי. שיפוץ מסוכן יותר מבנייה חדשה.',
        ruleEffect: 'סיווג סיכון',
      },
      {
        questionId: 'car_worksDescription',
        labelHe: 'תיאור מפורט של העבודות',
        type: 'text',
        coverageImpact: 'בסיס להגדרת היקף הכיסוי. עבודות שלא פורטו = לא מכוסות.',
        ruleEffect: 'הגדרת היקף כיסוי',
      },
      {
        questionId: 'car_siteLocation',
        labelHe: 'מיקום האתר (גבולות טריטוריאליים, אזור B/C)',
        type: 'text',
        coverageImpact: 'מיקום קובע תנאים ביטוחיים. אזורי B/C דורשים תנאים מיוחדים ופרמיה מוגדלת.',
        ruleEffect: 'תמחור + תנאים',
      },
      {
        questionId: 'car_totalContractValue',
        labelHe: 'שווי חוזה כולל כולל חומרים',
        type: 'currency',
        coverageImpact: 'קובע את סכום הביטוח. כולל חומרים, עבודה ורווח קבלני.',
        ruleEffect: 'קביעת סכום ביטוח',
      },
      {
        questionId: 'car_expectedDuration',
        labelHe: 'משך פרויקט צפוי',
        type: 'select',
        coverageImpact:
          'משך הפרויקט קובע את תקופת הביטוח. פרויקטים ארוכים (36+) = פרמיה גבוהה יותר.',
        ruleEffect: 'תקופת ביטוח',
      },
      {
        questionId: 'car_maintenancePeriod',
        labelHe: 'תקופת תחזוקה/אחריות',
        type: 'select',
        coverageImpact: 'הרחבת כיסוי לתקופת האחריות לאחר מסירה. כיסוי מצומצם יותר מתקופת הבנייה.',
        ruleEffect: 'הרחבת כיסוי',
      },
      {
        questionId: 'car_projectOwner',
        labelHe: 'מזמין העבודה',
        type: 'text',
        coverageImpact: 'מזמין העבודה מוכלל כמבוטח נוסף. גוף ציבורי עשוי לדרוש תנאים מיוחדים.',
        ruleEffect: 'הוספת מבוטח נוסף',
      },
      {
        questionId: 'car_hasSubContractors',
        labelHe: 'קבלני משנה מעורבים?',
        type: 'boolean',
        coverageImpact: 'קבלני משנה דורשים הכללה כמבוטחים נוספים ואישור ביטוח.',
        ruleEffect: 'הוספת מבוטחים נוספים',
      },
      {
        questionId: 'car_subContractorCount',
        labelHe: 'מספר קבלני משנה',
        type: 'number',
        coverageImpact: 'מספר קבלני משנה רב מגדיל מורכבות ניהול סיכונים ודורש מעקב קפדני.',
        ruleEffect: 'מכפיל מורכבות',
      },
      {
        questionId: 'car_totalWorkerCount',
        labelHe: 'סה"כ עובדים (ישירים + קבלן)',
        type: 'number',
        coverageImpact: 'מספר עובדים כולל קובע את גבול חבות מעבידים בפוליסת CAR.',
        ruleEffect: 'קביעת גבול EL',
      },
      {
        questionId: 'car_palestinianWorkers',
        labelHe: 'עובדים מהשטחים?',
        type: 'boolean',
        coverageImpact: 'עובדים מהשטחים דורשים כיסוי ספציפי וחקיקה שונה. משקל סיכון: 0.1.',
        ruleEffect: 'הוספת הרחבה + מכפיל',
      },
      {
        questionId: 'car_financialLiens',
        labelHe: 'שעבודים של בנקים/מוסדות פיננסיים?',
        type: 'boolean',
        coverageImpact: 'בנקים עם שעבוד נדרשים כמוטבים בפוליסה. הבנק מקבל הודעה על ביטול.',
        ruleEffect: 'הוספת מוטב',
      },
      {
        questionId: 'car_additionalInsureds',
        labelHe: 'מבוטחים נוספים נדרשים? (מזמין, אדריכל)',
        type: 'boolean',
        coverageImpact: 'הכללת מזמין, אדריכל, מפקח כמבוטחים נוספים. נדרש בחוזי בנייה ציבוריים.',
        ruleEffect: 'הוספת מבוטחים נוספים',
      },
      {
        questionId: 'car_nearExistingBuildings',
        labelHe: 'ליד מבנים/תשתיות קיימים? (סיכון רטט)',
        type: 'boolean',
        coverageImpact:
          'קרבה למבנים קיימים דורשת כיסוי רכוש סמוך (Cross Liability). משקל סיכון: 0.1.',
        ruleEffect: 'הוספת הרחבה + מכפיל',
      },
      {
        questionId: 'car_undergroundUtilities',
        labelHe: 'תשתיות תת-קרקעיות באתר?',
        type: 'boolean',
        coverageImpact:
          'תשתיות תת-קרקעיות מוחרגות בדרך כלל. דורשות הרחבת כיסוי מיוחדת. משקל סיכון: 0.1.',
        ruleEffect: 'הוספת הרחבה + מכפיל',
      },
      {
        questionId: 'car_usesHeavyLifting',
        labelHe: 'שימוש במנופים/הרמה כבדה?',
        type: 'boolean',
        coverageImpact: 'שימוש במנופים דורש כיסוי ציוד הרמה ואחריות מנופאי. דורש אישורי בטיחות.',
        ruleEffect: 'הוספת הרחבה',
      },
      {
        questionId: 'car_earthquakeZone',
        labelHe: 'אזור רעידות אדמה?',
        type: 'boolean',
        coverageImpact: 'אזור רעידות אדמה דורש הרחבה ספציפית עם השתתפות עצמית גבוהה.',
        ruleEffect: 'הוספת הרחבה',
      },
      {
        questionId: 'car_weaponsOnSite',
        labelHe: 'נשק באתר?',
        type: 'boolean',
        coverageImpact:
          'נשק באתר דורש הרחבת נשק חם ומגדיל חשיפה לאחריות צד שלישי. משקל סיכון: 0.1.',
        ruleEffect: 'הוספת הרחבה + מכפיל',
      },
      {
        questionId: 'car_workersAbroadTravel',
        labelHe: 'עובדים/ציוד נוסעים לחו"ל?',
        type: 'boolean',
        coverageImpact: 'פעילות בחו"ל דורשת הרחבה טריטוריאלית וביטוח בהתאם לחקיקה המקומית.',
        ruleEffect: 'הרחבה טריטוריאלית',
      },
      {
        questionId: 'car_unoccupiedSecurity',
        labelHe: 'אבטחה כשאתר לא מאויש',
        type: 'select',
        coverageImpact: 'אבטחה בזמן שהאתר ריק (שומרים/מצלמות/גידור). תנאי לכיסוי גניבה וונדליזם.',
        ruleEffect: 'תנאי מוקדם',
      },
      {
        questionId: 'car_tplElLimits',
        labelHe: 'גבולות אחריות TPL ו-EL',
        type: 'currency',
        coverageImpact:
          'גבולות אחריות צד שלישי וחבות מעבידים בפוליסת CAR. מינימום נדרש בחוזים ציבוריים.',
        ruleEffect: 'קביעת גבול אחריות',
      },
      {
        questionId: 'car_turnkeyProject',
        labelHe: 'פרויקט טורנקי/BOT?',
        type: 'boolean',
        coverageImpact:
          'פרויקט טורנקי דורש כיסוי מורחב הכולל תכנון, ביצוע ותפעול. פרמיה גבוהה יותר.',
        ruleEffect: 'הרחבת כיסוי',
      },
    ],
  },
];

export default function KnowledgeBasePage() {
  const [products, setProducts] = useState<InsuranceProduct[]>([]);
  const [sectorMatrix, setSectorMatrix] = useState<SectorMatrix | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sector, setSector] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        if (sector) {
          const response = await rfqApi.products.getBySector(sector);
          if (response.success && response.data) {
            setProducts(response.data);
          }
        } else {
          const response = await rfqApi.products.list();
          if (response.success && response.data) {
            setProducts(response.data);
          }
        }

        // Load sector matrix for the matrix tab
        if (activeTab === 1 && !sectorMatrix) {
          const matrixResponse = await rfqApi.products.getSectorMatrix();
          if (matrixResponse.success && matrixResponse.data) {
            setSectorMatrix(matrixResponse.data);
          }
        }
      } catch (err: unknown) {
        setError('Failed to load product catalog');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [sector, activeTab]);

  const getSectorLabel = (sectorValue: string) => {
    return SECTORS.find((s) => s.value === sectorValue)?.label || sectorValue;
  };

  // Group products by category
  const groupedProducts = products.reduce<Record<string, InsuranceProduct[]>>((acc, p) => {
    const cat = p.category || 'other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(p);
    return acc;
  }, {});

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            קטלוג מוצרי ביטוח
          </Typography>
          <Typography color="text.secondary">
            Insurance Product Catalog - 12 BIT Standard Policies
          </Typography>
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
          <Tab label="קטלוג מוצרים" />
          <Tab label="מטריצת ענפים" />
          <Tab label="פערי כיסוי" />
          <Tab label="מיפוי שאלות-כיסוי" />
        </Tabs>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Tab 0: Product Catalog */}
      {activeTab === 0 && (
        <>
          {/* Filters */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>סינון לפי ענף</InputLabel>
                <Select
                  value={sector}
                  label="סינון לפי ענף"
                  onChange={(e) => setSector(e.target.value)}
                >
                  {SECTORS.map((s) => (
                    <MenuItem key={s.value} value={s.value}>
                      {s.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </CardContent>
          </Card>

          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : (
            <Box>
              {Object.entries(groupedProducts).map(([category, categoryProducts]) => (
                <Accordion key={category} defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Chip
                        label={CATEGORY_LABELS[category]?.he || category}
                        color={CATEGORY_COLORS[category] || 'default'}
                        size="small"
                      />
                      <Typography variant="h6">
                        {CATEGORY_LABELS[category]?.en || category}
                      </Typography>
                      <Chip
                        label={`${categoryProducts.length} מוצרים`}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails sx={{ p: 0 }}>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 'bold', width: '30%' }}>שם מוצר</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', width: '20%' }}>
                              טריגר כיסוי
                            </TableCell>
                            <TableCell sx={{ fontWeight: 'bold', width: '10%' }}>חיוניות</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', width: '30%' }}>תיאור</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', width: '10%' }}>מקור</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {categoryProducts.map((product) => (
                            <TableRow
                              key={product.code}
                              component={Link}
                              href={`/rfq/knowledge/${product.code}`}
                              hover
                              sx={{
                                textDecoration: 'none',
                                cursor: 'pointer',
                              }}
                            >
                              <TableCell>
                                <Box display="flex" alignItems="center" gap={0.5}>
                                  <Box>
                                    <Typography variant="body2" fontWeight="bold">
                                      {product.nameHe}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {product.nameEn}
                                    </Typography>
                                  </Box>
                                  <OpenInNewIcon
                                    sx={{ fontSize: 14, color: 'action.active', ml: 'auto' }}
                                  />
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={product.coverageTrigger}
                                  size="small"
                                  variant="outlined"
                                />
                              </TableCell>
                              <TableCell>
                                {product.necessity && (
                                  <Chip
                                    label={
                                      NECESSITY_LABELS[product.necessity]?.he || product.necessity
                                    }
                                    size="small"
                                    color={NECESSITY_LABELS[product.necessity]?.color || 'default'}
                                  />
                                )}
                              </TableCell>
                              <TableCell>
                                {product.descriptionHe && (
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    noWrap
                                    sx={{ maxWidth: 300 }}
                                  >
                                    {product.descriptionHe}
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell>
                                <Typography variant="caption" color="text.secondary">
                                  {product.bitStandard}
                                </Typography>
                                {product.insurer && (
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    display="block"
                                  >
                                    {product.insurer}
                                  </Typography>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </AccordionDetails>
                </Accordion>
              ))}

              {products.length === 0 && (
                <Card>
                  <CardContent>
                    <Box textAlign="center" py={4}>
                      <Typography color="text.secondary">לא נמצאו מוצרי ביטוח</Typography>
                    </Box>
                  </CardContent>
                </Card>
              )}
            </Box>
          )}
        </>
      )}

      {/* Tab 1: Sector Matrix */}
      {activeTab === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              מטריצת ענף ← מוצר
            </Typography>
            <Typography color="text.secondary" gutterBottom>
              Industry → Product Matrix
            </Typography>

            {loading ? (
              <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress />
              </Box>
            ) : sectorMatrix ? (
              <TableContainer sx={{ overflowX: 'auto' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell
                        sx={{
                          fontWeight: 'bold',
                          minWidth: 140,
                          position: 'sticky',
                          left: 0,
                          bgcolor: 'background.paper',
                          zIndex: 1,
                        }}
                      >
                        ענף
                      </TableCell>
                      {products.map((p) => (
                        <TableCell
                          key={p.code}
                          align="center"
                          sx={{ minWidth: 80, fontSize: '0.7rem' }}
                        >
                          <Tooltip title={p.nameHe}>
                            <span>{p.nameEn.split(' ').slice(0, 2).join(' ')}</span>
                          </Tooltip>
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(sectorMatrix).map(([sectorKey, items]) => (
                      <TableRow key={sectorKey} hover>
                        <TableCell
                          sx={{
                            fontWeight: 'bold',
                            position: 'sticky',
                            left: 0,
                            bgcolor: 'background.paper',
                            zIndex: 1,
                          }}
                        >
                          {getSectorLabel(sectorKey)}
                        </TableCell>
                        {products.map((p) => {
                          const mapping = items.find((i) => i.product.code === p.code);
                          return (
                            <TableCell key={p.code} align="center">
                              {mapping ? (
                                <Chip
                                  label={mapping.necessity === 'mandatory' ? 'M' : 'R'}
                                  size="small"
                                  color={mapping.necessity === 'mandatory' ? 'error' : 'warning'}
                                  sx={{ minWidth: 32, height: 24 }}
                                />
                              ) : (
                                <Typography color="text.disabled">-</Typography>
                              )}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography color="text.secondary">No data available</Typography>
            )}

            <Box mt={2} display="flex" gap={2}>
              <Chip label="M = חובה / Mandatory" size="small" color="error" />
              <Chip label="R = מומלץ / Recommended" size="small" color="warning" />
              <Typography variant="caption" color="text.secondary">
                - = לא נדרש
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Tab 2: Coverage Gaps */}
      {activeTab === 2 && (
        <Box>
          <Alert severity="info" sx={{ mb: 3 }}>
            הכיסויים הבאים אינם מכוסים על ידי 12 הפוליסות התקניות (BIT) ודורשים פוליסות נפרדות.
          </Alert>

          <Grid container spacing={2}>
            {[
              {
                type: 'E&O',
                nameHe: 'אחריות מקצועית',
                nameEn: 'Professional Liability',
                icon: <SecurityIcon />,
                desc: 'לא מכוסה באף פוליסת BIT תקנית. נדרשת לייעוץ, טכנולוגיה, שירותים פיננסיים.',
              },
              {
                type: 'D&O',
                nameHe: 'אחריות נושאי משרה',
                nameEn: 'Directors & Officers',
                icon: <SecurityIcon />,
                desc: 'נדרשת לחברות ציבוריות ולחברות גדולות עם דירקטוריון.',
              },
              {
                type: 'Cyber',
                nameHe: 'ביטוח סייבר',
                nameEn: 'Cyber Insurance',
                icon: <WarningIcon />,
                desc: 'ציוד אלקטרוני מכסה נזק פיזי בלבד. אחריות סייבר ודליפת מידע דורשים כיסוי נפרד.',
              },
              {
                type: 'Environmental',
                nameHe: 'אחריות סביבתית',
                nameEn: 'Environmental Liability',
                icon: <WarningIcon />,
                desc: 'רק זיהום פתאומי מכוסה תחת צד שלישי. זיהום הדרגתי דורש פוליסה נפרדת.',
              },
              {
                type: 'Marine',
                nameHe: 'ביטוח ימי',
                nameEn: 'Marine Insurance',
                icon: <SecurityIcon />,
                desc: 'מוחרג במפורש ממספר פוליסות BIT. נדרש ביטוח ימי נפרד.',
              },
              {
                type: 'Motor',
                nameHe: 'ביטוח רכב',
                nameEn: 'Motor Vehicle',
                icon: <SecurityIcon />,
                desc: 'מוחרג מפוליסות אחריות. נדרש ביטוח רכב חובה + מקיף.',
              },
            ].map((gap) => (
              <Grid item xs={12} md={6} key={gap.type}>
                <Card variant="outlined">
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      {gap.icon}
                      <Typography variant="subtitle1" fontWeight="bold">
                        {gap.nameHe}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {gap.nameEn}
                    </Typography>
                    <Typography variant="body2">{gap.desc}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Tab 3: Question-to-Coverage Mapping */}
      {activeTab === 3 && (
        <Box>
          <Alert severity="info" icon={<QuestionAnswerIcon />} sx={{ mb: 3 }}>
            <Typography variant="body2" fontWeight="bold" gutterBottom>
              מיפוי שאלות שאלון ← השפעה על כיסוי ביטוחי
            </Typography>
            <Typography variant="body2">
              טבלה זו מציגה כיצד כל שאלה בשאלון הלקוח משפיעה על החלטות כיסוי: הרחבות, סייגים, מכפילי
              גבול, וסימוני סיכון. סה&quot;כ 113 שאלות ספציפיות ב-12 מוצרי ביטוח.
            </Typography>
          </Alert>

          {QUESTION_COVERAGE_MAP.map((section) => (
            <Accordion key={section.productCode} sx={{ mb: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
                  <Chip
                    label={CATEGORY_LABELS[section.category]?.he || section.category}
                    color={CATEGORY_COLORS[section.category] || 'default'}
                    size="small"
                  />
                  <Typography variant="subtitle1" fontWeight="bold">
                    {section.productNameHe}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {section.productNameEn}
                  </Typography>
                  <Chip
                    label={`${section.questions.length} שאלות`}
                    size="small"
                    variant="outlined"
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                    {section.triggerDescription}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell padding="checkbox" />
                        <TableCell sx={{ fontWeight: 'bold', minWidth: 200 }}>שאלה</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', minWidth: 80 }}>סוג</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', minWidth: 150 }}>תוצאת כלל</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {section.questions.map((q) => {
                        const isExpanded = expandedQuestion === q.questionId;
                        return (
                          <React.Fragment key={q.questionId}>
                            <TableRow
                              hover
                              onClick={() => setExpandedQuestion(isExpanded ? null : q.questionId)}
                              sx={{
                                cursor: 'pointer',
                                '& > *': { borderBottom: isExpanded ? 'unset' : undefined },
                              }}
                            >
                              <TableCell padding="checkbox">
                                <IconButton size="small">
                                  {isExpanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                                </IconButton>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" fontWeight="bold">
                                  {q.labelHe}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {q.questionId}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={q.type}
                                  size="small"
                                  variant="outlined"
                                  sx={{ fontSize: '0.7rem' }}
                                />
                              </TableCell>
                              <TableCell>
                                {q.ruleEffect && (
                                  <Chip
                                    label={q.ruleEffect}
                                    size="small"
                                    color={
                                      q.ruleEffect.includes('הוספת הרחבה')
                                        ? 'primary'
                                        : q.ruleEffect.includes('מכפיל')
                                          ? 'warning'
                                          : q.ruleEffect.includes('סימון סיכון')
                                            ? 'error'
                                            : q.ruleEffect.includes('תנאי מוקדם')
                                              ? 'secondary'
                                              : 'default'
                                    }
                                    variant="outlined"
                                    sx={{ fontSize: '0.7rem' }}
                                  />
                                )}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell colSpan={4} sx={{ py: 0, px: 0 }}>
                                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                  <Box
                                    sx={{
                                      py: 2,
                                      px: 3,
                                      bgcolor: 'grey.50',
                                      borderInlineStart: '4px solid',
                                      borderColor: 'info.main',
                                    }}
                                  >
                                    <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                                      השפעה על כיסוי
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      sx={{ whiteSpace: 'pre-line', mb: 2 }}
                                    >
                                      {q.coverageImpact}
                                    </Typography>
                                    <Box display="flex" gap={4} flexWrap="wrap">
                                      <Box>
                                        <Typography variant="caption" color="text.secondary">
                                          סוג שדה
                                        </Typography>
                                        <Typography variant="body2">{q.type}</Typography>
                                      </Box>
                                      {q.ruleEffect && (
                                        <Box>
                                          <Typography variant="caption" color="text.secondary">
                                            תוצאת כלל
                                          </Typography>
                                          <Typography variant="body2">{q.ruleEffect}</Typography>
                                        </Box>
                                      )}
                                      <Box>
                                        <Typography variant="caption" color="text.secondary">
                                          מזהה שאלה
                                        </Typography>
                                        <Typography
                                          variant="body2"
                                          sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}
                                        >
                                          {q.questionId}
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
              </AccordionDetails>
            </Accordion>
          ))}

          {/* Legend */}
          <Paper variant="outlined" sx={{ p: 2, mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom fontWeight="bold">
              מקרא סוגי תוצאות כלל
            </Typography>
            <Box display="flex" gap={2} flexWrap="wrap">
              <Chip label="הוספת הרחבה" size="small" color="primary" variant="outlined" />
              <Chip label="מכפיל סיכון / פרמיה" size="small" color="warning" variant="outlined" />
              <Chip label="סימון סיכון" size="small" color="error" variant="outlined" />
              <Chip label="תנאי מוקדם" size="small" color="secondary" variant="outlined" />
              <Chip label="קביעת סכום / גבול / תמחור" size="small" variant="outlined" />
            </Box>
          </Paper>
        </Box>
      )}
    </Box>
  );
}
