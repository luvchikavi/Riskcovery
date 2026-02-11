import { PrismaClient } from '@prisma/client';
import { seedInsurerPoliciesForCompany, PolicySeed, ExtSeed, ExclSeed } from './seed-insurer-policies';

// ============================================================
// MENORAH MIVTACHIM (מנורה מבטחים) POLICIES
// BIT 2016 editions, conservative underwriting, fewer extensions, solid exclusions
// Policy form codes: MN-XXXX
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

function generateBaseMenorahPolicy(productCode: string): PolicySeed {
  const baseStructures: Record<string, Record<string, unknown>> = {
    MECHANICAL_BREAKDOWN: { chapters: ['Single chapter + extensions'] },
    PRODUCT_LIABILITY: { chapters: ['Single chapter + extensions'] },
    CASH_MONEY: { chapters: ['Single chapter + extensions'] },
    FIDELITY_CRIME: { chapters: ['Single chapter + 1 extension'] },
    CARGO_IN_TRANSIT: { chapters: ['Single chapter + extensions'] },
    TERRORISM: { chapters: ['Chapter 1 - Property', 'Chapter 2 - Business Interruption'] },
    HEAVY_ENGINEERING_EQUIPMENT: { chapters: ['Single chapter + extensions'] },
    ELECTRONIC_EQUIPMENT: { chapters: ['Ch1 - Property', 'Ch2 - Data & Software', 'Ch3 - Additional Expenses', 'Ch4 - Business Interruption'] },
    CONTRACTOR_WORKS_CAR: { chapters: ['Ch A - Property', 'Ch B - Third Party Liability', 'Ch C - Employers Liability'] },
  };

  const baseTriggers: Record<string, string> = {
    MECHANICAL_BREAKDOWN: 'All-risks trigger',
    PRODUCT_LIABILITY: 'Claims-made trigger',
    CASH_MONEY: 'All-risks trigger',
    FIDELITY_CRIME: 'Discovery-based trigger',
    CARGO_IN_TRANSIT: 'All-risks trigger',
    TERRORISM: 'Excess over Property Tax Fund layer',
    HEAVY_ENGINEERING_EQUIPMENT: 'All-risks trigger',
    ELECTRONIC_EQUIPMENT: 'All-risks trigger',
    CONTRACTOR_WORKS_CAR: 'All-risks trigger',
  };

  const formCodeMap: Record<string, string> = {
    MECHANICAL_BREAKDOWN: 'MN-5040',
    PRODUCT_LIABILITY: 'MN-5050',
    CASH_MONEY: 'MN-5060',
    FIDELITY_CRIME: 'MN-5070',
    CARGO_IN_TRANSIT: 'MN-5080',
    TERRORISM: 'MN-5090',
    HEAVY_ENGINEERING_EQUIPMENT: 'MN-5110',
    ELECTRONIC_EQUIPMENT: 'MN-5100',
    CONTRACTOR_WORKS_CAR: 'MN-5120',
  };

  return {
    productCode,
    policyFormCode: formCodeMap[productCode] || `MN-50XX`,
    bitStandard: 'BIT 2016',
    editionYear: 2016,
    structure: baseStructures[productCode] || { chapters: ['Single chapter'] },
    strengths: [
      'Conservative underwriting — well-defined coverage boundaries reduce disputes',
      'Solid exclusion clarity — very clear language minimizing ambiguity',
    ],
    weaknesses: [
      'BIT 2016 edition — three years behind Clal BIT 2019',
      'Fewer extensions than market leaders — gaps for complex risks',
      'Lower sub-limits on most extensions',
    ],
    notableTerms: [
      baseTriggers[productCode] || 'Standard trigger',
      'Menorah MN-series form — conservative, well-defined boundaries',
      'Older BIT 2016 standard — may not reflect current market practices',
    ],
    extensions: [
      { code: '3.1', nameHe: 'הרחבה 1 — מנורה', nameEn: 'Extension 1 — Menorah standard', isStandard: true },
      { code: '3.2', nameHe: 'הרחבה 2 — מנורה', nameEn: 'Extension 2 — Menorah standard', isStandard: true },
      { code: '3.3', nameHe: 'הרחבה 3 — מנורה', nameEn: 'Extension 3 — Menorah standard', isStandard: true },
      { code: '3.4', nameHe: 'הרחבה 4 — מנורה', nameEn: 'Extension 4 — Menorah standard', isStandard: true },
      { code: '3.5', nameHe: 'השבת סכום ביטוח', nameEn: 'Sum Insured Reinstatement', isStandard: true },
      { code: '3.6', nameHe: 'הוצאות נוספות הכרחיות', nameEn: 'Necessary Additional Expenses', isStandard: true },
      { code: '3.7', nameHe: 'הוצאות הכנת תביעה', nameEn: 'Claim Preparation Costs', isStandard: true },
      { code: '3.8', nameHe: 'רכוש סמוך', nameEn: 'Adjacent Property', isStandard: true },
      { code: '3.9', nameHe: 'תוספות לרכוש', nameEn: 'Property Additions', isStandard: true },
      { code: '3.10', nameHe: 'חלקים מיושנים', nameEn: 'Obsolete Parts', isStandard: true },
      { code: '3.11', nameHe: 'ביטוח יסודות', nameEn: 'Foundation Insurance', isStandard: true },
      // Menorah-specific
      { code: 'MN-3.12', nameHe: 'כיסוי ציות לתקנות כיבוי אש', nameEn: 'Fire Safety Compliance Coverage', isStandard: false, limitNotes: 'Menorah-specific: covers costs to meet fire safety regulations after a claim' },
    ],
    exclusions: [
      { code: 'E1', nameHe: 'אבדן תוצאתי', nameEn: 'Consequential loss', isStandard: true },
      { code: 'E2', nameHe: 'מלחמה/טרור', nameEn: 'War/terrorism', isStandard: true },
      { code: 'E3', nameHe: 'סיכונים גרעיניים', nameEn: 'Nuclear risks', isStandard: true },
      { code: 'E4', nameHe: 'בלאי/קורוזיה/התדרדרות', nameEn: 'Wear/corrosion/deterioration', isStandard: true },
      { code: 'E5', nameHe: 'רשלנות חמורה', nameEn: 'Gross negligence', isStandard: true },
      // Menorah-specific exclusions (conservative)
      { code: 'MN-E6', nameHe: 'רכוש בשימוש מעל 20 שנה ללא שמאות', nameEn: 'Property in use over 20 years without appraisal', isStandard: false },
      { code: 'MN-E7', nameHe: 'נזקים בתקופת השבתה ממושכת (מעל 60 יום)', nameEn: 'Damage during extended shutdown (over 60 days)', isStandard: false },
    ],
  };
}

// ============================================================
// DETAILED POLICIES — 3 key products for Menorah
// ============================================================

const menorahFirePolicy: PolicySeed = {
  productCode: 'FIRE_CONSEQUENTIAL_LOSS',
  policyFormCode: 'MN-5010',
  bitStandard: 'BIT 2016',
  editionYear: 2016,
  structure: { chapters: ['Part A - Property Insurance', 'Part B - Business Interruption'] },
  strengths: [
    'Very clear exclusion language — minimal coverage disputes',
    'Conservative pricing — lower premiums for low-risk properties',
  ],
  weaknesses: [
    'BIT 2016 edition — three years behind Clal BIT 2019',
    'Only 16 Part-A extensions (vs 21 in BIT 2019) — 5 extensions missing',
    'Only 13 Part-B extensions (vs 19 in BIT 2019) — 6 BI extensions missing',
    'Lower sub-limits: Employee Personal Effects NIS 30K (vs NIS 50K BIT)',
    'Missing extensions: All-Risks Completion, Brand Name Protection, R&D Costs, Sum Reinstatement',
  ],
  notableTerms: [
    'Menorah MN-5010 form — conservative BIT 2016 edition',
    'Best suited for standard commercial properties with predictable risk profiles',
    'Not recommended for high-tech or complex industrial risks',
  ],
  extensions: [
    { chapterCode: 'A', code: '3.1', nameHe: 'פריצה/גניבה', nameEn: 'Break-in/Theft', isStandard: true, limitNotes: 'Requires extra premium and security measures' },
    { chapterCode: 'A', code: '3.2', nameHe: 'רכוש מחוץ לחצרים', nameEn: 'Property Outside Premises', isStandard: true },
    { chapterCode: 'A', code: '3.3', nameHe: 'רכוש בזמן בנייה', nameEn: 'Property During Construction', isStandard: true },
    { chapterCode: 'A', code: '3.4', nameHe: 'רכוש בהעברה', nameEn: 'Property in Transit', isStandard: true },
    { chapterCode: 'A', code: '3.5', nameHe: 'חפצים אישיים של עובדים', nameEn: 'Employee Personal Effects', isStandard: true, defaultLimit: 30000, limitNotes: 'NIS 30K (vs NIS 50K BIT 2019)' },
    { chapterCode: 'A', code: '3.6', nameHe: 'רכוש שירותים ציבוריים', nameEn: 'Public Utility Property', isStandard: true },
    { chapterCode: 'A', code: '3.7', nameHe: 'תוספות לרכוש', nameEn: 'Additions to Property', isStandard: true, limitNotes: '8% of sum insured (vs 10% BIT)' },
    { chapterCode: 'A', code: '3.8', nameHe: 'נזק עקיף למלאי', nameEn: 'Incidental Inventory Damage', isStandard: true },
    { chapterCode: 'A', code: '3.9', nameHe: 'הוצאות לאחר אירוע', nameEn: 'Post-Event Expenses', isStandard: true },
    { chapterCode: 'A', code: '3.10', nameHe: 'הוצאות הכנת תביעה', nameEn: 'Claim Preparation Costs', isStandard: true },
    { chapterCode: 'A', code: '3.11', nameHe: 'שכ"ד חלופי', nameEn: 'Alternative Rent', isStandard: true },
    { chapterCode: 'A', code: '3.12', nameHe: 'קריסת מדפים', nameEn: 'Shelving Collapse', isStandard: true },
    { chapterCode: 'A', code: '3.13', nameHe: 'שבר זכוכית', nameEn: 'Glass Breakage', isStandard: true },
    { chapterCode: 'A', code: '3.14', nameHe: 'נזק ללוח חשמל', nameEn: 'Electrical Panel Damage', isStandard: true },
    { chapterCode: 'A', code: '3.15', nameHe: 'קריסת מבנה', nameEn: 'Massive Building Collapse', isStandard: true },
    { chapterCode: 'A', code: '3.16', nameHe: 'השבת סכום ביטוח', nameEn: 'Sum Insured Reinstatement', isStandard: true },
    // Note: Missing 3.3 (Territorial Limits), 3.15 (Brand Name Protection), 3.20 (All-Risks Completion), 3.10 (Hot Material Rupture), 3.14 (Property Out of Service)
    // Menorah-specific
    { chapterCode: 'A', code: 'MN-3.17', nameHe: 'כיסוי עמידה בתקנות כיבוי אש', nameEn: 'Fire Safety Compliance Costs', isStandard: false, defaultLimit: 200000, limitNotes: 'Menorah-specific: NIS 200K for regulatory compliance after fire event' },
    { chapterCode: 'B', code: '10.1', nameHe: 'הפרעה בשירותים ציבוריים', nameEn: 'Public Services Disruption', isStandard: true },
    { chapterCode: 'B', code: '10.2', nameHe: 'השפעה הדדית בין עסקים', nameEn: 'Mutual Business Influence', isStandard: true },
    { chapterCode: 'B', code: '10.3', nameHe: 'הפרעה בספקים/לקוחות', nameEn: 'Suppliers/Customers Disruption', isStandard: true },
    { chapterCode: 'B', code: '10.4', nameHe: 'מניעת גישה', nameEn: 'Denial of Access', isStandard: true },
    { chapterCode: 'B', code: '10.5', nameHe: 'רכוש שאינו בבעלות', nameEn: 'Property Not Owned', isStandard: true },
    { chapterCode: 'B', code: '10.6', nameHe: 'מכירה ממלאי', nameEn: 'Sale from Inventory', isStandard: true },
    { chapterCode: 'B', code: '10.7', nameHe: 'אבדן תוצאתי בנייה', nameEn: 'Construction BI', isStandard: true },
    { chapterCode: 'B', code: '10.8', nameHe: 'אבדן תוצאתי העברה', nameEn: 'Transit BI', isStandard: true },
    { chapterCode: 'B', code: '10.9', nameHe: 'שיפורי ציוד', nameEn: 'Equipment Improvements', isStandard: true },
    { chapterCode: 'B', code: '10.10', nameHe: 'הוצאות משתנות', nameEn: 'Changed Expenses', isStandard: true },
    { chapterCode: 'B', code: '10.11', nameHe: 'קנסות חוזיים', nameEn: 'Contract Penalties', isStandard: true },
    { chapterCode: 'B', code: '10.12', nameHe: 'חובות בספרים פתוחים', nameEn: 'Open Book Debts', isStandard: true },
    { chapterCode: 'B', code: '10.13', nameHe: 'הוצאות שונות', nameEn: 'Miscellaneous Expenses', isStandard: true },
    // Note: Missing 10.9 (Building Collapse BI), 10.12 (Compliance), 10.16 (Claim Prep), 10.17 (R&D), 10.18 (Additional Sum), 10.19 (Sum Reinstatement)
  ],
  exclusions: [
    { code: 'E1', nameHe: 'אבדן תוצאתי (חלק א)', nameEn: 'Consequential loss (Part A)', isStandard: true },
    { code: 'E2', nameHe: 'נזק למתקן חשמלי', nameEn: 'Electrical installation damage', isStandard: true },
    { code: 'E3', nameHe: 'רכוש מבוטח ימי', nameEn: 'Marine-insured property', isStandard: true },
    { code: 'E4', nameHe: 'נזק בהוראת ממשלה', nameEn: 'Government-ordered damage', isStandard: true },
    { code: 'E5', nameHe: 'סיכונים גרעיניים', nameEn: 'Nuclear risks', isStandard: true },
    { code: 'E6', nameHe: 'מלחמה/טרור', nameEn: 'War/terrorism', isStandard: true },
    { code: 'E7', nameHe: 'רעידת אדמה (אלא אם נרכש)', nameEn: 'Earthquake (unless purchased)', isStandard: true },
    { code: 'E8', nameHe: 'זיהום (אלא אם מסיכון מבוטח)', nameEn: 'Pollution (unless from insured peril)', isStandard: true },
    { code: 'E9', nameHe: 'רשלנות חמורה', nameEn: 'Gross negligence', isStandard: true },
    { code: 'E10', nameHe: 'רכוש לא מוחשי/מידע', nameEn: 'Intangible property/data', isStandard: true },
    // Menorah-specific exclusions (conservative)
    { code: 'MN-E11', nameHe: 'מבנה ללא תעודת בטיחות בתוקף', nameEn: 'Building without valid safety certificate', isStandard: false },
    { code: 'MN-E12', nameHe: 'תכולה לא מדווחת מעל 20% מסכום הביטוח', nameEn: 'Undeclared contents exceeding 20% of sum insured', isStandard: false },
  ],
};

const menorahThirdPartyPolicy: PolicySeed = {
  productCode: 'THIRD_PARTY_LIABILITY',
  policyFormCode: 'MN-5030',
  bitStandard: 'BIT 2016',
  editionYear: 2016,
  structure: { chapters: ['Single chapter + extensions'] },
  strengths: [
    'Clear exclusion language — minimal dispute on coverage boundaries',
    'Conservative pricing — lower premiums for well-established businesses',
  ],
  weaknesses: [
    'BIT 2016 edition — three years behind Clal BIT 2019',
    'Fewer extensions (12) than BIT standard (16)',
    'Missing extensions: Event Liability, Vicarious Liability, Food Poisoning, Employee Personal Liability',
    'Lower personal injury limit — NIS 150K (vs NIS 200K BIT)',
    'Criminal/Admin defense NIS 150K (vs NIS 200K BIT standard)',
  ],
  notableTerms: [
    'Occurrence-based trigger',
    'Conservative extension set — suitable for low-risk commercial operations',
    'Not recommended for hospitality, events, or food service businesses',
  ],
  extensions: [
    { code: '4.1', nameHe: 'שהות זמנית בחו"ל', nameEn: 'Temporary Stay Abroad', isStandard: true },
    { code: '4.2', nameHe: 'אחריות צולבת', nameEn: 'Cross Liability', isStandard: true },
    { code: '4.3', nameHe: 'רכוש עובדים', nameEn: 'Employee Property', isStandard: true },
    { code: '4.4', nameHe: 'פעילות קבלני משנה', nameEn: 'Subcontractor Activities', isStandard: true },
    { code: '4.5', nameHe: 'אחריות בנייה/שיפוץ', nameEn: 'Construction/Renovation Liability', isStandard: true },
    { code: '4.6', nameHe: 'נזק רכוש מכלי רכב', nameEn: 'Motor Vehicle Property Damage', isStandard: true, defaultLimit: 1500000, limitNotes: 'NIS 750K/event, NIS 1.5M aggregate (vs NIS 1M/2M BIT)' },
    { code: '4.7', nameHe: 'פגיעה אישית', nameEn: 'Personal Injury', isStandard: true, defaultLimit: 150000, limitNotes: 'NIS 150K per event (vs NIS 200K BIT)' },
    { code: '4.8', nameHe: 'מניעת גישה', nameEn: 'Prevention of Access', isStandard: true, limitNotes: '20% of liability limit per event (vs 25% BIT)' },
    { code: '4.9', nameHe: 'ויתור על שיבוב', nameEn: 'Waiver of Subrogation', isStandard: true },
    { code: '4.10', nameHe: 'צד שלישי שהמבוטח התחייב', nameEn: 'Third Party Insured Obligated', isStandard: true },
    { code: '4.11', nameHe: 'כלי נשק', nameEn: 'Weapons', isStandard: true },
    { code: '4.12', nameHe: 'הגנה פלילית/מנהלית', nameEn: 'Criminal/Admin Defense', isStandard: true, defaultLimit: 150000, limitNotes: 'NIS 150K/event, NIS 300K aggregate (vs NIS 200K/400K BIT)' },
    // Note: Missing Event Liability, Vicarious Liability, Food Poisoning, Employee Personal Liability
    // Menorah-specific
    { code: 'MN-4.13', nameHe: 'כיסוי אחריות בגין שילוט', nameEn: 'Signage Liability Coverage', isStandard: false, limitNotes: 'Menorah-specific: covers liability from falling/defective business signage' },
  ],
  exclusions: [
    { code: 'E1', nameHe: 'פגיעת עובד', nameEn: 'Employee injury', isStandard: true },
    { code: 'E2', nameHe: 'אחריות כלי רכב', nameEn: 'Motor vehicle liability', isStandard: true },
    { code: 'E3', nameHe: 'אחריות מוצר', nameEn: 'Product liability', isStandard: true },
    { code: 'E4', nameHe: 'אחריות מקצועית', nameEn: 'Professional liability', isStandard: true },
    { code: 'E5', nameHe: 'זיהום (אלא אם פתאומי)', nameEn: 'Pollution (unless sudden/accidental)', isStandard: true },
    { code: 'E6', nameHe: 'רכוש בהחזקה', nameEn: 'Property in custody', isStandard: true },
    { code: 'E7', nameHe: 'אחריות חוזית', nameEn: 'Contractual liability', isStandard: true },
    { code: 'E8', nameHe: 'גרעיני/קרינה', nameEn: 'Nuclear/Radiation/EMF', isStandard: true },
    { code: 'E9', nameHe: 'מלחמה/טרור', nameEn: 'War/terrorism', isStandard: true },
    { code: 'E10', nameHe: 'פיצויים עונשיים', nameEn: 'Punitive damages', isStandard: true },
    { code: 'E11', nameHe: 'אסבסט', nameEn: 'Asbestos', isStandard: true },
    { code: 'E12', nameHe: 'רשלנות חמורה', nameEn: 'Gross negligence', isStandard: true },
    { code: 'E13', nameHe: 'נזק כספי טהור', nameEn: 'Pure financial loss', isStandard: true },
    // Menorah-specific
    { code: 'MN-E14', nameHe: 'אירועים ציבוריים מעל 500 משתתפים', nameEn: 'Public events with over 500 attendees', isStandard: false },
    { code: 'MN-E15', nameHe: 'פעילות ספורט אתגרי/אקסטרים', nameEn: 'Extreme/adventure sports activities', isStandard: false },
  ],
};

const menorahEmployersLiabilityPolicy: PolicySeed = {
  productCode: 'EMPLOYERS_LIABILITY',
  policyFormCode: 'MN-5035',
  bitStandard: 'BIT 2016',
  editionYear: 2016,
  structure: { chapters: ['Single chapter + extensions'] },
  strengths: [
    'Clear language on employer obligations — reduces post-claim disputes',
    'Lower premium for office/low-risk employment environments',
  ],
  weaknesses: [
    'BIT 2016 edition — three years behind standard',
    'Fewer extensions (9) than BIT 2019 standard (12)',
    'Missing extensions: Work-Related Activities, Held Territories Employees, Waiver of Subrogation',
    'Lower personal injury limit — NIS 150K (vs NIS 200K BIT)',
    'Criminal defense limit NIS 150K (vs NIS 200K BIT)',
  ],
  notableTerms: [
    'Occurrence-based trigger',
    'Conservative employee definition — does not automatically include volunteers/interns',
    'Best suited for office environments and low-risk employers',
  ],
  extensions: [
    { code: '4.1', nameHe: 'שהות זמנית בחו"ל', nameEn: 'Temporary Stay Abroad', isStandard: true },
    { code: '4.2', nameHe: 'עובדים בחוזים מיוחדים', nameEn: 'Special Contract Employees', isStandard: true },
    { code: '4.3', nameHe: 'אחריות אישית של עובד', nameEn: 'Employee Personal Liability', isStandard: true },
    { code: '4.4', nameHe: 'כלי נשק', nameEn: 'Weapons', isStandard: true },
    { code: '4.5', nameHe: 'קבלנים/קבלני משנה ועובדיהם', nameEn: 'Contractors/Subcontractors & Workers', isStandard: true },
    { code: '4.6', nameHe: 'בעלי שליטה בשכר', nameEn: 'Controlling Shareholders on Payroll', isStandard: true },
    { code: '4.7', nameHe: 'צד שלישי שהתחייב לבטח', nameEn: 'Third Party Required to Be Insured', isStandard: true },
    { code: '4.8', nameHe: 'פגיעה אישית', nameEn: 'Personal Injury', isStandard: true, defaultLimit: 150000, limitNotes: 'NIS 150K per event (vs NIS 200K BIT)' },
    { code: '4.9', nameHe: 'הגנה פלילית/מנהלית', nameEn: 'Criminal/Admin Defense', isStandard: true, defaultLimit: 150000, limitNotes: 'NIS 150K/event, NIS 300K aggregate (vs NIS 200K/400K BIT)' },
    // Note: Missing Work-Related Activities, Held Territories, Waiver of Subrogation
    // Menorah-specific
    { code: 'MN-4.10', nameHe: 'כיסוי תאונות בדרך לעבודה/ממנה', nameEn: 'Commuting Accident Coverage', isStandard: false, limitNotes: 'Menorah-specific: covers employer liability for commuting accidents beyond NII scope' },
  ],
  exclusions: [
    { code: 'E1', nameHe: 'אחריות חוזית', nameEn: 'Contractual liability', isStandard: true },
    { code: 'E2', nameHe: 'תביעות ביטוח לאומי', nameEn: 'National Insurance default claims', isStandard: true },
    { code: 'E3', nameHe: 'אסבסט/סיליקון/סיליקוזיס', nameEn: 'Asbestos/Silicone/Silicosis', isStandard: true },
    { code: 'E4', nameHe: 'מלחמה/טרור', nameEn: 'War/terrorism', isStandard: true },
    { code: 'E5', nameHe: 'גרעיני/קרינה', nameEn: 'Nuclear/Radiation/EMF', isStandard: true },
    { code: 'E6', nameHe: 'תאונות דרכים', nameEn: 'Motor vehicle road accidents', isStandard: true },
    { code: 'E7', nameHe: 'פיצויים עונשיים', nameEn: 'Punitive damages', isStandard: true },
    { code: 'E8', nameHe: 'רשלנות חמורה', nameEn: 'Gross negligence', isStandard: true },
    // Menorah-specific
    { code: 'MN-E9', nameHe: 'עובדים בתקופת ניסיון (פחות מ-30 יום)', nameEn: 'Probationary employees (less than 30 days)', isStandard: false },
    { code: 'MN-E10', nameHe: 'פעילויות ספורט/נופש מאורגנות מטעם המעסיק', nameEn: 'Employer-organized sports/recreation activities', isStandard: false },
  ],
};

// ============================================================
// ASSEMBLE ALL MENORAH POLICIES
// ============================================================

const detailedProductCodes = [
  'FIRE_CONSEQUENTIAL_LOSS',
  'THIRD_PARTY_LIABILITY',
  'EMPLOYERS_LIABILITY',
];

const menorahPolicies: PolicySeed[] = [
  menorahFirePolicy,
  menorahThirdPartyPolicy,
  menorahEmployersLiabilityPolicy,
  ...ALL_PRODUCT_CODES.filter((code) => !detailedProductCodes.includes(code)).map(generateBaseMenorahPolicy),
];

// ============================================================
// SEED FUNCTION
// ============================================================

export async function seedMenorahPolicies(prisma: PrismaClient) {
  console.log('\n--- Seeding Menorah Mivtachim (מנורה מבטחים) policies...');
  await seedInsurerPoliciesForCompany('MENORAH', menorahPolicies, false);
  console.log('--- Menorah seed complete.');
}
