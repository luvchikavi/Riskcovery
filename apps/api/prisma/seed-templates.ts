import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Sector translations
const sectorTranslations: Record<string, string> = {
  CONSTRUCTION: 'בנייה',
  TECHNOLOGY: 'טכנולוגיה',
  GENERIC: 'כללי',
  MANUFACTURING: 'ייצור',
  RETAIL: 'קמעונאות',
  HEALTHCARE: 'בריאות',
  LOGISTICS: 'לוגיסטיקה',
  CONSULTING: 'ייעוץ',
};

// Construction sector questionnaire
const constructionSections = [
  {
    title: 'Company Information',
    titleHe: 'פרטי החברה',
    order: 0,
    questions: [
      {
        questionId: 'companyAge',
        type: 'number',
        label: 'Years in business',
        labelHe: 'שנות פעילות',
        required: true,
        min: 0,
        max: 100,
        riskWeight: 0.1,
        order: 0,
      },
      {
        questionId: 'employeeCount',
        type: 'number',
        label: 'Number of employees',
        labelHe: 'מספר עובדים',
        required: true,
        min: 1,
        riskWeight: 0.15,
        policyAffinity: ['EMPLOYER_LIABILITY'],
        order: 1,
      },
      {
        questionId: 'annualRevenue',
        type: 'currency',
        label: 'Annual revenue (ILS)',
        labelHe: 'מחזור שנתי (₪)',
        required: true,
        min: 0,
        riskWeight: 0.2,
        order: 2,
      },
    ],
  },
  {
    title: 'Project Types',
    titleHe: 'סוגי פרויקטים',
    order: 1,
    questions: [
      {
        questionId: 'projectTypes',
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
        order: 0,
      },
      {
        questionId: 'maxProjectValue',
        type: 'currency',
        label: 'Maximum single project value',
        labelHe: 'שווי פרויקט מקסימלי',
        required: true,
        riskWeight: 0.25,
        policyAffinity: ['CAR_INSURANCE'],
        order: 1,
      },
      {
        questionId: 'heightWork',
        type: 'boolean',
        label: 'Work at height (above 2 meters)',
        labelHe: 'עבודה בגובה (מעל 2 מטר)',
        required: true,
        riskWeight: 0.15,
        policyAffinity: ['EMPLOYER_LIABILITY', 'GENERAL_LIABILITY'],
        order: 2,
      },
    ],
  },
  {
    title: 'Subcontractors',
    titleHe: 'קבלני משנה',
    order: 2,
    questions: [
      {
        questionId: 'usesSubcontractors',
        type: 'boolean',
        label: 'Do you use subcontractors?',
        labelHe: 'האם אתם עובדים עם קבלני משנה?',
        required: true,
        order: 0,
      },
      {
        questionId: 'subcontractorPercentage',
        type: 'number',
        label: 'Percentage of work by subcontractors',
        labelHe: 'אחוז עבודה על ידי קבלני משנה',
        required: true,
        min: 0,
        max: 100,
        showIf: [{ questionId: 'usesSubcontractors', operator: 'equals', value: true }],
        riskWeight: 0.1,
        order: 1,
      },
      {
        questionId: 'requireSubcontractorInsurance',
        type: 'boolean',
        label: 'Do you require subcontractors to have insurance?',
        labelHe: 'האם אתם דורשים ביטוח מקבלני משנה?',
        required: true,
        showIf: [{ questionId: 'usesSubcontractors', operator: 'equals', value: true }],
        order: 2,
      },
    ],
  },
  {
    title: 'Special Risks',
    titleHe: 'סיכונים מיוחדים',
    order: 3,
    questions: [
      {
        questionId: 'undergroundWork',
        type: 'boolean',
        label: 'Underground work',
        labelHe: 'עבודות תת-קרקעיות',
        required: true,
        riskWeight: 0.2,
        policyAffinity: ['GENERAL_LIABILITY', 'CAR_INSURANCE'],
        order: 0,
      },
      {
        questionId: 'demolitionWork',
        type: 'boolean',
        label: 'Demolition work',
        labelHe: 'עבודות הריסה',
        required: true,
        riskWeight: 0.15,
        order: 1,
      },
      {
        questionId: 'hazardousMaterials',
        type: 'boolean',
        label: 'Work with hazardous materials',
        labelHe: 'עבודה עם חומרים מסוכנים',
        required: true,
        riskWeight: 0.2,
        policyAffinity: ['GENERAL_LIABILITY', 'EMPLOYER_LIABILITY'],
        order: 2,
      },
    ],
  },
];

// Technology sector questionnaire
const technologySections = [
  {
    title: 'Company Information',
    titleHe: 'פרטי החברה',
    order: 0,
    questions: [
      {
        questionId: 'companyAge',
        type: 'number',
        label: 'Years in business',
        labelHe: 'שנות פעילות',
        required: true,
        min: 0,
        order: 0,
      },
      {
        questionId: 'employeeCount',
        type: 'number',
        label: 'Number of employees',
        labelHe: 'מספר עובדים',
        required: true,
        min: 1,
        riskWeight: 0.1,
        order: 1,
      },
      {
        questionId: 'annualRevenue',
        type: 'currency',
        label: 'Annual revenue (ILS)',
        labelHe: 'מחזור שנתי (₪)',
        required: true,
        riskWeight: 0.15,
        order: 2,
      },
    ],
  },
  {
    title: 'Services & Products',
    titleHe: 'שירותים ומוצרים',
    order: 1,
    questions: [
      {
        questionId: 'serviceTypes',
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
        policyAffinity: ['PROFESSIONAL_INDEMNITY', 'CYBER_LIABILITY'],
        order: 0,
      },
      {
        questionId: 'maxContractValue',
        type: 'currency',
        label: 'Maximum single contract value',
        labelHe: 'שווי חוזה מקסימלי',
        required: true,
        riskWeight: 0.2,
        policyAffinity: ['PROFESSIONAL_INDEMNITY'],
        order: 1,
      },
    ],
  },
  {
    title: 'Data & Security',
    titleHe: 'נתונים ואבטחה',
    order: 2,
    questions: [
      {
        questionId: 'handlesPersonalData',
        type: 'boolean',
        label: 'Do you handle personal/sensitive data?',
        labelHe: 'האם אתם מטפלים במידע אישי/רגיש?',
        required: true,
        riskWeight: 0.25,
        policyAffinity: ['CYBER_LIABILITY'],
        order: 0,
      },
      {
        questionId: 'dataRecordsCount',
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
        policyAffinity: ['CYBER_LIABILITY'],
        order: 1,
      },
      {
        questionId: 'hasSecurityCertification',
        type: 'boolean',
        label: 'Do you have security certifications (ISO 27001, SOC2)?',
        labelHe: 'האם יש לכם הסמכות אבטחה (ISO 27001, SOC2)?',
        required: true,
        riskWeight: -0.1,
        order: 2,
      },
    ],
  },
  {
    title: 'International Operations',
    titleHe: 'פעילות בינלאומית',
    order: 3,
    questions: [
      {
        questionId: 'hasInternationalClients',
        type: 'boolean',
        label: 'Do you have international clients?',
        labelHe: 'האם יש לכם לקוחות בינלאומיים?',
        required: true,
        order: 0,
      },
      {
        questionId: 'operatesInUS',
        type: 'boolean',
        label: 'Operations in the United States?',
        labelHe: 'פעילות בארה"ב?',
        required: true,
        showIf: [{ questionId: 'hasInternationalClients', operator: 'equals', value: true }],
        riskWeight: 0.3,
        policyAffinity: ['PROFESSIONAL_INDEMNITY', 'CYBER_LIABILITY'],
        order: 1,
      },
    ],
  },
];

// Generic questionnaire
const genericSections = [
  {
    title: 'Company Information',
    titleHe: 'פרטי החברה',
    order: 0,
    questions: [
      {
        questionId: 'companyAge',
        type: 'number',
        label: 'Years in business',
        labelHe: 'שנות פעילות',
        required: true,
        min: 0,
        order: 0,
      },
      {
        questionId: 'employeeCount',
        type: 'number',
        label: 'Number of employees',
        labelHe: 'מספר עובדים',
        required: true,
        min: 1,
        riskWeight: 0.15,
        order: 1,
      },
      {
        questionId: 'annualRevenue',
        type: 'currency',
        label: 'Annual revenue (ILS)',
        labelHe: 'מחזור שנתי (₪)',
        required: true,
        riskWeight: 0.2,
        order: 2,
      },
      {
        questionId: 'businessDescription',
        type: 'text',
        label: 'Brief business description',
        labelHe: 'תיאור קצר של העסק',
        required: true,
        order: 3,
      },
    ],
  },
  {
    title: 'Operations',
    titleHe: 'פעילות',
    order: 1,
    questions: [
      {
        questionId: 'hasPhysicalLocation',
        type: 'boolean',
        label: 'Do you have physical business locations?',
        labelHe: 'האם יש לכם מיקומים פיזיים?',
        required: true,
        order: 0,
      },
      {
        questionId: 'locationCount',
        type: 'number',
        label: 'Number of locations',
        labelHe: 'מספר מיקומים',
        required: true,
        min: 1,
        showIf: [{ questionId: 'hasPhysicalLocation', operator: 'equals', value: true }],
        order: 1,
      },
      {
        questionId: 'hasVisitors',
        type: 'boolean',
        label: 'Do customers/visitors come to your premises?',
        labelHe: 'האם לקוחות/מבקרים מגיעים למקום?',
        required: true,
        policyAffinity: ['GENERAL_LIABILITY'],
        order: 2,
      },
    ],
  },
  {
    title: 'Risk Assessment',
    titleHe: 'הערכת סיכונים',
    order: 2,
    questions: [
      {
        questionId: 'previousClaims',
        type: 'boolean',
        label: 'Any insurance claims in the past 5 years?',
        labelHe: 'האם היו תביעות ביטוח ב-5 השנים האחרונות?',
        required: true,
        riskWeight: 0.2,
        order: 0,
      },
      {
        questionId: 'claimCount',
        type: 'number',
        label: 'Number of claims',
        labelHe: 'מספר תביעות',
        required: true,
        min: 0,
        showIf: [{ questionId: 'previousClaims', operator: 'equals', value: true }],
        riskWeight: 0.15,
        order: 1,
      },
    ],
  },
];

// Coverage rules
const coverageRules = [
  // Employee count rules
  {
    name: 'Small company adjustment',
    nameHe: 'התאמת חברה קטנה',
    description: 'Reduced limits for companies under 20 employees',
    descriptionHe: 'הפחתת סכומים לחברות עם פחות מ-20 עובדים',
    priority: 10,
    conditions: [{ field: 'employeeCount', operator: 'lessThan', value: 20 }],
    actions: [{ type: 'adjustLimit', policyType: 'EMPLOYER_LIABILITY', multiplier: 0.7 }],
  },
  {
    name: 'Medium company adjustment',
    nameHe: 'התאמת חברה בינונית',
    description: 'Standard limits for 20-100 employees',
    descriptionHe: 'סכומים סטנדרטיים עבור 20-100 עובדים',
    priority: 10,
    conditions: [
      { field: 'employeeCount', operator: 'greaterThan', value: 19 },
      { field: 'employeeCount', operator: 'lessThan', value: 101 },
    ],
    actions: [{ type: 'adjustLimit', policyType: 'EMPLOYER_LIABILITY', multiplier: 1.0 }],
  },
  {
    name: 'Large company adjustment',
    nameHe: 'התאמת חברה גדולה',
    description: 'Increased limits for over 100 employees',
    descriptionHe: 'הגדלת סכומים לחברות עם מעל 100 עובדים',
    priority: 10,
    conditions: [{ field: 'employeeCount', operator: 'greaterThan', value: 100 }],
    actions: [{ type: 'adjustLimit', policyType: 'EMPLOYER_LIABILITY', multiplier: 1.5 }],
  },
  // Revenue-based rules
  {
    name: 'High revenue adjustment',
    nameHe: 'התאמת מחזור גבוה',
    description: 'Increased limits for companies over 50M revenue',
    descriptionHe: 'הגדלת סכומים לחברות עם מחזור מעל 50 מיליון',
    priority: 20,
    conditions: [{ field: 'annualRevenue', operator: 'greaterThan', value: 50000000 }],
    actions: [
      { type: 'adjustLimit', policyType: 'GENERAL_LIABILITY', multiplier: 1.5 },
      { type: 'adjustLimit', policyType: 'PROFESSIONAL_INDEMNITY', multiplier: 1.5 },
    ],
  },
  // Construction-specific rules
  {
    name: 'Height work coverage',
    nameHe: 'כיסוי עבודה בגובה',
    description: 'Additional coverage for work at height',
    descriptionHe: 'כיסוי נוסף עבור עבודה בגובה',
    priority: 30,
    conditions: [{ field: 'heightWork', operator: 'equals', value: true }],
    actions: [
      { type: 'adjustLimit', policyType: 'EMPLOYER_LIABILITY', multiplier: 1.3 },
      { type: 'addEndorsement', policyType: 'EMPLOYER_LIABILITY', endorsement: 'עבודה בגובה' },
    ],
  },
  {
    name: 'Underground work coverage',
    nameHe: 'כיסוי עבודות תת-קרקעיות',
    description: 'Additional coverage for underground work',
    descriptionHe: 'כיסוי נוסף עבור עבודות תת-קרקעיות',
    priority: 30,
    conditions: [{ field: 'undergroundWork', operator: 'equals', value: true }],
    actions: [
      { type: 'adjustLimit', policyType: 'GENERAL_LIABILITY', multiplier: 1.4 },
      { type: 'addEndorsement', policyType: 'CAR_INSURANCE', endorsement: 'עבודות תת-קרקעיות' },
    ],
  },
  {
    name: 'Hazardous materials coverage',
    nameHe: 'כיסוי חומרים מסוכנים',
    description: 'Coverage for hazardous materials handling',
    descriptionHe: 'כיסוי עבור טיפול בחומרים מסוכנים',
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
    name: 'Personal data handling',
    nameHe: 'טיפול במידע אישי',
    description: 'Mandatory cyber coverage for PII handling',
    descriptionHe: 'כיסוי סייבר חובה עבור טיפול במידע אישי',
    priority: 40,
    conditions: [{ field: 'handlesPersonalData', operator: 'equals', value: true }],
    actions: [
      { type: 'setMandatory', policyType: 'CYBER_LIABILITY', mandatory: true },
      { type: 'adjustLimit', policyType: 'CYBER_LIABILITY', multiplier: 1.5 },
    ],
  },
  {
    name: 'US Operations coverage',
    nameHe: 'כיסוי פעילות בארה"ב',
    description: 'Increased coverage for US operations',
    descriptionHe: 'כיסוי מוגבר עבור פעילות בארה"ב',
    priority: 50,
    conditions: [{ field: 'operatesInUS', operator: 'equals', value: true }],
    actions: [
      { type: 'adjustLimit', policyType: 'PROFESSIONAL_INDEMNITY', multiplier: 2.0 },
      { type: 'adjustLimit', policyType: 'CYBER_LIABILITY', multiplier: 2.0 },
      { type: 'addEndorsement', policyType: 'PROFESSIONAL_INDEMNITY', endorsement: 'כיסוי ארה"ב' },
    ],
  },
  {
    name: 'Security certification discount',
    nameHe: 'הנחת הסמכת אבטחה',
    description: 'Reduced limits for certified companies',
    descriptionHe: 'הפחתת סכומים לחברות מוסמכות',
    priority: 60,
    conditions: [{ field: 'hasSecurityCertification', operator: 'equals', value: true }],
    actions: [{ type: 'adjustLimit', policyType: 'CYBER_LIABILITY', multiplier: 0.8 }],
  },
  // Previous claims rules
  {
    name: 'Claims history adjustment',
    nameHe: 'התאמת היסטוריית תביעות',
    description: 'Increased limits for companies with claims history',
    descriptionHe: 'הגדלת סכומים לחברות עם היסטוריית תביעות',
    priority: 70,
    conditions: [{ field: 'previousClaims', operator: 'equals', value: true }],
    actions: [{ type: 'adjustLimit', policyType: 'GENERAL_LIABILITY', multiplier: 1.2 }],
  },
];

interface SectionData {
  title: string;
  titleHe: string;
  order: number;
  questions: QuestionData[];
}

interface QuestionData {
  questionId: string;
  type: string;
  label: string;
  labelHe: string;
  required: boolean;
  order: number;
  min?: number;
  max?: number;
  riskWeight?: number;
  policyAffinity?: string[];
  options?: { value: string; label: string; labelHe: string }[];
  showIf?: { questionId: string; operator: string; value: unknown }[];
}

async function seedTemplate(
  sector: string,
  sections: SectionData[],
  includeRules: boolean = false
) {
  console.log(`Seeding template for sector: ${sector}`);

  // Check if template already exists
  const existing = await prisma.questionnaireTemplate.findUnique({
    where: { sector },
  });

  if (existing) {
    console.log(`  Template for ${sector} already exists, skipping...`);
    return;
  }

  const template = await prisma.questionnaireTemplate.create({
    data: {
      sector,
      sectorHe: sectorTranslations[sector] || sector,
      version: '1.0',
      isActive: true,
      sections: {
        create: sections.map((section) => ({
          title: section.title,
          titleHe: section.titleHe,
          order: section.order,
          questions: {
            create: section.questions.map((q) => ({
              questionId: q.questionId,
              label: q.label,
              labelHe: q.labelHe,
              type: q.type,
              required: q.required,
              order: q.order,
              min: q.min,
              max: q.max,
              riskWeight: q.riskWeight ?? 0,
              policyAffinity: q.policyAffinity ?? [],
              options: q.options,
              showIf: q.showIf,
            })),
          },
        })),
      },
      ...(includeRules && {
        rules: {
          create: coverageRules.map((rule) => ({
            name: rule.name,
            nameHe: rule.nameHe,
            description: rule.description,
            descriptionHe: rule.descriptionHe,
            priority: rule.priority,
            isActive: true,
            conditions: rule.conditions,
            actions: rule.actions,
          })),
        },
      }),
    },
  });

  console.log(`  Created template: ${template.id}`);
}

async function main() {
  console.log('Starting questionnaire templates seed...\n');

  try {
    // Seed CONSTRUCTION template with all rules
    await seedTemplate('CONSTRUCTION', constructionSections, true);

    // Seed TECHNOLOGY template (uses shared rules from CONSTRUCTION)
    await seedTemplate('TECHNOLOGY', technologySections, false);

    // Seed GENERIC template for fallback
    await seedTemplate('GENERIC', genericSections, false);

    // Create alias templates that use GENERIC sections
    for (const sector of ['MANUFACTURING', 'RETAIL', 'HEALTHCARE', 'LOGISTICS', 'CONSULTING']) {
      await seedTemplate(sector, genericSections, false);
    }

    console.log('\nSeed completed successfully!');
  } catch (error) {
    console.error('Seed failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
