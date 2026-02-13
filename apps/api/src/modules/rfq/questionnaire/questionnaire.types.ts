// @ts-nocheck
// Question types for the dynamic questionnaire
export type QuestionType =
  | 'text'
  | 'number'
  | 'select'
  | 'multiselect'
  | 'boolean'
  | 'date'
  | 'currency';

export interface QuestionOption {
  value: string;
  label: string;
  labelHe: string;
}

export interface QuestionCondition {
  questionId: string;
  operator: 'equals' | 'notEquals' | 'greaterThan' | 'lessThan' | 'contains' | 'in';
  value: string | number | boolean | string[];
}

export interface Question {
  id: string;
  type: QuestionType;
  label: string;
  labelHe: string;
  description?: string;
  descriptionHe?: string;
  required: boolean;
  options?: QuestionOption[];
  placeholder?: string;
  placeholderHe?: string;
  min?: number;
  max?: number;
  // Conditional display
  showIf?: QuestionCondition[];
  // Risk impact
  riskWeight?: number;
  affectsPolicy?: string[];
}

export interface QuestionSection {
  id: string;
  title: string;
  titleHe: string;
  description?: string;
  descriptionHe?: string;
  questions: Question[];
  showIf?: QuestionCondition[];
}

export interface Questionnaire {
  id: string;
  sector: string;
  version: string;
  sections: QuestionSection[];
}

export type QuestionnaireAnswerValue = string | number | boolean | string[] | null | undefined;

export interface QuestionnaireAnswers {
  [questionId: string]: QuestionnaireAnswerValue;
}

// Rule engine types
export interface RuleCondition {
  field: string;
  operator: 'equals' | 'notEquals' | 'greaterThan' | 'lessThan' | 'in' | 'contains';
  value: unknown;
}

export interface RuleAction {
  type: 'addPolicy' | 'removePolicy' | 'adjustLimit' | 'addEndorsement' | 'setMandatory'
    | 'addExtension' | 'removeExtension' | 'flagCoverageGap';
  policyType?: string;
  endorsement?: string;
  multiplier?: number;
  amount?: number;
  mandatory?: boolean;
  // New fields for extension/coverage gap actions
  extensionCode?: string;
  extensionName?: string;
  gapType?: string;
  gapDescription?: string;
}

export interface Rule {
  id: string;
  name: string;
  description: string;
  priority: number;
  conditions: RuleCondition[];
  actions: RuleAction[];
}

// Enriched recommendation tied to real product catalog
export interface EnrichedCoverageRecommendation {
  productCode: string;
  productNameHe: string;
  productNameEn: string;
  category: string;
  coverageTrigger: string;
  recommendedLimit: number;
  isMandatory: boolean;
  necessity: string; // mandatory, recommended, optional
  endorsements: string[];
  extensions: RecommendedExtension[];
  exclusionCount: number;
  relatedProducts: RelatedProductInfo[];
  adjustmentReason?: string;
  description?: string;
  descriptionHe?: string;
}

export interface RecommendedExtension {
  code: string;
  nameHe: string;
  nameEn: string;
  chapterCode?: string;
  defaultLimit?: number;
  isFirstLoss: boolean;
}

export interface RelatedProductInfo {
  productCode: string;
  productNameHe: string;
  productNameEn: string;
  relationType: string;
  description?: string;
}

export interface CoverageGap {
  type: string;
  nameHe: string;
  nameEn: string;
  description: string;
  descriptionHe: string;
  severity: 'advisory' | 'warning' | 'critical';
}

// Standard coverage gaps not covered by the 12 BIT products
export const STANDARD_COVERAGE_GAPS: CoverageGap[] = [
  {
    type: 'PROFESSIONAL_LIABILITY',
    nameHe: 'אחריות מקצועית (E&O)',
    nameEn: 'Professional Liability (E&O)',
    description: 'Not covered by any of the 12 BIT standard policies. Separate E&O policy required.',
    descriptionHe: 'לא מכוסה באף אחת מ-12 הפוליסות התקניות. נדרשת פוליסת אחריות מקצועית נפרדת.',
    severity: 'advisory',
  },
  {
    type: 'DIRECTORS_OFFICERS',
    nameHe: 'אחריות נושאי משרה (D&O)',
    nameEn: 'Directors & Officers (D&O)',
    description: 'Not covered by standard policies. Separate D&O policy required for public/large companies.',
    descriptionHe: 'לא מכוסה בפוליסות תקניות. נדרשת פוליסת D&O נפרדת לחברות ציבוריות/גדולות.',
    severity: 'advisory',
  },
  {
    type: 'CYBER',
    nameHe: 'ביטוח סייבר',
    nameEn: 'Cyber Insurance',
    description: 'Electronic Equipment covers physical damage only, not cyber liability or data breach costs.',
    descriptionHe: 'ציוד אלקטרוני מכסה נזק פיזי בלבד, לא אחריות סייבר או עלויות דליפת מידע.',
    severity: 'advisory',
  },
  {
    type: 'ENVIRONMENTAL',
    nameHe: 'אחריות סביבתית',
    nameEn: 'Environmental/Pollution Liability',
    description: 'Only sudden/accidental pollution covered under TPL. Gradual pollution requires separate policy.',
    descriptionHe: 'רק זיהום פתאומי מכוסה תחת צד שלישי. זיהום הדרגתי דורש פוליסה נפרדת.',
    severity: 'advisory',
  },
  {
    type: 'MARINE',
    nameHe: 'ביטוח ימי',
    nameEn: 'Marine Insurance',
    description: 'Explicitly excluded from multiple policies. Separate marine policy required.',
    descriptionHe: 'מוחרג במפורש ממספר פוליסות. נדרש ביטוח ימי נפרד.',
    severity: 'advisory',
  },
  {
    type: 'MOTOR_VEHICLE',
    nameHe: 'ביטוח רכב',
    nameEn: 'Motor Vehicle',
    description: 'Excluded from liability policies. Requires separate motor policy (compulsory + comprehensive).',
    descriptionHe: 'מוחרג מפוליסות אחריות. נדרש ביטוח רכב נפרד (חובה + מקיף).',
    severity: 'advisory',
  },
];
