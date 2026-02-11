import { PrismaClient } from '@prisma/client';
import { seedInsurerPoliciesForCompany, PolicySeed, ExtSeed, ExclSeed } from './seed-insurer-policies';

// ============================================================
// AYALON (איילון) POLICIES
// BIT 2019 editions, competitive smaller insurer, some BIT extensions missing
// Policy form codes: AY-XXXX
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

function generateBaseAyalonPolicy(productCode: string): PolicySeed {
  const baseStructures: Record<string, Record<string, unknown>> = {
    THIRD_PARTY_LIABILITY: { chapters: ['Single chapter + extensions'] },
    EMPLOYERS_LIABILITY: { chapters: ['Single chapter + extensions'] },
    PRODUCT_LIABILITY: { chapters: ['Single chapter + extensions'] },
    CASH_MONEY: { chapters: ['Single chapter + extensions'] },
    FIDELITY_CRIME: { chapters: ['Single chapter + 1 extension'] },
    CARGO_IN_TRANSIT: { chapters: ['Single chapter + extensions'] },
    TERRORISM: { chapters: ['Chapter 1 - Property', 'Chapter 2 - Business Interruption'] },
    HEAVY_ENGINEERING_EQUIPMENT: { chapters: ['Single chapter + extensions'] },
    ELECTRONIC_EQUIPMENT: { chapters: ['Ch1 - Property', 'Ch2 - Data & Software', 'Ch3 - Additional Expenses', 'Ch4 - Business Interruption'] },
  };

  const baseTriggers: Record<string, string> = {
    THIRD_PARTY_LIABILITY: 'Occurrence-based trigger',
    EMPLOYERS_LIABILITY: 'Occurrence-based trigger',
    PRODUCT_LIABILITY: 'Claims-made trigger',
    CASH_MONEY: 'All-risks trigger',
    FIDELITY_CRIME: 'Discovery-based trigger',
    CARGO_IN_TRANSIT: 'All-risks trigger',
    TERRORISM: 'Excess over Property Tax Fund layer',
    HEAVY_ENGINEERING_EQUIPMENT: 'All-risks trigger',
    ELECTRONIC_EQUIPMENT: 'All-risks trigger',
  };

  const formCodeMap: Record<string, string> = {
    THIRD_PARTY_LIABILITY: 'AY-4030',
    EMPLOYERS_LIABILITY: 'AY-4035',
    PRODUCT_LIABILITY: 'AY-4050',
    CASH_MONEY: 'AY-4060',
    FIDELITY_CRIME: 'AY-4070',
    CARGO_IN_TRANSIT: 'AY-4080',
    TERRORISM: 'AY-4090',
    HEAVY_ENGINEERING_EQUIPMENT: 'AY-4110',
    ELECTRONIC_EQUIPMENT: 'AY-4100',
  };

  return {
    productCode,
    policyFormCode: formCodeMap[productCode] || `AY-40XX`,
    bitStandard: 'BIT 2019',
    editionYear: 2019,
    structure: baseStructures[productCode] || { chapters: ['Single chapter'] },
    strengths: [
      'BIT 2019 edition — current standard',
      'Competitive pricing as smaller insurer — often 10-15% below market',
    ],
    weaknesses: [
      'Smaller claims department — potentially slower processing for complex claims',
      'Some BIT standard extensions not included — must be purchased separately',
    ],
    notableTerms: [
      baseTriggers[productCode] || 'Standard trigger',
      'Ayalon AY-series form — competitive pricing with streamlined coverage',
    ],
    extensions: [
      { code: '3.1', nameHe: 'הרחבה 1 — איילון', nameEn: 'Extension 1 — Ayalon standard', isStandard: true },
      { code: '3.2', nameHe: 'הרחבה 2 — איילון', nameEn: 'Extension 2 — Ayalon standard', isStandard: true },
      { code: '3.3', nameHe: 'הרחבה 3 — איילון', nameEn: 'Extension 3 — Ayalon standard', isStandard: true },
      { code: '3.4', nameHe: 'הרחבה 4 — איילון', nameEn: 'Extension 4 — Ayalon standard', isStandard: true },
      { code: '3.5', nameHe: 'השבת סכום ביטוח', nameEn: 'Sum Insured Reinstatement', isStandard: true },
      { code: '3.6', nameHe: 'הוצאות נוספות הכרחיות', nameEn: 'Necessary Additional Expenses', isStandard: true },
      { code: '3.7', nameHe: 'הוצאות הכנת תביעה', nameEn: 'Claim Preparation Costs', isStandard: true },
      { code: '3.8', nameHe: 'רכוש סמוך', nameEn: 'Adjacent Property', isStandard: true },
      { code: '3.9', nameHe: 'תוספות לרכוש', nameEn: 'Property Additions', isStandard: true },
      { code: '3.10', nameHe: 'חלקים מיושנים', nameEn: 'Obsolete Parts', isStandard: true },
      { code: '3.11', nameHe: 'הוצאות התאמת ציוד', nameEn: 'Equipment Adaptation Expenses', isStandard: true },
      { code: '3.12', nameHe: 'ביטוח יסודות', nameEn: 'Foundation Insurance', isStandard: true },
      { code: '3.13', nameHe: 'נזק נוסף שנמצא בתיקון', nameEn: 'Additional Damage Found in Repair', isStandard: true },
      // Ayalon-specific
      { code: 'AY-3.14', nameHe: 'הנחה לעסקים ירוקים', nameEn: 'Green Business Discount Extension', isStandard: false, limitNotes: 'Ayalon-specific: 5% premium discount for certified green businesses' },
    ],
    exclusions: [
      { code: 'E1', nameHe: 'אבדן תוצאתי', nameEn: 'Consequential loss', isStandard: true },
      { code: 'E2', nameHe: 'מלחמה/טרור', nameEn: 'War/terrorism', isStandard: true },
      { code: 'E3', nameHe: 'סיכונים גרעיניים', nameEn: 'Nuclear risks', isStandard: true },
      // Ayalon-specific
      { code: 'AY-E4', nameHe: 'עסקים בהפעלה פחות מ-12 חודשים', nameEn: 'Businesses operating less than 12 months', isStandard: false },
    ],
  };
}

// ============================================================
// DETAILED POLICIES — 3 key products for Ayalon
// ============================================================

const ayalonFirePolicy: PolicySeed = {
  productCode: 'FIRE_CONSEQUENTIAL_LOSS',
  policyFormCode: 'AY-4010',
  bitStandard: 'BIT 2019',
  editionYear: 2019,
  structure: { chapters: ['Part A - Property Insurance', 'Part B - Business Interruption'] },
  strengths: [
    'BIT 2019 edition — fully current standard',
    'Competitive pricing — typically 10-15% below Clal/Harel for property',
    'All 21 Part-A extensions included as standard',
  ],
  weaknesses: [
    'Part B has only 15 extensions (vs 19 in BIT standard) — BI coverage gaps',
    'Missing BI extensions: R&D Costs, Additional Sum, Compliance Costs, Sum Reinstatement',
    'Lower sub-limits on several property extensions than larger competitors',
  ],
  notableTerms: [
    'Ayalon AY-4010 form — streamlined BIT 2019 edition',
    'Competitive for SMEs but gaps in BI coverage for larger enterprises',
    'Green business certification discount available (5% premium reduction)',
  ],
  extensions: [
    { chapterCode: 'A', code: '3.1', nameHe: 'פריצה/גניבה', nameEn: 'Break-in/Theft', isStandard: true },
    { chapterCode: 'A', code: '3.2', nameHe: 'רכוש מחוץ לחצרים', nameEn: 'Property Outside Premises', isStandard: true },
    { chapterCode: 'A', code: '3.3', nameHe: 'רכוש מחוץ לגבולות טריטוריאליים', nameEn: 'Property Outside Territorial Limits', isStandard: true },
    { chapterCode: 'A', code: '3.4', nameHe: 'רכוש בזמן בנייה', nameEn: 'Property During Construction', isStandard: true },
    { chapterCode: 'A', code: '3.5', nameHe: 'רכוש בהעברה', nameEn: 'Property in Transit', isStandard: true },
    { chapterCode: 'A', code: '3.6', nameHe: 'חפצים אישיים של עובדים', nameEn: 'Employee Personal Effects', isStandard: true },
    { chapterCode: 'A', code: '3.7', nameHe: 'רכוש שירותים ציבוריים', nameEn: 'Public Utility Property', isStandard: true },
    { chapterCode: 'A', code: '3.8', nameHe: 'תוספות לרכוש', nameEn: 'Additions to Property', isStandard: true },
    { chapterCode: 'A', code: '3.9', nameHe: 'נזק עקיף למלאי', nameEn: 'Incidental Inventory Damage', isStandard: true },
    { chapterCode: 'A', code: '3.10', nameHe: 'התפוצצות חומרים חמים', nameEn: 'Hot Material Rupture', isStandard: true },
    { chapterCode: 'A', code: '3.11', nameHe: 'הוצאות לאחר אירוע', nameEn: 'Post-Event Expenses', isStandard: true },
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
    // Ayalon-specific
    { chapterCode: 'A', code: 'AY-3.22', nameHe: 'הנחת עסק ירוק', nameEn: 'Green Business Premium Discount', isStandard: false, limitNotes: 'Ayalon-specific: 5% premium reduction for ISO 14001 certified businesses' },
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
    { chapterCode: 'B', code: '10.13', nameHe: 'קנסות חוזיים', nameEn: 'Contract Penalties', isStandard: true },
    { chapterCode: 'B', code: '10.14', nameHe: 'חובות בספרים פתוחים', nameEn: 'Open Book Debts', isStandard: true },
    { chapterCode: 'B', code: '10.15', nameHe: 'הוצאות שונות', nameEn: 'Miscellaneous Expenses', isStandard: true },
    // Note: Missing 10.12 (Compliance Costs), 10.16 (Claim Prep), 10.17 (R&D), 10.18 (Additional Sum), 10.19 (Sum Reinstatement)
  ],
  exclusions: [
    { code: 'E1', nameHe: 'אבדן תוצאתי (חלק א)', nameEn: 'Consequential loss (Part A)', isStandard: true },
    { code: 'E2', nameHe: 'נזק למתקן חשמלי', nameEn: 'Electrical installation damage', isStandard: true },
    { code: 'E3', nameHe: 'רכוש מבוטח ימי', nameEn: 'Marine-insured property', isStandard: true },
    { code: 'E4', nameHe: 'סיכונים גרעיניים', nameEn: 'Nuclear risks', isStandard: true },
    { code: 'E5', nameHe: 'מלחמה/טרור', nameEn: 'War/terrorism', isStandard: true },
    { code: 'E6', nameHe: 'רעידת אדמה (אלא אם נרכש)', nameEn: 'Earthquake (unless purchased)', isStandard: true },
    { code: 'E7', nameHe: 'זיהום (אלא אם מסיכון מבוטח)', nameEn: 'Pollution (unless from insured peril)', isStandard: true },
    { code: 'E8', nameHe: 'רשלנות חמורה', nameEn: 'Gross negligence', isStandard: true },
    // Ayalon-specific
    { code: 'AY-E9', nameHe: 'מבנה ללא תעודת גמר (טופס 4)', nameEn: 'Building without completion certificate (Form 4)', isStandard: false },
    { code: 'AY-E10', nameHe: 'סיכוני הצפה באזורי סיכון מוכרזים', nameEn: 'Flooding in declared flood-risk zones', isStandard: false },
  ],
};

const ayalonMechanicalBreakdownPolicy: PolicySeed = {
  productCode: 'MECHANICAL_BREAKDOWN',
  policyFormCode: 'AY-4040',
  bitStandard: 'BIT 2019',
  editionYear: 2019,
  structure: { chapters: ['Single chapter + extensions'] },
  strengths: [
    'BIT 2019 compliant — current standard',
    'Competitive pricing for small/medium machinery fleets',
    'Foundation insurance included as standard (often extra in BIT)',
  ],
  weaknesses: [
    'Fewer extensions (9) than Phoenix Pisga (13)',
    'No departmental BI allocation extension',
    'No income deferral mechanism for BI',
    'Lower adjacent property limit — NIS 500K vs NIS 1M in Phoenix',
  ],
  notableTerms: [
    'Complementary to Fire policy — excludes fire perils',
    '60% threshold for internal mechanical/electrical breakdown',
    'Streamlined extension set — suitable for SMEs',
  ],
  extensions: [
    { code: '3.1', nameHe: 'פיצוץ/נוזלים/פקיעת צנרת', nameEn: 'Explosion/Liquid/Burst Pipe Gap', isStandard: true },
    { code: '3.2', nameHe: 'נזק ללוח חשמל', nameEn: 'Electrical Panel Damage', isStandard: true },
    { code: '3.3', nameHe: 'הוצאות נוספות הכרחיות', nameEn: 'Additional Necessary Expenses', isStandard: true },
    { code: '3.4', nameHe: 'ביטוח יסודות', nameEn: 'Foundation Insurance', isStandard: true },
    { code: '3.5', nameHe: 'דליפת גז תאונתית', nameEn: 'Accidental Gas Leak', isStandard: true },
    { code: '3.6', nameHe: 'רכוש נוסף שנמצא בתיקון', nameEn: 'Additional Property Found in Repair', isStandard: true },
    { code: '3.7', nameHe: 'נזק לרכוש סמוך/מחובר', nameEn: 'Adjacent/Connected Property Damage', isStandard: true, defaultLimit: 500000, limitNotes: 'NIS 500K (vs NIS 1M in larger insurers)' },
    { code: '3.8', nameHe: 'תוספות לרכוש', nameEn: 'Property Additions', isStandard: true },
    { code: '3.9', nameHe: 'השבת סכום ביטוח', nameEn: 'Sum Insured Reinstatement', isStandard: true },
    // Ayalon-specific
    { code: 'AY-3.10', nameHe: 'כיסוי ציוד בהשכרה', nameEn: 'Leased Equipment Coverage', isStandard: false, limitNotes: 'Ayalon-specific: covers leased machinery under same terms as owned — no separate policy needed' },
  ],
  exclusions: [
    { code: 'E1', nameHe: 'סיכוני פוליסת אש (משלים)', nameEn: 'Fire policy perils (complementary)', isStandard: true },
    { code: 'E2', nameHe: 'אבדן תוצאתי', nameEn: 'Consequential loss', isStandard: true },
    { code: 'E3', nameHe: 'עומס יתר/שימוש ניסיוני', nameEn: 'Overload/experimental use', isStandard: true },
    { code: 'E4', nameHe: 'אחריות יצרן/ספק', nameEn: 'Manufacturer/supplier warranty', isStandard: true },
    { code: 'E5', nameHe: 'פגמים קיימים', nameEn: 'Pre-existing defects', isStandard: true },
    // Ayalon-specific
    { code: 'AY-E6', nameHe: 'ציוד מעל 15 שנה ללא בדיקה שנתית', nameEn: 'Equipment over 15 years without annual inspection', isStandard: false },
  ],
};

const ayalonContractorWorksPolicy: PolicySeed = {
  productCode: 'CONTRACTOR_WORKS_CAR',
  policyFormCode: 'AY-4120',
  bitStandard: 'BIT 2019',
  editionYear: 2019,
  structure: { chapters: ['Ch A - Property', 'Ch B - Third Party Liability', 'Ch C - Employers Liability'] },
  strengths: [
    'BIT 2019 compliant — current standard for construction',
    'Competitive pricing for small-to-medium construction projects',
    'Simplified application process — fewer underwriting questions',
  ],
  weaknesses: [
    'Vibration extension not available — must be purchased from separate insurer',
    'Heavy equipment bodily injury extension not included (requires add-on)',
    'Lower motor vehicle damage limit — NIS 750K/event, NIS 1.5M aggregate',
  ],
  notableTerms: [
    'All-risks trigger',
    'No vibration/support weakening extension — significant gap for urban construction',
    'Best suited for small residential/commercial projects under NIS 20M',
  ],
  extensions: [
    { chapterCode: 'A', code: '3.1', nameHe: 'רכוש אישי עובדים', nameEn: 'Workers Personal Property on Site', isStandard: true },
    { chapterCode: 'A', code: '3.2', nameHe: 'רכוש סמוך', nameEn: 'Adjacent Property', isStandard: true },
    { chapterCode: 'A', code: '3.3', nameHe: 'מבני עזר וציוד קל', nameEn: 'Auxiliary Buildings & Light Equipment', isStandard: true, defaultLimit: 30000, limitNotes: 'NIS 30K per item (vs NIS 40K BIT standard)' },
    { chapterCode: 'A', code: '3.4.1', nameHe: 'הוצאות פינוי הריסות', nameEn: 'Debris Removal Costs', isStandard: true },
    { chapterCode: 'A', code: '3.4.2', nameHe: 'שכר אדריכלים/מומחים', nameEn: 'Architects/Professionals Fees', isStandard: true },
    { chapterCode: 'A', code: '3.4.3', nameHe: 'הוצאות נוספות הכרחיות', nameEn: 'Necessary Additional Expenses', isStandard: true },
    { chapterCode: 'A', code: '3.5', nameHe: 'גניבה/פריצה', nameEn: 'Theft/Burglary', isStandard: true, limitNotes: 'Insured must maintain guard at all times' },
    { chapterCode: 'A', code: '3.6', nameHe: 'רכוש בהעברה', nameEn: 'Property in Transit', isStandard: true },
    { chapterCode: 'A', code: '3.7', nameHe: 'השבת סכום ביטוח', nameEn: 'Reinstatement of Sum Insured', isStandard: true },
    { chapterCode: 'B', code: '4.1', nameHe: 'אחריות צולבת', nameEn: 'Cross Liability', isStandard: true },
    { chapterCode: 'B', code: '4.2', nameHe: 'נזק תת-קרקעי (צנרת/כבלים)', nameEn: 'Underground Damage (pipes/cables)', isStandard: true },
    { chapterCode: 'B', code: '4.3', nameHe: 'נזק רכוש מכלי רכב באתר', nameEn: 'Motor Vehicle Property Damage on Site', isStandard: true, defaultLimit: 1500000, limitNotes: 'NIS 750K/event, NIS 1.5M aggregate (lower than BIT NIS 1M/2M)' },
    { chapterCode: 'B', code: '4.4', nameHe: 'כלי נשק', nameEn: 'Weapons Liability', isStandard: true },
    { chapterCode: 'C', code: '4.1C', nameHe: 'שהות מחוץ לגבול גיאוגרפי', nameEn: 'Stay Outside Geographic Limit', isStandard: true },
    { chapterCode: 'C', code: '4.2C', nameHe: 'חבות בגין שכר', nameEn: 'Salary/Wages Liability', isStandard: true },
    { chapterCode: 'C', code: '4.3C', nameHe: 'עובד בכל עת בשירות', nameEn: 'Workers at All Times in Service', isStandard: true },
    { chapterCode: 'C', code: '4.4C', nameHe: 'אחריות אישית עובד', nameEn: 'Worker Personal Liability', isStandard: true },
    // Ayalon-specific
    { chapterCode: 'A', code: 'AY-3.8', nameHe: 'כיסוי פרויקטים קטנים מהיר', nameEn: 'Fast-Track Small Project Coverage', isStandard: false, limitNotes: 'Ayalon-specific: simplified underwriting for projects under NIS 5M — 48-hour binding' },
    // Note: Missing vibration/support weakening extension (5.2) and heavy equipment BI (5.1)
  ],
  exclusions: [
    { code: 'E1', nameHe: 'מלחמה/טרור/מרד/מהפכה', nameEn: 'War/terrorism/rebellion/revolution', isStandard: true },
    { code: 'E2', nameHe: 'גרעיני/קרינה', nameEn: 'Nuclear/radiation', isStandard: true },
    { code: 'E3', nameHe: 'הפסקת עבודה >90 יום', nameEn: 'Work stoppage >90 days', isStandard: true },
    { code: 'E4', nameHe: 'מנוף/הרמה ללא רישיון', nameEn: 'Unlicensed crane/lifting operator', isStandard: true },
    { code: 'E5', nameHe: 'תכנון/חומרים/עבודה פגומים', nameEn: 'Faulty design/materials/workmanship', isStandard: true },
    // Ayalon-specific
    { code: 'AY-E6', nameHe: 'פרויקטים מעל 10 קומות — נדרש חיתום מיוחד', nameEn: 'Projects over 10 floors — special underwriting required', isStandard: false },
    { code: 'AY-E7', nameHe: 'עבודות מנהרות/חפירה עמוקה מ-8 מטר', nameEn: 'Tunneling/excavation deeper than 8 meters', isStandard: false },
  ],
};

// ============================================================
// ASSEMBLE ALL AYALON POLICIES
// ============================================================

const detailedProductCodes = [
  'FIRE_CONSEQUENTIAL_LOSS',
  'MECHANICAL_BREAKDOWN',
  'CONTRACTOR_WORKS_CAR',
];

const ayalonPolicies: PolicySeed[] = [
  ayalonFirePolicy,
  ayalonMechanicalBreakdownPolicy,
  ayalonContractorWorksPolicy,
  ...ALL_PRODUCT_CODES.filter((code) => !detailedProductCodes.includes(code)).map(generateBaseAyalonPolicy),
];

// ============================================================
// SEED FUNCTION
// ============================================================

export async function seedAyalonPolicies(prisma: PrismaClient) {
  console.log('\n--- Seeding Ayalon (איילון) policies...');
  await seedInsurerPoliciesForCompany('AYALON', ayalonPolicies, false);
  console.log('--- Ayalon seed complete.');
}
