import { PrismaClient } from '@prisma/client';
import { seedInsurerPoliciesForCompany, PolicySeed, ExtSeed, ExclSeed } from './seed-insurer-policies';

// ============================================================
// HAREL (הראל) POLICIES
// BIT 2018 editions, focus on property coverage, higher limits
// Policy form codes: HR-XXXX
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

function generateBaseHarelPolicy(productCode: string): PolicySeed {
  const baseStructures: Record<string, Record<string, unknown>> = {
    MECHANICAL_BREAKDOWN: { chapters: ['Single chapter + extensions'] },
    CASH_MONEY: { chapters: ['Single chapter + extensions'] },
    FIDELITY_CRIME: { chapters: ['Single chapter + 1 extension'] },
    CARGO_IN_TRANSIT: { chapters: ['Single chapter + extensions'] },
    TERRORISM: { chapters: ['Chapter 1 - Property', 'Chapter 2 - Business Interruption'] },
    HEAVY_ENGINEERING_EQUIPMENT: { chapters: ['Single chapter + extensions'] },
    PRODUCT_LIABILITY: { chapters: ['Single chapter + extensions'] },
    THIRD_PARTY_LIABILITY: { chapters: ['Single chapter + extensions'] },
    EMPLOYERS_LIABILITY: { chapters: ['Single chapter + extensions'] },
  };

  const baseTriggers: Record<string, string> = {
    MECHANICAL_BREAKDOWN: 'All-risks trigger',
    CASH_MONEY: 'All-risks trigger',
    FIDELITY_CRIME: 'Discovery-based trigger',
    CARGO_IN_TRANSIT: 'All-risks trigger',
    TERRORISM: 'Excess over Property Tax Fund layer',
    HEAVY_ENGINEERING_EQUIPMENT: 'All-risks trigger',
    PRODUCT_LIABILITY: 'Claims-made trigger',
    THIRD_PARTY_LIABILITY: 'Occurrence-based trigger',
    EMPLOYERS_LIABILITY: 'Occurrence-based trigger',
  };

  const formCodeMap: Record<string, string> = {
    MECHANICAL_BREAKDOWN: 'HR-2040',
    CASH_MONEY: 'HR-2060',
    FIDELITY_CRIME: 'HR-2070',
    CARGO_IN_TRANSIT: 'HR-2080',
    TERRORISM: 'HR-2090',
    HEAVY_ENGINEERING_EQUIPMENT: 'HR-2110',
    PRODUCT_LIABILITY: 'HR-2050',
    THIRD_PARTY_LIABILITY: 'HR-2030',
    EMPLOYERS_LIABILITY: 'HR-2035',
  };

  return {
    productCode,
    policyFormCode: formCodeMap[productCode] || `HR-20XX`,
    bitStandard: 'BIT 2018',
    editionYear: 2018,
    structure: baseStructures[productCode] || { chapters: ['Single chapter'] },
    strengths: [
      'Harel property-focused underwriting — generous replacement value definitions',
      'Higher sub-limits than BIT standard on property-related extensions',
    ],
    weaknesses: [
      'BIT 2018 edition — one year behind Clal BIT 2019',
      'Liability sections less comprehensive than property sections',
    ],
    notableTerms: [
      baseTriggers[productCode] || 'Standard trigger',
      'Harel HR-series form — property-centric structure',
    ],
    extensions: [
      { code: '3.1', nameHe: 'הרחבה 1 — הראל', nameEn: 'Extension 1 — Harel standard', isStandard: true },
      { code: '3.2', nameHe: 'הרחבה 2 — הראל', nameEn: 'Extension 2 — Harel standard', isStandard: true },
      { code: '3.3', nameHe: 'הרחבה 3 — הראל', nameEn: 'Extension 3 — Harel standard', isStandard: true },
      { code: '3.4', nameHe: 'הרחבה 4 — הראל', nameEn: 'Extension 4 — Harel standard', isStandard: true },
      { code: '3.5', nameHe: 'השבת סכום ביטוח', nameEn: 'Sum Insured Reinstatement', isStandard: true },
      { code: '3.6', nameHe: 'הוצאות נוספות הכרחיות', nameEn: 'Necessary Additional Expenses', isStandard: true },
      { code: '3.7', nameHe: 'הוצאות הכנת תביעה', nameEn: 'Claim Preparation Costs', isStandard: true },
      { code: '3.8', nameHe: 'רכוש סמוך', nameEn: 'Adjacent Property', isStandard: true },
      { code: '3.9', nameHe: 'תוספות לרכוש', nameEn: 'Property Additions', isStandard: true },
      { code: '3.10', nameHe: 'חלקים מיושנים', nameEn: 'Obsolete Parts', isStandard: true },
      { code: '3.11', nameHe: 'הוצאות התאמת ציוד', nameEn: 'Equipment Adaptation Expenses', isStandard: true },
      { code: '3.12', nameHe: 'נזק נוסף שנמצא בתיקון', nameEn: 'Additional Damage Found in Repair', isStandard: true },
      { code: '3.13', nameHe: 'ביטוח יסודות', nameEn: 'Foundation Insurance', isStandard: true },
      { code: '3.14', nameHe: 'דליפת גז תאונתית', nameEn: 'Accidental Gas Leak', isStandard: true },
      { code: '3.15', nameHe: 'הוצאות פינוי הריסות', nameEn: 'Debris Removal Costs', isStandard: true },
      // Harel-specific extension
      { code: 'HR-3.16', nameHe: 'כיסוי נזקי מים מורחב', nameEn: 'Extended Water Damage Coverage', isStandard: false, defaultLimit: 500000, limitNotes: 'Harel-specific: covers burst pipes, flooding from adjacent properties — NIS 500K' },
    ],
    exclusions: [
      { code: 'E1', nameHe: 'אבדן תוצאתי', nameEn: 'Consequential loss', isStandard: true },
      { code: 'E2', nameHe: 'מלחמה/טרור', nameEn: 'War/terrorism', isStandard: true },
      { code: 'E3', nameHe: 'סיכונים גרעיניים', nameEn: 'Nuclear risks', isStandard: true },
      { code: 'E4', nameHe: 'בלאי/קורוזיה', nameEn: 'Wear/corrosion', isStandard: true },
      // Harel-specific exclusion
      { code: 'HR-E5', nameHe: 'נזק מתת-קרקע ללא סקר מקדים', nameEn: 'Underground damage without prior survey', isStandard: false },
    ],
  };
}

// ============================================================
// DETAILED POLICIES — 3 key products for Harel
// ============================================================

const harelFirePolicy: PolicySeed = {
  productCode: 'FIRE_CONSEQUENTIAL_LOSS',
  policyFormCode: 'HR-2010',
  bitStandard: 'BIT 2018',
  editionYear: 2018,
  structure: { chapters: ['Part A - Property Insurance', 'Part B - Business Interruption'] },
  strengths: [
    'Higher default limits on property extensions — 20% above BIT standard',
    'Built-in earthquake coverage at no extra premium (BIT requires separate purchase)',
    'Extended water damage coverage — burst pipes, flooding from adjacent properties',
    'Generous replacement value definition — no deduction for depreciation under 5 years',
  ],
  weaknesses: [
    'BIT 2018 edition — one year behind Clal BIT 2019 standard',
    'BI section has fewer extensions (17 vs 19 in BIT standard)',
    'Break-in/Theft extension requires extra premium — free in Clal BIT 2019',
  ],
  notableTerms: [
    'Harel HR-2010 form — property-centric edition with enhanced limits',
    'Earthquake included as standard (72-hour continuous period)',
    'Water damage from adjacent properties covered under ext. 3.22',
  ],
  extensions: [
    { chapterCode: 'A', code: '3.1', nameHe: 'פריצה/גניבה', nameEn: 'Break-in/Theft', isStandard: true, limitNotes: 'Requires extra premium' },
    { chapterCode: 'A', code: '3.2', nameHe: 'רכוש מחוץ לחצרים', nameEn: 'Property Outside Premises', isStandard: true },
    { chapterCode: 'A', code: '3.3', nameHe: 'רכוש מחוץ לגבולות טריטוריאליים', nameEn: 'Property Outside Territorial Limits', isStandard: true },
    { chapterCode: 'A', code: '3.4', nameHe: 'רכוש בזמן בנייה', nameEn: 'Property During Construction', isStandard: true },
    { chapterCode: 'A', code: '3.5', nameHe: 'רכוש בהעברה', nameEn: 'Property in Transit', isStandard: true },
    { chapterCode: 'A', code: '3.6', nameHe: 'חפצים אישיים של עובדים', nameEn: 'Employee Personal Effects', isStandard: true, defaultLimit: 60000, limitNotes: 'NIS 60K (vs NIS 50K BIT standard)' },
    { chapterCode: 'A', code: '3.7', nameHe: 'רכוש שירותים ציבוריים', nameEn: 'Public Utility Property', isStandard: true },
    { chapterCode: 'A', code: '3.8', nameHe: 'תוספות לרכוש', nameEn: 'Additions to Property', isStandard: true, limitNotes: '15% of sum insured (vs 10% BIT standard)' },
    { chapterCode: 'A', code: '3.9', nameHe: 'נזק עקיף למלאי', nameEn: 'Incidental Inventory Damage', isStandard: true },
    { chapterCode: 'A', code: '3.10', nameHe: 'התפוצצות חומרים חמים', nameEn: 'Hot Material Rupture', isStandard: true },
    { chapterCode: 'A', code: '3.11', nameHe: 'הוצאות לאחר אירוע', nameEn: 'Post-Event Expenses', isStandard: true, defaultLimit: 300000, limitNotes: 'NIS 300K (vs NIS 200K BIT standard)' },
    { chapterCode: 'A', code: '3.12', nameHe: 'הוצאות הכנת תביעה', nameEn: 'Claim Preparation Costs', isStandard: true },
    { chapterCode: 'A', code: '3.13', nameHe: 'שכ"ד חלופי', nameEn: 'Alternative Rent', isStandard: true },
    { chapterCode: 'A', code: '3.14', nameHe: 'רכוש שהוצא משימוש', nameEn: 'Property Taken Out of Service', isStandard: true },
    { chapterCode: 'A', code: '3.15', nameHe: 'הגנת שם מסחרי', nameEn: 'Brand Name Protection', isStandard: true },
    { chapterCode: 'A', code: '3.16', nameHe: 'קריסת מדפים', nameEn: 'Shelving Collapse', isStandard: true },
    { chapterCode: 'A', code: '3.17', nameHe: 'שבר זכוכית', nameEn: 'Glass Breakage', isStandard: true },
    { chapterCode: 'A', code: '3.18', nameHe: 'נזק ללוח חשמל', nameEn: 'Electrical Panel Damage', isStandard: true },
    { chapterCode: 'A', code: '3.19', nameHe: 'קריסת מבנה', nameEn: 'Massive Building Collapse', isStandard: true },
    { chapterCode: 'A', code: '3.20', nameHe: 'השלמה לכל הסיכונים', nameEn: 'All-Risks Completion', isStandard: true },
    { chapterCode: 'A', code: '3.21', nameHe: 'השבת סכום ביטוח', nameEn: 'Sum Insured Reinstatement', isStandard: true },
    // Harel-specific property extensions
    { chapterCode: 'A', code: 'HR-3.22', nameHe: 'נזקי מים מרכוש סמוך', nameEn: 'Water Damage from Adjacent Property', isStandard: false, defaultLimit: 500000, limitNotes: 'Harel-specific: NIS 500K first loss' },
    { chapterCode: 'A', code: 'HR-3.23', nameHe: 'רעידת אדמה — כלול', nameEn: 'Earthquake — Included', isStandard: false, limitNotes: 'Included at no extra premium (BIT requires purchase)' },
    { chapterCode: 'B', code: '10.1', nameHe: 'הפרעה בשירותים ציבוריים', nameEn: 'Public Services Disruption', isStandard: true },
    { chapterCode: 'B', code: '10.2', nameHe: 'השפעה הדדית בין עסקים', nameEn: 'Mutual Business Influence', isStandard: true },
    { chapterCode: 'B', code: '10.3', nameHe: 'הפרעה בספקים/לקוחות', nameEn: 'Suppliers/Customers Disruption', isStandard: true },
    { chapterCode: 'B', code: '10.4', nameHe: 'מניעת גישה', nameEn: 'Denial of Access', isStandard: true },
    { chapterCode: 'B', code: '10.5', nameHe: 'רכוש שאינו בבעלות', nameEn: 'Property Not Owned', isStandard: true },
    { chapterCode: 'B', code: '10.6', nameHe: 'מכירה ממלאי', nameEn: 'Sale from Inventory', isStandard: true },
    { chapterCode: 'B', code: '10.7', nameHe: 'אבדן תוצאתי בנייה', nameEn: 'Construction BI', isStandard: true },
    { chapterCode: 'B', code: '10.8', nameHe: 'אבדן תוצאתי העברה', nameEn: 'Transit BI', isStandard: true },
    { chapterCode: 'B', code: '10.9', nameHe: 'אבדן תוצאתי קריסת מבנה', nameEn: 'Building Collapse BI', isStandard: true },
    { chapterCode: 'B', code: '10.10', nameHe: 'שיפורי ציוד', nameEn: 'Equipment Improvements', isStandard: true },
    { chapterCode: 'B', code: '10.11', nameHe: 'הוצאות משתנות', nameEn: 'Changed Expenses', isStandard: true },
    { chapterCode: 'B', code: '10.12', nameHe: 'הוצאות עמידה בתקנות', nameEn: 'Compliance Costs', isStandard: true },
    { chapterCode: 'B', code: '10.13', nameHe: 'קנסות חוזיים', nameEn: 'Contract Penalties', isStandard: true },
    { chapterCode: 'B', code: '10.14', nameHe: 'חובות בספרים פתוחים', nameEn: 'Open Book Debts', isStandard: true },
    { chapterCode: 'B', code: '10.15', nameHe: 'הוצאות שונות', nameEn: 'Miscellaneous Expenses', isStandard: true },
    { chapterCode: 'B', code: '10.16', nameHe: 'הוצאות הכנת תביעה', nameEn: 'Claim Preparation Costs', isStandard: true },
    { chapterCode: 'B', code: '10.17', nameHe: 'עלויות מו"פ', nameEn: 'R&D Costs', isStandard: true },
  ],
  exclusions: [
    { code: 'E1', nameHe: 'אבדן תוצאתי (חלק א)', nameEn: 'Consequential loss (Part A)', isStandard: true },
    { code: 'E2', nameHe: 'נזק למתקן חשמלי', nameEn: 'Electrical installation damage', isStandard: true },
    { code: 'E3', nameHe: 'רכוש מבוטח ימי', nameEn: 'Marine-insured property', isStandard: true },
    { code: 'E4', nameHe: 'נזק בהוראת ממשלה', nameEn: 'Government-ordered damage', isStandard: true },
    { code: 'E5', nameHe: 'סיכונים גרעיניים', nameEn: 'Nuclear risks', isStandard: true },
    { code: 'E6', nameHe: 'מלחמה/טרור', nameEn: 'War/terrorism', isStandard: true },
    { code: 'E7', nameHe: 'זיהום (אלא אם מסיכון מבוטח)', nameEn: 'Pollution (unless from insured peril)', isStandard: true },
    { code: 'E8', nameHe: 'רשלנות חמורה', nameEn: 'Gross negligence', isStandard: true },
    { code: 'E9', nameHe: 'רכוש לא מוחשי/מידע', nameEn: 'Intangible property/data', isStandard: true },
    // Harel-specific exclusion
    { code: 'HR-E10', nameHe: 'נזק ממערכות ספרינקלר פגומות ללא בדיקה שנתית', nameEn: 'Sprinkler damage without annual inspection certificate', isStandard: false },
  ],
};

const harelElectronicEquipmentPolicy: PolicySeed = {
  productCode: 'ELECTRONIC_EQUIPMENT',
  policyFormCode: 'HR-2100',
  bitStandard: 'BIT 2018',
  editionYear: 2018,
  structure: { chapters: ['Ch1 - Property', 'Ch2 - Data & Software', 'Ch3 - Additional Expenses', 'Ch4 - Business Interruption'] },
  strengths: [
    'Equipment matching NIS 200K (vs NIS 160K BIT standard)',
    'Obsolete parts NIS 200K (vs NIS 160K BIT standard)',
    'Software adaptation NIS 120K (vs NIS 80K BIT standard)',
    'Adjacent property NIS 100K (vs NIS 60K BIT standard)',
  ],
  weaknesses: [
    'BIT 2018 edition — one year behind standard',
    'Simple theft remains excluded with no extension option',
  ],
  notableTerms: [
    'All-risks trigger',
    'Enhanced property limits across all sub-extensions',
    'Can be residual to Fire policy (excludes fire perils)',
  ],
  extensions: [
    { chapterCode: '1', code: '4.1', nameHe: 'תקלת מערכת מיזוג', nameEn: 'AC System Failure', isStandard: true },
    { chapterCode: '1', code: '4.2', nameHe: 'הוצאות פינוי הריסות', nameEn: 'Debris Removal Costs', isStandard: true },
    { chapterCode: '1', code: '4.3', nameHe: 'הוצאות נוספות הכרחיות', nameEn: 'Necessary Additional Expenses', isStandard: true, defaultLimit: 500000, limitNotes: '20% of benefits or NIS 500K, lower (vs NIS 400K BIT)' },
    { chapterCode: '1', code: '4.4', nameHe: 'נזק נוסף במהלך תיקון', nameEn: 'Additional Damage During Repair', isStandard: true },
    { chapterCode: '1', code: '4.5', nameHe: 'נזק לרכוש סמוך', nameEn: 'Damage to Adjacent Property', isStandard: true, defaultLimit: 100000, limitNotes: 'NIS 100K first loss (vs NIS 60K BIT standard)' },
    { chapterCode: '1', code: '4.6', nameHe: 'הוצאות התאמת ציוד', nameEn: 'Equipment Adaptation Expenses', isStandard: true, defaultLimit: 200000, limitNotes: 'NIS 200K first loss (vs NIS 160K BIT standard)' },
    { chapterCode: '1', code: '4.7', nameHe: 'חלקים מיושנים', nameEn: 'Obsolete Parts', isStandard: true, defaultLimit: 200000, limitNotes: 'NIS 200K first loss (vs NIS 160K BIT standard)' },
    { chapterCode: '1', code: '4.8', nameHe: 'הוצאות התאמת תוכנה', nameEn: 'Software Adaptation Expenses', isStandard: true, defaultLimit: 120000, limitNotes: 'NIS 120K first loss (vs NIS 80K BIT standard)' },
    { chapterCode: '1', code: '4.9', nameHe: 'השבת סכום ביטוח', nameEn: 'Sum Insured Reinstatement', isStandard: true, limitNotes: 'At additional premium' },
    { chapterCode: '1', code: '4.10', nameHe: 'תוספות לרכוש מבוטח', nameEn: 'Additions to Insured Property', isStandard: true, limitNotes: '5-12% of sum, max NIS 600K (vs NIS 500K BIT)' },
    { chapterCode: '1', code: '4.11', nameHe: 'רעידת אדמה', nameEn: 'Earthquake', isStandard: true, limitNotes: 'At additional premium, separate deductible' },
    { chapterCode: '1', code: '4.12', nameHe: 'נזקי טבע', nameEn: 'Natural Perils (storm/flood)', isStandard: true, limitNotes: 'At additional premium' },
    { chapterCode: '4', code: '18.1', nameHe: 'פיצוי הפרת חוזה', nameEn: 'Breach of Contract Compensation', isStandard: true, limitNotes: 'First loss' },
    { chapterCode: '4', code: '18.2', nameHe: 'חובות בספרים', nameEn: 'Outstanding Debts (Book Debts)', isStandard: true, limitNotes: 'First loss' },
    { chapterCode: '4', code: '18.3', nameHe: 'שיפורי ציוד', nameEn: 'Equipment Improvements', isStandard: true },
    { chapterCode: '4', code: '18.4', nameHe: 'השבת סכום ביטוח', nameEn: 'Sum Insured Reinstatement', isStandard: true },
    // Harel-specific
    { chapterCode: '1', code: 'HR-4.13', nameHe: 'כיסוי UPS ומייצבי מתח', nameEn: 'UPS & Voltage Stabilizer Coverage', isStandard: false, defaultLimit: 250000, limitNotes: 'Harel-specific: NIS 250K, covers UPS battery failure and voltage regulator damage' },
    { chapterCode: '2', code: 'HR-18.5', nameHe: 'שחזור נתונים מגיבוי ענן', nameEn: 'Cloud Backup Data Recovery', isStandard: false, defaultLimit: 150000, limitNotes: 'Harel-specific: NIS 150K, covers professional data recovery from cloud backups' },
  ],
  exclusions: [
    { code: 'E1', nameHe: 'חריג שיורי (חפיפת אש)', nameEn: 'Residual policy exclusion (Fire overlap)', isStandard: true },
    { code: 'E2', nameHe: 'פגמים קיימים', nameEn: 'Pre-existing defects', isStandard: true },
    { code: 'E3', nameHe: 'בלאי סביר', nameEn: 'Reasonable wear and tear', isStandard: true },
    { code: 'E4', nameHe: 'ליקויים תפעוליים', nameEn: 'Operational defects', isStandard: true },
    { code: 'E5', nameHe: 'אחריות יצרן/ספק/מתקן', nameEn: 'Manufacturer/supplier/installer warranty', isStandard: true },
    { code: 'E6', nameHe: 'גניבה פשוטה', nameEn: 'Simple theft (not burglary)', isStandard: true },
    { code: 'E7', nameHe: 'מלחמה/טרור', nameEn: 'War/terrorism', isStandard: true },
    { code: 'E8', nameHe: 'סיכונים גרעיניים', nameEn: 'Nuclear risks', isStandard: true },
    // Harel-specific
    { code: 'HR-E9', nameHe: 'ציוד ללא חוזה אחזקה בתוקף', nameEn: 'Equipment without valid maintenance contract', isStandard: false },
  ],
};

const harelContractorWorksPolicy: PolicySeed = {
  productCode: 'CONTRACTOR_WORKS_CAR',
  policyFormCode: 'HR-2120',
  bitStandard: 'BIT 2018',
  editionYear: 2018,
  structure: { chapters: ['Ch A - Property', 'Ch B - Third Party Liability', 'Ch C - Employers Liability'] },
  strengths: [
    '3-section integrated structure with enhanced property limits',
    'Motor vehicle property damage on site NIS 1.5M/event, NIS 3M aggregate (vs NIS 1M/2M BIT)',
    'Auxiliary buildings limit NIS 60K (vs NIS 40K BIT standard)',
    'Built-in earthquake as named peril with no additional premium',
  ],
  weaknesses: [
    'BIT 2018 edition — one year behind standard',
    'Vibration extension deductible remains high: 5-20% of Section B limit',
  ],
  notableTerms: [
    'All-risks trigger',
    'Enhanced property limits for construction projects',
    'Earthquake defined as 72-hour continuous period',
  ],
  extensions: [
    { chapterCode: 'A', code: '3.1', nameHe: 'רכוש אישי עובדים', nameEn: 'Workers Personal Property on Site', isStandard: true },
    { chapterCode: 'A', code: '3.2', nameHe: 'רכוש סמוך', nameEn: 'Adjacent Property', isStandard: true },
    { chapterCode: 'A', code: '3.3', nameHe: 'מבני עזר וציוד קל', nameEn: 'Auxiliary Buildings & Light Equipment', isStandard: true, defaultLimit: 60000, limitNotes: 'NIS 60K per item (vs NIS 40K BIT standard)' },
    { chapterCode: 'A', code: '3.4.1', nameHe: 'הוצאות פינוי הריסות', nameEn: 'Debris Removal Costs', isStandard: true },
    { chapterCode: 'A', code: '3.4.2', nameHe: 'שכר אדריכלים/מומחים', nameEn: 'Architects/Professionals Fees', isStandard: true },
    { chapterCode: 'A', code: '3.4.3', nameHe: 'שינויים נדרשי רשות', nameEn: 'Authority-Required Modifications', isStandard: true },
    { chapterCode: 'A', code: '3.4.4', nameHe: 'הוצאות נוספות הכרחיות', nameEn: 'Necessary Additional Expenses', isStandard: true },
    { chapterCode: 'A', code: '3.5', nameHe: 'גניבה/פריצה', nameEn: 'Theft/Burglary', isStandard: true, limitNotes: 'Insured must maintain guard at all times' },
    { chapterCode: 'A', code: '3.6', nameHe: 'רכוש בהעברה', nameEn: 'Property in Transit', isStandard: true },
    { chapterCode: 'A', code: '3.7', nameHe: 'השבת סכום ביטוח', nameEn: 'Reinstatement of Sum Insured', isStandard: true },
    { chapterCode: 'B', code: '4.1', nameHe: 'אחריות צולבת', nameEn: 'Cross Liability', isStandard: true },
    { chapterCode: 'B', code: '4.2', nameHe: 'נזק תת-קרקעי (צנרת/כבלים)', nameEn: 'Underground Damage (pipes/cables)', isStandard: true },
    { chapterCode: 'B', code: '4.3', nameHe: 'נזק רכוש מכלי רכב באתר', nameEn: 'Motor Vehicle Property Damage on Site', isStandard: true, defaultLimit: 3000000, limitNotes: 'NIS 1.5M/event, NIS 3M aggregate (vs NIS 1M/2M BIT)' },
    { chapterCode: 'B', code: '4.4', nameHe: 'כלי נשק', nameEn: 'Weapons Liability', isStandard: true },
    { chapterCode: 'B', code: '5.1', nameHe: 'נזקי גוף מציוד כבד (צמ"ה)', nameEn: 'Bodily Injury from Heavy Equipment', isStandard: true, limitNotes: 'At additional premium' },
    { chapterCode: 'B', code: '5.2', nameHe: 'רעידות/החלשת משען', nameEn: 'Vibration/Support Weakening', isStandard: true, defaultLimit: 5000000, limitNotes: '5-20% of Section B limit or NIS 5M (vs NIS 4M BIT)' },
    { chapterCode: 'C', code: '4.1C', nameHe: 'שהות מחוץ לגבול גיאוגרפי', nameEn: 'Stay Outside Geographic Limit', isStandard: true },
    { chapterCode: 'C', code: '4.2C', nameHe: 'חבות בגין שכר', nameEn: 'Salary/Wages Liability', isStandard: true },
    { chapterCode: 'C', code: '4.3C', nameHe: 'עובד בכל עת בשירות', nameEn: 'Workers at All Times in Service', isStandard: true },
    // Harel-specific
    { chapterCode: 'A', code: 'HR-3.8', nameHe: 'כיסוי נזקי גשם לעבודות טרם גמר', nameEn: 'Rain Damage to Incomplete Works', isStandard: false, defaultLimit: 300000, limitNotes: 'Harel-specific: NIS 300K, covers rain/flood damage during open construction phase' },
  ],
  exclusions: [
    { code: 'E1', nameHe: 'מלחמה/טרור/מרד/מהפכה', nameEn: 'War/terrorism/rebellion/revolution', isStandard: true },
    { code: 'E2', nameHe: 'גרעיני/קרינה', nameEn: 'Nuclear/radiation', isStandard: true },
    { code: 'E3', nameHe: 'הפסקת עבודה >90 יום', nameEn: 'Work stoppage >90 days', isStandard: true },
    { code: 'E4', nameHe: 'מנוף/הרמה ללא רישיון', nameEn: 'Unlicensed crane/lifting operator', isStandard: true },
    { code: 'E5', nameHe: 'תכנון/חומרים/עבודה פגומים', nameEn: 'Faulty design/materials/workmanship', isStandard: true },
    // Harel-specific
    { code: 'HR-E6', nameHe: 'עבודות ללא היתר בנייה בתוקף', nameEn: 'Construction without valid building permit', isStandard: false },
  ],
};

// ============================================================
// ASSEMBLE ALL HAREL POLICIES
// ============================================================

const detailedProductCodes = [
  'FIRE_CONSEQUENTIAL_LOSS',
  'ELECTRONIC_EQUIPMENT',
  'CONTRACTOR_WORKS_CAR',
];

const harelPolicies: PolicySeed[] = [
  harelFirePolicy,
  harelElectronicEquipmentPolicy,
  harelContractorWorksPolicy,
  ...ALL_PRODUCT_CODES.filter((code) => !detailedProductCodes.includes(code)).map(generateBaseHarelPolicy),
];

// ============================================================
// SEED FUNCTION
// ============================================================

export async function seedHarelPolicies(prisma: PrismaClient) {
  console.log('\n--- Seeding Harel (הראל) policies...');
  await seedInsurerPoliciesForCompany('HAREL', harelPolicies, false);
  console.log('--- Harel seed complete.');
}
