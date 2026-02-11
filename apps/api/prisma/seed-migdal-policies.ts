import { PrismaClient } from '@prisma/client';
import { seedInsurerPoliciesForCompany, PolicySeed, ExtSeed, ExclSeed } from './seed-insurer-policies';

// ============================================================
// MIGDAL (מגדל) POLICIES
// BIT 2017 editions, strong in liability coverage, lower property limits
// Policy form codes: MG-XXXX
// ============================================================

const ALL_PRODUCT_CODES = [
  'FIRE_CONSEQUENTIAL_LOSS',
  'MECHANICAL_BREAKDOWN',
  'THIRD_PARTY_LIABILITY',
  'EMPLOYERS_LIABILITY',
  'PRODUCT_LIABILITY',
  'CASH_MONEY',
  'FIDELITY_CRIME',
  'CARGO_IN_TRANSIT',
  'TERRORISM',
  'ELECTRONIC_EQUIPMENT',
  'HEAVY_ENGINEERING_EQUIPMENT',
  'CONTRACTOR_WORKS_CAR',
];

// ============================================================
// Helper: Generate base template policies for non-detailed products
// ============================================================

function generateBaseMigdalPolicy(productCode: string): PolicySeed {
  const baseStructures: Record<string, Record<string, unknown>> = {
    FIRE_CONSEQUENTIAL_LOSS: { chapters: ['Part A - Property Insurance', 'Part B - Business Interruption'] },
    MECHANICAL_BREAKDOWN: { chapters: ['Single chapter + extensions'] },
    CASH_MONEY: { chapters: ['Single chapter + extensions'] },
    FIDELITY_CRIME: { chapters: ['Single chapter + 1 extension'] },
    CARGO_IN_TRANSIT: { chapters: ['Single chapter + extensions'] },
    TERRORISM: { chapters: ['Chapter 1 - Property', 'Chapter 2 - Business Interruption'] },
    HEAVY_ENGINEERING_EQUIPMENT: { chapters: ['Single chapter + extensions'] },
    ELECTRONIC_EQUIPMENT: { chapters: ['Ch1 - Property', 'Ch2 - Data & Software', 'Ch3 - Additional Expenses', 'Ch4 - Business Interruption'] },
    CONTRACTOR_WORKS_CAR: { chapters: ['Ch A - Property', 'Ch B - Third Party Liability', 'Ch C - Employers Liability'] },
  };

  const baseTriggers: Record<string, string> = {
    FIRE_CONSEQUENTIAL_LOSS: 'Named perils trigger',
    MECHANICAL_BREAKDOWN: 'All-risks trigger',
    CASH_MONEY: 'All-risks trigger',
    FIDELITY_CRIME: 'Discovery-based trigger',
    CARGO_IN_TRANSIT: 'All-risks trigger',
    TERRORISM: 'Excess over Property Tax Fund layer',
    HEAVY_ENGINEERING_EQUIPMENT: 'All-risks trigger',
    ELECTRONIC_EQUIPMENT: 'All-risks trigger',
    CONTRACTOR_WORKS_CAR: 'All-risks trigger',
  };

  const formCodeMap: Record<string, string> = {
    FIRE_CONSEQUENTIAL_LOSS: 'MG-3010',
    MECHANICAL_BREAKDOWN: 'MG-3040',
    CASH_MONEY: 'MG-3060',
    FIDELITY_CRIME: 'MG-3070',
    CARGO_IN_TRANSIT: 'MG-3080',
    TERRORISM: 'MG-3090',
    HEAVY_ENGINEERING_EQUIPMENT: 'MG-3110',
    ELECTRONIC_EQUIPMENT: 'MG-3100',
    CONTRACTOR_WORKS_CAR: 'MG-3120',
  };

  return {
    productCode,
    policyFormCode: formCodeMap[productCode] || `MG-30XX`,
    bitStandard: 'BIT 2017',
    editionYear: 2017,
    structure: baseStructures[productCode] || { chapters: ['Single chapter'] },
    strengths: [
      'Migdal liability-focused underwriting — broader defense cost coverage',
      'Strong claims-handling infrastructure for liability disputes',
    ],
    weaknesses: [
      'BIT 2017 edition — two years behind Clal BIT 2019',
      'Property sub-limits lower than market average',
    ],
    notableTerms: [
      baseTriggers[productCode] || 'Standard trigger',
      'Migdal MG-series form — liability-centric structure',
    ],
    extensions: [
      { code: '4.1', nameHe: 'הרחבה 1 — מגדל', nameEn: 'Extension 1 — Migdal standard', isStandard: true },
      { code: '4.2', nameHe: 'הרחבה 2 — מגדל', nameEn: 'Extension 2 — Migdal standard', isStandard: true },
      { code: '4.3', nameHe: 'הרחבה 3 — מגדל', nameEn: 'Extension 3 — Migdal standard', isStandard: true },
      { code: '4.4', nameHe: 'הרחבה 4 — מגדל', nameEn: 'Extension 4 — Migdal standard', isStandard: true },
      { code: '4.5', nameHe: 'השבת סכום ביטוח', nameEn: 'Sum Insured Reinstatement', isStandard: true },
      { code: '4.6', nameHe: 'הוצאות נוספות הכרחיות', nameEn: 'Necessary Additional Expenses', isStandard: true },
      { code: '4.7', nameHe: 'הוצאות הכנת תביעה', nameEn: 'Claim Preparation Costs', isStandard: true },
      { code: '4.8', nameHe: 'אחריות צולבת', nameEn: 'Cross Liability', isStandard: true },
      { code: '4.9', nameHe: 'הגנה פלילית/מנהלית', nameEn: 'Criminal/Admin Defense', isStandard: true },
      { code: '4.10', nameHe: 'ויתור על שיבוב', nameEn: 'Waiver of Subrogation', isStandard: true },
      { code: '4.11', nameHe: 'פעילות קבלני משנה', nameEn: 'Subcontractor Activities', isStandard: true },
      { code: '4.12', nameHe: 'כלי נשק', nameEn: 'Weapons', isStandard: true },
      { code: '4.13', nameHe: 'שהות זמנית בחו"ל', nameEn: 'Temporary Stay Abroad', isStandard: true },
      { code: '4.14', nameHe: 'צד שלישי שהמבוטח התחייב', nameEn: 'Third Party Insured Obligated', isStandard: true },
      { code: '4.15', nameHe: 'פגיעה אישית', nameEn: 'Personal Injury', isStandard: true, defaultLimit: 200000 },
      // Migdal-specific
      { code: 'MG-4.16', nameHe: 'כיסוי הוצאות משפט מורחב', nameEn: 'Extended Legal Defense Costs', isStandard: false, defaultLimit: 500000, limitNotes: 'Migdal-specific: NIS 500K separate from policy limit for defense costs' },
    ],
    exclusions: [
      { code: 'E1', nameHe: 'מלחמה/טרור', nameEn: 'War/terrorism', isStandard: true },
      { code: 'E2', nameHe: 'סיכונים גרעיניים', nameEn: 'Nuclear risks', isStandard: true },
      { code: 'E3', nameHe: 'רשלנות חמורה', nameEn: 'Gross negligence', isStandard: true },
      { code: 'E4', nameHe: 'פיצויים עונשיים', nameEn: 'Punitive damages', isStandard: true },
      // Migdal-specific
      { code: 'MG-E5', nameHe: 'תביעות Class Action — נדרש כיסוי נפרד', nameEn: 'Class action claims — require separate coverage', isStandard: false },
    ],
  };
}

// ============================================================
// DETAILED POLICIES — 3 key products for Migdal (liability focus)
// ============================================================

const migdalThirdPartyPolicy: PolicySeed = {
  productCode: 'THIRD_PARTY_LIABILITY',
  policyFormCode: 'MG-3030',
  bitStandard: 'BIT 2017',
  editionYear: 2017,
  structure: { chapters: ['Single chapter + extensions'] },
  strengths: [
    'Defense costs paid in addition to (not eroding) policy limit — NIS 500K extra',
    'Criminal/Admin defense NIS 300K/event, NIS 600K aggregate (vs NIS 200K/400K BIT)',
    'Motor vehicle property damage NIS 2M/event, NIS 4M aggregate (vs NIS 1M/2M BIT)',
    'Personal injury sub-limit NIS 300K (vs NIS 200K BIT standard)',
  ],
  weaknesses: [
    'BIT 2017 edition — two years behind Clal BIT 2019',
    'Property in custody exclusion broader than BIT — includes bailment scenarios',
  ],
  notableTerms: [
    'Occurrence-based trigger',
    'Defense costs outside policy limit — significant advantage for large claims',
    'Waiver of subrogation explicitly covers landlord/tenant relationships',
  ],
  extensions: [
    { code: '4.1', nameHe: 'שהות זמנית בחו"ל', nameEn: 'Temporary Stay Abroad', isStandard: true },
    { code: '4.2', nameHe: 'אחריות צולבת', nameEn: 'Cross Liability', isStandard: true },
    { code: '4.3', nameHe: 'רכוש עובדים', nameEn: 'Employee Property', isStandard: true },
    { code: '4.4', nameHe: 'פעילות קבלני משנה', nameEn: 'Subcontractor Activities', isStandard: true },
    { code: '4.5', nameHe: 'אחריות בנייה/שיפוץ', nameEn: 'Construction/Renovation Liability', isStandard: true },
    { code: '4.6', nameHe: 'אחריות אירועים', nameEn: 'Event Liability', isStandard: true },
    { code: '4.7', nameHe: 'נזק רכוש מכלי רכב', nameEn: 'Motor Vehicle Property Damage', isStandard: true, defaultLimit: 4000000, limitNotes: 'NIS 2M/event, NIS 4M aggregate (vs NIS 1M/2M BIT)' },
    { code: '4.8', nameHe: 'פגיעה אישית', nameEn: 'Personal Injury', isStandard: true, defaultLimit: 300000, limitNotes: 'NIS 300K per event (vs NIS 200K BIT standard)' },
    { code: '4.9', nameHe: 'מניעת גישה', nameEn: 'Prevention of Access', isStandard: true, limitNotes: '30% of liability limit per event (vs 25% BIT)' },
    { code: '4.10', nameHe: 'אחריות שילוחית', nameEn: 'Vicarious Liability', isStandard: true },
    { code: '4.11', nameHe: 'הרעלת מזון', nameEn: 'Food Poisoning', isStandard: true },
    { code: '4.12', nameHe: 'אחריות אישית של עובד', nameEn: 'Employee Personal Liability', isStandard: true },
    { code: '4.13', nameHe: 'ויתור על שיבוב', nameEn: 'Waiver of Subrogation', isStandard: true },
    { code: '4.14', nameHe: 'צד שלישי שהמבוטח התחייב', nameEn: 'Third Party Insured Obligated', isStandard: true },
    { code: '4.15', nameHe: 'כלי נשק', nameEn: 'Weapons', isStandard: true },
    { code: '4.16', nameHe: 'הגנה פלילית/מנהלית', nameEn: 'Criminal/Admin Defense', isStandard: true, defaultLimit: 300000, limitNotes: 'NIS 300K/event, NIS 600K aggregate (vs NIS 200K/400K BIT)' },
    // Migdal-specific liability extensions
    { code: 'MG-4.17', nameHe: 'הוצאות הגנה מחוץ לגבול הפוליסה', nameEn: 'Defense Costs Outside Policy Limit', isStandard: false, defaultLimit: 500000, limitNotes: 'Migdal-specific: NIS 500K separate allocation for legal defense' },
    { code: 'MG-4.18', nameHe: 'אחריות שוכר/משכיר', nameEn: 'Tenant/Landlord Liability', isStandard: false, limitNotes: 'Migdal-specific: covers mutual indemnity obligations in lease agreements' },
  ],
  exclusions: [
    { code: 'E1', nameHe: 'פגיעת עובד', nameEn: 'Employee injury', isStandard: true },
    { code: 'E2', nameHe: 'אחריות כלי רכב', nameEn: 'Motor vehicle liability', isStandard: true },
    { code: 'E3', nameHe: 'אחריות מוצר', nameEn: 'Product liability', isStandard: true },
    { code: 'E4', nameHe: 'אחריות מקצועית', nameEn: 'Professional liability', isStandard: true },
    { code: 'E5', nameHe: 'אחריות נושאי משרה', nameEn: 'D&O liability', isStandard: true },
    { code: 'E6', nameHe: 'זיהום (אלא אם פתאומי)', nameEn: 'Pollution (unless sudden/accidental)', isStandard: true },
    { code: 'E7', nameHe: 'רכוש בהחזקה (כולל פיקדון)', nameEn: 'Property in custody (including bailment)', isStandard: true },
    { code: 'E8', nameHe: 'אחריות חוזית', nameEn: 'Contractual liability', isStandard: true },
    { code: 'E9', nameHe: 'גרעיני/קרינה', nameEn: 'Nuclear/Radiation/EMF', isStandard: true },
    { code: 'E10', nameHe: 'מלחמה/טרור', nameEn: 'War/terrorism', isStandard: true },
    { code: 'E11', nameHe: 'פיצויים עונשיים', nameEn: 'Punitive damages', isStandard: true },
    { code: 'E12', nameHe: 'אסבסט', nameEn: 'Asbestos', isStandard: true },
    { code: 'E13', nameHe: 'רשלנות חמורה', nameEn: 'Gross negligence', isStandard: true },
    // Migdal-specific
    { code: 'MG-E14', nameHe: 'תביעות ייצוגיות — נדרש כיסוי נפרד', nameEn: 'Class action claims — separate coverage required', isStandard: false },
    { code: 'MG-E15', nameHe: 'נזק מעבודות חפירה מתחת ל-3 מטר', nameEn: 'Excavation damage below 3 meters depth', isStandard: false },
  ],
};

const migdalEmployersLiabilityPolicy: PolicySeed = {
  productCode: 'EMPLOYERS_LIABILITY',
  policyFormCode: 'MG-3035',
  bitStandard: 'BIT 2017',
  editionYear: 2017,
  structure: { chapters: ['Single chapter + extensions'] },
  strengths: [
    'Criminal/Admin defense NIS 300K/event, NIS 600K aggregate (higher than BIT)',
    'Personal injury NIS 300K (vs NIS 200K BIT standard)',
    'Broad employee definition — includes interns, volunteers, and trainees',
    'Comprehensive contractor/subcontractor extension with explicit indemnity mechanism',
  ],
  weaknesses: [
    'BIT 2017 edition — two years behind Clal BIT 2019',
    'More exclusions (11) than some competitors',
  ],
  notableTerms: [
    'Occurrence-based trigger',
    'Employee definition includes anyone performing work under insured\'s direction',
    'National Insurance (Bituach Leumi) subrogation clause explicitly addressed',
  ],
  extensions: [
    { code: '4.1', nameHe: 'שהות זמנית בחו"ל', nameEn: 'Temporary Stay Abroad', isStandard: true },
    { code: '4.2', nameHe: 'עובדים בחוזים מיוחדים', nameEn: 'Special Contract Employees', isStandard: true },
    { code: '4.3', nameHe: 'פעילויות הקשורות לעבודה', nameEn: 'Work-Related Activities', isStandard: true },
    { code: '4.4', nameHe: 'אחריות אישית של עובד', nameEn: 'Employee Personal Liability', isStandard: true },
    { code: '4.5', nameHe: 'כלי נשק', nameEn: 'Weapons', isStandard: true },
    { code: '4.6', nameHe: 'קבלנים/קבלני משנה ועובדיהם', nameEn: 'Contractors/Subcontractors & Workers', isStandard: true },
    { code: '4.7', nameHe: 'עובדי שטחים מוחזקים', nameEn: 'Held Territories Employees', isStandard: true },
    { code: '4.8', nameHe: 'בעלי שליטה בשכר', nameEn: 'Controlling Shareholders on Payroll', isStandard: true },
    { code: '4.9', nameHe: 'צד שלישי שהתחייב לבטח', nameEn: 'Third Party Required to Be Insured', isStandard: true },
    { code: '4.10', nameHe: 'פגיעה אישית', nameEn: 'Personal Injury', isStandard: true, defaultLimit: 300000, limitNotes: 'NIS 300K per event (vs NIS 200K BIT)' },
    { code: '4.11', nameHe: 'הגנה פלילית/מנהלית', nameEn: 'Criminal/Admin Defense', isStandard: true, defaultLimit: 300000, limitNotes: 'NIS 300K/event, NIS 600K aggregate' },
    { code: '4.12', nameHe: 'ויתור על שיבוב', nameEn: 'Waiver of Subrogation', isStandard: true },
    // Migdal-specific
    { code: 'MG-4.13', nameHe: 'כיסוי מתמחים/מתנדבים/חניכים', nameEn: 'Interns/Volunteers/Trainees Coverage', isStandard: false, limitNotes: 'Migdal-specific: extends employee definition to include interns and volunteers' },
    { code: 'MG-4.14', nameHe: 'הוצאות הגנה מחוץ לגבול הפוליסה', nameEn: 'Defense Costs Outside Policy Limit', isStandard: false, defaultLimit: 400000, limitNotes: 'Migdal-specific: NIS 400K separate from liability limit' },
  ],
  exclusions: [
    { code: 'E1', nameHe: 'אחריות חוזית', nameEn: 'Contractual liability', isStandard: true },
    { code: 'E2', nameHe: 'תביעות ביטוח לאומי', nameEn: 'National Insurance default claims', isStandard: true },
    { code: 'E3', nameHe: 'אסבסט/סיליקון/סיליקוזיס', nameEn: 'Asbestos/Silicone/Silicosis', isStandard: true },
    { code: 'E4', nameHe: 'מלחמה/טרור', nameEn: 'War/terrorism', isStandard: true },
    { code: 'E5', nameHe: 'גרעיני/קרינה', nameEn: 'Nuclear/Radiation/EMF', isStandard: true },
    { code: 'E6', nameHe: 'תאונות דרכים', nameEn: 'Motor vehicle road accidents', isStandard: true },
    { code: 'E7', nameHe: 'פיצויים עונשיים', nameEn: 'Punitive damages', isStandard: true },
    // Migdal-specific
    { code: 'MG-E8', nameHe: 'מחלות מקצוע כרוניות — חשיפה מעל 10 שנים', nameEn: 'Chronic occupational diseases — exposure over 10 years', isStandard: false },
  ],
};

const migdalProductLiabilityPolicy: PolicySeed = {
  productCode: 'PRODUCT_LIABILITY',
  policyFormCode: 'MG-3050',
  bitStandard: 'BIT 2017',
  editionYear: 2017,
  structure: { chapters: ['Single chapter + extensions'] },
  strengths: [
    'Built-in 18-month discovery period (vs 12 months BIT standard)',
    'Defense costs outside policy limit — NIS 400K separate allocation',
    'Completed operations sub-limit NIS 300K (vs NIS 200K BIT standard)',
    'Product recall costs partially covered — up to NIS 100K (excluded in BIT)',
  ],
  weaknesses: [
    'BIT 2017 edition — two years behind standard',
    'More exclusions (15) than Clal BIT baseline (12)',
    'Prior knowledge exclusion includes any senior employee, not just management',
  ],
  notableTerms: [
    'Claims-made trigger with retroactive date',
    '18-month discovery period — longer than market standard',
    'Partial recall cost coverage — unique in Israeli market',
  ],
  extensions: [
    { code: '4.1', nameHe: 'הרחבת מפיצים', nameEn: 'Vendors Endorsement', isStandard: true },
    { code: '4.2', nameHe: 'תקופת גילוי 18 חודשים', nameEn: 'Run-off/Discovery Period (18 months)', isStandard: true, limitNotes: '18 months (vs 12 months BIT standard)' },
    { code: '4.3', nameHe: 'אחריות צולבת', nameEn: 'Cross Liability', isStandard: true },
    { code: '4.4', nameHe: 'הגנה פלילית/מנהלית', nameEn: 'Criminal/Admin Defense', isStandard: true, defaultLimit: 300000, limitNotes: 'NIS 300K/event, NIS 600K aggregate' },
    { code: '4.5', nameHe: 'פגיעה אישית', nameEn: 'Personal Injury', isStandard: true, defaultLimit: 300000, limitNotes: 'NIS 300K per claim' },
    { code: '4.6', nameHe: 'עבודות שבוצעו', nameEn: 'Work Performed by Insured (completed operations)', isStandard: true, defaultLimit: 300000, limitNotes: 'NIS 300K per claim (vs NIS 200K BIT)' },
    // Migdal-specific
    { code: 'MG-4.7', nameHe: 'עלויות ריקול חלקיות', nameEn: 'Partial Product Recall Costs', isStandard: false, defaultLimit: 100000, limitNotes: 'Migdal-specific: NIS 100K for recall notification and logistics (excluded in BIT)' },
    { code: 'MG-4.8', nameHe: 'הוצאות הגנה מחוץ לגבול הפוליסה', nameEn: 'Defense Costs Outside Policy Limit', isStandard: false, defaultLimit: 400000, limitNotes: 'Migdal-specific: NIS 400K separate from policy limit' },
  ],
  exclusions: [
    { code: 'E1', nameHe: 'פגיעת עובד', nameEn: 'Employee injury', isStandard: true },
    { code: 'E2', nameHe: 'אחריות חוזית', nameEn: 'Contractual liability', isStandard: true },
    { code: 'E3', nameHe: 'ייצור בניגוד לחוק', nameEn: 'Manufacture contrary to law', isStandard: true },
    { code: 'E4', nameHe: 'מוצר פגום ביודעין', nameEn: 'Knowingly defective product', isStandard: true },
    { code: 'E5', nameHe: 'נזק למוצר עצמו', nameEn: 'Damage to product itself', isStandard: true },
    { code: 'E6', nameHe: 'גרעיני/קרינה', nameEn: 'Nuclear/Radiation/EMF', isStandard: true },
    { code: 'E7', nameHe: 'מלחמה/טרור', nameEn: 'War/terrorism', isStandard: true },
    { code: 'E8', nameHe: 'פיצויים עונשיים', nameEn: 'Punitive damages', isStandard: true },
    { code: 'E9', nameHe: 'אסבסט', nameEn: 'Asbestos', isStandard: true },
    { code: 'E10', nameHe: 'ידיעה מוקדמת (כל עובד בכיר)', nameEn: 'Prior knowledge (any senior employee)', isStandard: true },
    // Migdal-specific
    { code: 'MG-E11', nameHe: 'מוצרי מזון ללא אישור משרד הבריאות', nameEn: 'Food products without Health Ministry approval', isStandard: false },
    { code: 'MG-E12', nameHe: 'מוצרים המכילים CBD/THC', nameEn: 'Products containing CBD/THC', isStandard: false },
  ],
};

// ============================================================
// ASSEMBLE ALL MIGDAL POLICIES
// ============================================================

const detailedProductCodes = [
  'THIRD_PARTY_LIABILITY',
  'EMPLOYERS_LIABILITY',
  'PRODUCT_LIABILITY',
];

const migdalPolicies: PolicySeed[] = [
  migdalThirdPartyPolicy,
  migdalEmployersLiabilityPolicy,
  migdalProductLiabilityPolicy,
  ...ALL_PRODUCT_CODES.filter((code) => !detailedProductCodes.includes(code)).map(generateBaseMigdalPolicy),
];

// ============================================================
// SEED FUNCTION
// ============================================================

export async function seedMigdalPolicies(prisma: PrismaClient) {
  console.log('\n--- Seeding Migdal (מגדל) policies...');
  await seedInsurerPoliciesForCompany('MIGDAL', migdalPolicies, false);
  console.log('--- Migdal seed complete.');
}
