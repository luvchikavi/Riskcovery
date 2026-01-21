import type { Questionnaire, Rule } from './questionnaire.types.js';

// Construction sector questionnaire
const constructionQuestionnaire: Questionnaire = {
  id: 'construction-v1',
  sector: 'CONSTRUCTION',
  version: '1.0',
  sections: [
    {
      id: 'company-info',
      title: 'Company Information',
      titleHe: 'פרטי החברה',
      questions: [
        {
          id: 'companyAge',
          type: 'number',
          label: 'Years in business',
          labelHe: 'שנות פעילות',
          required: true,
          min: 0,
          max: 100,
          riskWeight: 0.1,
        },
        {
          id: 'employeeCount',
          type: 'number',
          label: 'Number of employees',
          labelHe: 'מספר עובדים',
          required: true,
          min: 1,
          riskWeight: 0.15,
          affectsPolicy: ['EMPLOYER_LIABILITY'],
        },
        {
          id: 'annualRevenue',
          type: 'currency',
          label: 'Annual revenue (ILS)',
          labelHe: 'מחזור שנתי (₪)',
          required: true,
          min: 0,
          riskWeight: 0.2,
        },
      ],
    },
    {
      id: 'project-types',
      title: 'Project Types',
      titleHe: 'סוגי פרויקטים',
      questions: [
        {
          id: 'projectTypes',
          type: 'multiselect',
          label: 'Types of construction work',
          labelHe: 'סוגי עבודות בנייה',
          required: true,
          options: [
            { value: 'residential', label: 'Residential', labelHe: 'מגורים' },
            { value: 'commercial', label: 'Commercial', labelHe: 'מסחרי' },
            { value: 'industrial', label: 'Industrial', labelHe: 'תעשייתי' },
            { value: 'infrastructure', label: 'Infrastructure', labelHe: 'תשתיות' },
            { value: 'renovation', label: 'Renovation', labelHe: 'שיפוצים' },
          ],
          riskWeight: 0.2,
        },
        {
          id: 'maxProjectValue',
          type: 'currency',
          label: 'Maximum single project value',
          labelHe: 'שווי פרויקט מקסימלי',
          required: true,
          riskWeight: 0.25,
          affectsPolicy: ['CAR_INSURANCE'],
        },
        {
          id: 'heightWork',
          type: 'boolean',
          label: 'Work at height (above 2 meters)',
          labelHe: 'עבודה בגובה (מעל 2 מטר)',
          required: true,
          riskWeight: 0.15,
          affectsPolicy: ['EMPLOYER_LIABILITY', 'GENERAL_LIABILITY'],
        },
      ],
    },
    {
      id: 'subcontractors',
      title: 'Subcontractors',
      titleHe: 'קבלני משנה',
      questions: [
        {
          id: 'usesSubcontractors',
          type: 'boolean',
          label: 'Do you use subcontractors?',
          labelHe: 'האם אתם עובדים עם קבלני משנה?',
          required: true,
        },
        {
          id: 'subcontractorPercentage',
          type: 'number',
          label: 'Percentage of work by subcontractors',
          labelHe: 'אחוז עבודה על ידי קבלני משנה',
          required: true,
          min: 0,
          max: 100,
          showIf: [{ questionId: 'usesSubcontractors', operator: 'equals', value: true }],
          riskWeight: 0.1,
        },
        {
          id: 'requireSubcontractorInsurance',
          type: 'boolean',
          label: 'Do you require subcontractors to have insurance?',
          labelHe: 'האם אתם דורשים ביטוח מקבלני משנה?',
          required: true,
          showIf: [{ questionId: 'usesSubcontractors', operator: 'equals', value: true }],
        },
      ],
    },
    {
      id: 'special-risks',
      title: 'Special Risks',
      titleHe: 'סיכונים מיוחדים',
      questions: [
        {
          id: 'undergroundWork',
          type: 'boolean',
          label: 'Underground work',
          labelHe: 'עבודות תת-קרקעיות',
          required: true,
          riskWeight: 0.2,
          affectsPolicy: ['GENERAL_LIABILITY', 'CAR_INSURANCE'],
        },
        {
          id: 'demolitionWork',
          type: 'boolean',
          label: 'Demolition work',
          labelHe: 'עבודות הריסה',
          required: true,
          riskWeight: 0.15,
        },
        {
          id: 'hazardousMaterials',
          type: 'boolean',
          label: 'Work with hazardous materials',
          labelHe: 'עבודה עם חומרים מסוכנים',
          required: true,
          riskWeight: 0.2,
          affectsPolicy: ['GENERAL_LIABILITY', 'EMPLOYER_LIABILITY'],
        },
      ],
    },
  ],
};

// Technology sector questionnaire
const technologyQuestionnaire: Questionnaire = {
  id: 'technology-v1',
  sector: 'TECHNOLOGY',
  version: '1.0',
  sections: [
    {
      id: 'company-info',
      title: 'Company Information',
      titleHe: 'פרטי החברה',
      questions: [
        {
          id: 'companyAge',
          type: 'number',
          label: 'Years in business',
          labelHe: 'שנות פעילות',
          required: true,
          min: 0,
        },
        {
          id: 'employeeCount',
          type: 'number',
          label: 'Number of employees',
          labelHe: 'מספר עובדים',
          required: true,
          min: 1,
          riskWeight: 0.1,
        },
        {
          id: 'annualRevenue',
          type: 'currency',
          label: 'Annual revenue (ILS)',
          labelHe: 'מחזור שנתי (₪)',
          required: true,
          riskWeight: 0.15,
        },
      ],
    },
    {
      id: 'services',
      title: 'Services & Products',
      titleHe: 'שירותים ומוצרים',
      questions: [
        {
          id: 'serviceTypes',
          type: 'multiselect',
          label: 'Types of services/products',
          labelHe: 'סוגי שירותים/מוצרים',
          required: true,
          options: [
            { value: 'software_dev', label: 'Software Development', labelHe: 'פיתוח תוכנה' },
            { value: 'consulting', label: 'IT Consulting', labelHe: 'ייעוץ IT' },
            { value: 'saas', label: 'SaaS Products', labelHe: 'מוצרי SaaS' },
            { value: 'managed_services', label: 'Managed Services', labelHe: 'שירותים מנוהלים' },
            { value: 'cybersecurity', label: 'Cybersecurity', labelHe: 'אבטחת סייבר' },
            { value: 'ai_ml', label: 'AI/ML Services', labelHe: 'שירותי AI/ML' },
          ],
          riskWeight: 0.2,
          affectsPolicy: ['PROFESSIONAL_INDEMNITY', 'CYBER_LIABILITY'],
        },
        {
          id: 'maxContractValue',
          type: 'currency',
          label: 'Maximum single contract value',
          labelHe: 'שווי חוזה מקסימלי',
          required: true,
          riskWeight: 0.2,
          affectsPolicy: ['PROFESSIONAL_INDEMNITY'],
        },
      ],
    },
    {
      id: 'data-handling',
      title: 'Data & Security',
      titleHe: 'נתונים ואבטחה',
      questions: [
        {
          id: 'handlesPersonalData',
          type: 'boolean',
          label: 'Do you handle personal/sensitive data?',
          labelHe: 'האם אתם מטפלים במידע אישי/רגיש?',
          required: true,
          riskWeight: 0.25,
          affectsPolicy: ['CYBER_LIABILITY'],
        },
        {
          id: 'dataRecordsCount',
          type: 'select',
          label: 'Approximate number of data records',
          labelHe: 'מספר רשומות נתונים משוער',
          required: true,
          showIf: [{ questionId: 'handlesPersonalData', operator: 'equals', value: true }],
          options: [
            { value: 'under_10k', label: 'Under 10,000', labelHe: 'פחות מ-10,000' },
            { value: '10k_100k', label: '10,000 - 100,000', labelHe: '10,000 - 100,000' },
            { value: '100k_1m', label: '100,000 - 1,000,000', labelHe: '100,000 - 1,000,000' },
            { value: 'over_1m', label: 'Over 1,000,000', labelHe: 'מעל 1,000,000' },
          ],
          riskWeight: 0.2,
          affectsPolicy: ['CYBER_LIABILITY'],
        },
        {
          id: 'hasSecurityCertification',
          type: 'boolean',
          label: 'Do you have security certifications (ISO 27001, SOC2)?',
          labelHe: 'האם יש לכם הסמכות אבטחה (ISO 27001, SOC2)?',
          required: true,
          riskWeight: -0.1, // Reduces risk
        },
      ],
    },
    {
      id: 'international',
      title: 'International Operations',
      titleHe: 'פעילות בינלאומית',
      questions: [
        {
          id: 'hasInternationalClients',
          type: 'boolean',
          label: 'Do you have international clients?',
          labelHe: 'האם יש לכם לקוחות בינלאומיים?',
          required: true,
        },
        {
          id: 'operatesInUS',
          type: 'boolean',
          label: 'Operations in the United States?',
          labelHe: 'פעילות בארה"ב?',
          required: true,
          showIf: [{ questionId: 'hasInternationalClients', operator: 'equals', value: true }],
          riskWeight: 0.3,
          affectsPolicy: ['PROFESSIONAL_INDEMNITY', 'CYBER_LIABILITY'],
        },
      ],
    },
  ],
};

// Generic questionnaire for other sectors
const genericQuestionnaire: Questionnaire = {
  id: 'generic-v1',
  sector: 'GENERIC',
  version: '1.0',
  sections: [
    {
      id: 'company-info',
      title: 'Company Information',
      titleHe: 'פרטי החברה',
      questions: [
        {
          id: 'companyAge',
          type: 'number',
          label: 'Years in business',
          labelHe: 'שנות פעילות',
          required: true,
          min: 0,
        },
        {
          id: 'employeeCount',
          type: 'number',
          label: 'Number of employees',
          labelHe: 'מספר עובדים',
          required: true,
          min: 1,
          riskWeight: 0.15,
        },
        {
          id: 'annualRevenue',
          type: 'currency',
          label: 'Annual revenue (ILS)',
          labelHe: 'מחזור שנתי (₪)',
          required: true,
          riskWeight: 0.2,
        },
        {
          id: 'businessDescription',
          type: 'text',
          label: 'Brief business description',
          labelHe: 'תיאור קצר של העסק',
          required: true,
        },
      ],
    },
    {
      id: 'operations',
      title: 'Operations',
      titleHe: 'פעילות',
      questions: [
        {
          id: 'hasPhysicalLocation',
          type: 'boolean',
          label: 'Do you have physical business locations?',
          labelHe: 'האם יש לכם מיקומים פיזיים?',
          required: true,
        },
        {
          id: 'locationCount',
          type: 'number',
          label: 'Number of locations',
          labelHe: 'מספר מיקומים',
          required: true,
          min: 1,
          showIf: [{ questionId: 'hasPhysicalLocation', operator: 'equals', value: true }],
        },
        {
          id: 'hasVisitors',
          type: 'boolean',
          label: 'Do customers/visitors come to your premises?',
          labelHe: 'האם לקוחות/מבקרים מגיעים למקום?',
          required: true,
          affectsPolicy: ['GENERAL_LIABILITY'],
        },
      ],
    },
    {
      id: 'risks',
      title: 'Risk Assessment',
      titleHe: 'הערכת סיכונים',
      questions: [
        {
          id: 'previousClaims',
          type: 'boolean',
          label: 'Any insurance claims in the past 5 years?',
          labelHe: 'האם היו תביעות ביטוח ב-5 השנים האחרונות?',
          required: true,
          riskWeight: 0.2,
        },
        {
          id: 'claimCount',
          type: 'number',
          label: 'Number of claims',
          labelHe: 'מספר תביעות',
          required: true,
          min: 0,
          showIf: [{ questionId: 'previousClaims', operator: 'equals', value: true }],
          riskWeight: 0.15,
        },
      ],
    },
  ],
};

// Export questionnaires by sector
export const questionnaireTemplates: Record<string, Questionnaire> = {
  CONSTRUCTION: constructionQuestionnaire,
  TECHNOLOGY: technologyQuestionnaire,
  GENERIC: genericQuestionnaire,
  // Add more sector-specific questionnaires as needed
  MANUFACTURING: genericQuestionnaire,
  RETAIL: genericQuestionnaire,
  HEALTHCARE: genericQuestionnaire,
  LOGISTICS: genericQuestionnaire,
  CONSULTING: genericQuestionnaire,
};

// Rule definitions for coverage recommendations
export const coverageRules: Rule[] = [
  // Employee count rules
  {
    id: 'rule-emp-small',
    name: 'Small company adjustment',
    description: 'Reduced limits for companies under 20 employees',
    priority: 10,
    conditions: [{ field: 'employeeCount', operator: 'lessThan', value: 20 }],
    actions: [{ type: 'adjustLimit', policyType: 'EMPLOYER_LIABILITY', multiplier: 0.7 }],
  },
  {
    id: 'rule-emp-medium',
    name: 'Medium company adjustment',
    description: 'Standard limits for 20-100 employees',
    priority: 10,
    conditions: [
      { field: 'employeeCount', operator: 'greaterThan', value: 19 },
      { field: 'employeeCount', operator: 'lessThan', value: 101 },
    ],
    actions: [{ type: 'adjustLimit', policyType: 'EMPLOYER_LIABILITY', multiplier: 1.0 }],
  },
  {
    id: 'rule-emp-large',
    name: 'Large company adjustment',
    description: 'Increased limits for over 100 employees',
    priority: 10,
    conditions: [{ field: 'employeeCount', operator: 'greaterThan', value: 100 }],
    actions: [{ type: 'adjustLimit', policyType: 'EMPLOYER_LIABILITY', multiplier: 1.5 }],
  },

  // Revenue-based rules
  {
    id: 'rule-revenue-high',
    name: 'High revenue adjustment',
    description: 'Increased limits for companies over 50M revenue',
    priority: 20,
    conditions: [{ field: 'annualRevenue', operator: 'greaterThan', value: 50000000 }],
    actions: [
      { type: 'adjustLimit', policyType: 'GENERAL_LIABILITY', multiplier: 1.5 },
      { type: 'adjustLimit', policyType: 'PROFESSIONAL_INDEMNITY', multiplier: 1.5 },
    ],
  },

  // Construction-specific rules
  {
    id: 'rule-height-work',
    name: 'Height work coverage',
    description: 'Additional coverage for work at height',
    priority: 30,
    conditions: [{ field: 'heightWork', operator: 'equals', value: true }],
    actions: [
      { type: 'adjustLimit', policyType: 'EMPLOYER_LIABILITY', multiplier: 1.3 },
      { type: 'addEndorsement', policyType: 'EMPLOYER_LIABILITY', endorsement: 'עבודה בגובה' },
    ],
  },
  {
    id: 'rule-underground',
    name: 'Underground work coverage',
    description: 'Additional coverage for underground work',
    priority: 30,
    conditions: [{ field: 'undergroundWork', operator: 'equals', value: true }],
    actions: [
      { type: 'adjustLimit', policyType: 'GENERAL_LIABILITY', multiplier: 1.4 },
      { type: 'addEndorsement', policyType: 'CAR_INSURANCE', endorsement: 'עבודות תת-קרקעיות' },
    ],
  },
  {
    id: 'rule-hazmat',
    name: 'Hazardous materials coverage',
    description: 'Coverage for hazardous materials handling',
    priority: 30,
    conditions: [{ field: 'hazardousMaterials', operator: 'equals', value: true }],
    actions: [
      { type: 'adjustLimit', policyType: 'GENERAL_LIABILITY', multiplier: 1.5 },
      { type: 'adjustLimit', policyType: 'EMPLOYER_LIABILITY', multiplier: 1.3 },
      { type: 'addEndorsement', policyType: 'GENERAL_LIABILITY', endorsement: 'חומרים מסוכנים' },
    ],
  },

  // Technology-specific rules
  {
    id: 'rule-handles-pii',
    name: 'Personal data handling',
    description: 'Mandatory cyber coverage for PII handling',
    priority: 40,
    conditions: [{ field: 'handlesPersonalData', operator: 'equals', value: true }],
    actions: [
      { type: 'setMandatory', policyType: 'CYBER_LIABILITY', mandatory: true },
      { type: 'adjustLimit', policyType: 'CYBER_LIABILITY', multiplier: 1.5 },
    ],
  },
  {
    id: 'rule-us-ops',
    name: 'US Operations coverage',
    description: 'Increased coverage for US operations',
    priority: 50,
    conditions: [{ field: 'operatesInUS', operator: 'equals', value: true }],
    actions: [
      { type: 'adjustLimit', policyType: 'PROFESSIONAL_INDEMNITY', multiplier: 2.0 },
      { type: 'adjustLimit', policyType: 'CYBER_LIABILITY', multiplier: 2.0 },
      { type: 'addEndorsement', policyType: 'PROFESSIONAL_INDEMNITY', endorsement: 'כיסוי ארה"ב' },
    ],
  },
  {
    id: 'rule-security-cert',
    name: 'Security certification discount',
    description: 'Reduced limits for certified companies',
    priority: 60,
    conditions: [{ field: 'hasSecurityCertification', operator: 'equals', value: true }],
    actions: [
      { type: 'adjustLimit', policyType: 'CYBER_LIABILITY', multiplier: 0.8 },
    ],
  },

  // Previous claims rules
  {
    id: 'rule-previous-claims',
    name: 'Claims history adjustment',
    description: 'Increased limits for companies with claims history',
    priority: 70,
    conditions: [{ field: 'previousClaims', operator: 'equals', value: true }],
    actions: [
      { type: 'adjustLimit', policyType: 'GENERAL_LIABILITY', multiplier: 1.2 },
    ],
  },
];
