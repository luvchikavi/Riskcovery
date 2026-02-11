import { PrismaClient } from '@prisma/client';
import { seedInsurerPoliciesForCompany, PolicySeed, ExtSeed, ExclSeed } from './seed-insurer-policies';

// ============================================================
// SHLOMO (שלמה) POLICIES
// BIT 2020 editions, newest policies, adds cyber/tech extensions not in standard
// Policy form codes: SH-XXXX
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

function generateBaseShlomoPolicy(productCode: string): PolicySeed {
  const baseStructures: Record<string, Record<string, unknown>> = {
    THIRD_PARTY_LIABILITY: { chapters: ['Single chapter + extensions'] },
    EMPLOYERS_LIABILITY: { chapters: ['Single chapter + extensions'] },
    PRODUCT_LIABILITY: { chapters: ['Single chapter + extensions'] },
    CASH_MONEY: { chapters: ['Single chapter + extensions'] },
    FIDELITY_CRIME: { chapters: ['Single chapter + 1 extension'] },
    CARGO_IN_TRANSIT: { chapters: ['Single chapter + extensions'] },
    TERRORISM: { chapters: ['Chapter 1 - Property', 'Chapter 2 - Business Interruption'] },
    HEAVY_ENGINEERING_EQUIPMENT: { chapters: ['Single chapter + extensions'] },
    CONTRACTOR_WORKS_CAR: { chapters: ['Ch A - Property', 'Ch B - Third Party Liability', 'Ch C - Employers Liability'] },
    MECHANICAL_BREAKDOWN: { chapters: ['Single chapter + extensions'] },
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
    CONTRACTOR_WORKS_CAR: 'All-risks trigger',
    MECHANICAL_BREAKDOWN: 'All-risks trigger',
  };

  const formCodeMap: Record<string, string> = {
    THIRD_PARTY_LIABILITY: 'SH-6030',
    EMPLOYERS_LIABILITY: 'SH-6035',
    PRODUCT_LIABILITY: 'SH-6050',
    CASH_MONEY: 'SH-6060',
    FIDELITY_CRIME: 'SH-6070',
    CARGO_IN_TRANSIT: 'SH-6080',
    TERRORISM: 'SH-6090',
    HEAVY_ENGINEERING_EQUIPMENT: 'SH-6110',
    CONTRACTOR_WORKS_CAR: 'SH-6120',
    MECHANICAL_BREAKDOWN: 'SH-6040',
  };

  return {
    productCode,
    policyFormCode: formCodeMap[productCode] || `SH-60XX`,
    bitStandard: 'BIT 2020',
    editionYear: 2020,
    structure: baseStructures[productCode] || { chapters: ['Single chapter'] },
    strengths: [
      'BIT 2020 edition — newest standard, ahead of Clal BIT 2019',
      'Innovative cyber/tech extensions integrated into traditional policies',
      'Digital-first claims process — online submission and tracking',
    ],
    weaknesses: [
      'Newer insurer — smaller market share and claims history',
      'Limited agent network — primarily direct/digital distribution',
    ],
    notableTerms: [
      baseTriggers[productCode] || 'Standard trigger',
      'Shlomo SH-series form — newest BIT 2020 edition with tech extensions',
      'Digital-first insurer with online policy management',
    ],
    extensions: [
      { code: '3.1', nameHe: 'הרחבה 1 — שלמה', nameEn: 'Extension 1 — Shlomo standard', isStandard: true },
      { code: '3.2', nameHe: 'הרחבה 2 — שלמה', nameEn: 'Extension 2 — Shlomo standard', isStandard: true },
      { code: '3.3', nameHe: 'הרחבה 3 — שלמה', nameEn: 'Extension 3 — Shlomo standard', isStandard: true },
      { code: '3.4', nameHe: 'הרחבה 4 — שלמה', nameEn: 'Extension 4 — Shlomo standard', isStandard: true },
      { code: '3.5', nameHe: 'השבת סכום ביטוח', nameEn: 'Sum Insured Reinstatement', isStandard: true },
      { code: '3.6', nameHe: 'הוצאות נוספות הכרחיות', nameEn: 'Necessary Additional Expenses', isStandard: true },
      { code: '3.7', nameHe: 'הוצאות הכנת תביעה', nameEn: 'Claim Preparation Costs', isStandard: true },
      { code: '3.8', nameHe: 'רכוש סמוך', nameEn: 'Adjacent Property', isStandard: true },
      { code: '3.9', nameHe: 'תוספות לרכוש', nameEn: 'Property Additions', isStandard: true },
      { code: '3.10', nameHe: 'חלקים מיושנים', nameEn: 'Obsolete Parts', isStandard: true },
      { code: '3.11', nameHe: 'הוצאות התאמת ציוד', nameEn: 'Equipment Adaptation Expenses', isStandard: true },
      { code: '3.12', nameHe: 'ביטוח יסודות', nameEn: 'Foundation Insurance', isStandard: true },
      { code: '3.13', nameHe: 'נזק נוסף שנמצא בתיקון', nameEn: 'Additional Damage Found in Repair', isStandard: true },
      { code: '3.14', nameHe: 'דליפת גז תאונתית', nameEn: 'Accidental Gas Leak', isStandard: true },
      { code: '3.15', nameHe: 'הוצאות פינוי הריסות', nameEn: 'Debris Removal Costs', isStandard: true },
      { code: '3.16', nameHe: 'אחריות צולבת', nameEn: 'Cross Liability', isStandard: true },
      // Shlomo-specific tech extensions
      { code: 'SH-3.17', nameHe: 'כיסוי סייבר בסיסי — הודעה על אירוע', nameEn: 'Basic Cyber — Incident Notification', isStandard: false, defaultLimit: 200000, limitNotes: 'Shlomo-specific: NIS 200K for breach notification and credit monitoring costs' },
      { code: 'SH-3.18', nameHe: 'כיסוי IoT — נזק מהתקנים חכמים', nameEn: 'IoT Device Damage Coverage', isStandard: false, defaultLimit: 150000, limitNotes: 'Shlomo-specific: NIS 150K for physical damage caused by malfunctioning IoT/smart devices' },
    ],
    exclusions: [
      { code: 'E1', nameHe: 'אבדן תוצאתי', nameEn: 'Consequential loss', isStandard: true },
      { code: 'E2', nameHe: 'מלחמה/טרור', nameEn: 'War/terrorism', isStandard: true },
      { code: 'E3', nameHe: 'סיכונים גרעיניים', nameEn: 'Nuclear risks', isStandard: true },
      // Shlomo-specific
      { code: 'SH-E4', nameHe: 'מתקפת סייבר ממדינה (State-sponsored)', nameEn: 'State-sponsored cyber attack', isStandard: false },
    ],
  };
}

// ============================================================
// DETAILED POLICIES — 3 key products for Shlomo (tech/cyber focus)
// ============================================================

const shlomoFirePolicy: PolicySeed = {
  productCode: 'FIRE_CONSEQUENTIAL_LOSS',
  policyFormCode: 'SH-6010',
  bitStandard: 'BIT 2020',
  editionYear: 2020,
  structure: { chapters: ['Part A - Property Insurance', 'Part B - Business Interruption', 'Part C - Cyber Property Endorsement'] },
  strengths: [
    'BIT 2020 edition — newest standard, one year ahead of Clal BIT 2019',
    'Unique Part C: Cyber Property Endorsement — covers physical damage from cyber attacks',
    'Full 21 Part-A extensions plus 19 Part-B extensions (full BIT compliance)',
    'Digital claims submission with 48-hour acknowledgment guarantee',
  ],
  weaknesses: [
    'Newer insurer with limited claims track record on complex fire claims',
    'Part C (Cyber Property) has NIS 1M aggregate sub-limit — may be insufficient for large enterprises',
  ],
  notableTerms: [
    'Shlomo SH-6010 form — BIT 2020 with integrated cyber property endorsement',
    'First Israeli fire policy to include cyber-physical damage coverage',
    'Part C: covers physical damage resulting from cyber attacks on operational technology',
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
    // Shlomo-specific cyber extensions in Part C
    { chapterCode: 'C', code: 'SH-C.1', nameHe: 'נזק פיזי ממתקפת סייבר', nameEn: 'Physical Damage from Cyber Attack', isStandard: false, defaultLimit: 1000000, limitNotes: 'Shlomo-specific: NIS 1M aggregate — covers fire/explosion/mechanical failure triggered by cyber intrusion' },
    { chapterCode: 'C', code: 'SH-C.2', nameHe: 'אבדן תוצאתי ממתקפת סייבר', nameEn: 'Cyber-Triggered Business Interruption', isStandard: false, defaultLimit: 500000, limitNotes: 'Shlomo-specific: NIS 500K — BI from cyber attack on OT/SCADA systems' },
    { chapterCode: 'C', code: 'SH-C.3', nameHe: 'הוצאות שחזור מערכות OT', nameEn: 'OT System Restoration Costs', isStandard: false, defaultLimit: 300000, limitNotes: 'Shlomo-specific: NIS 300K — professional costs to restore operational technology' },
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
    { chapterCode: 'B', code: '10.18', nameHe: 'סכום נוסף', nameEn: 'Additional Sum', isStandard: true },
    { chapterCode: 'B', code: '10.19', nameHe: 'השבת סכום ביטוח', nameEn: 'Sum Reinstatement', isStandard: true },
  ],
  exclusions: [
    { code: 'E1', nameHe: 'אבדן תוצאתי (חלק א)', nameEn: 'Consequential loss (Part A)', isStandard: true },
    { code: 'E2', nameHe: 'נזק למתקן חשמלי', nameEn: 'Electrical installation damage', isStandard: true },
    { code: 'E3', nameHe: 'רכוש מבוטח ימי', nameEn: 'Marine-insured property', isStandard: true },
    { code: 'E4', nameHe: 'סיכונים גרעיניים', nameEn: 'Nuclear risks', isStandard: true },
    { code: 'E5', nameHe: 'מלחמה/טרור', nameEn: 'War/terrorism', isStandard: true },
    { code: 'E6', nameHe: 'זיהום (אלא אם מסיכון מבוטח)', nameEn: 'Pollution (unless from insured peril)', isStandard: true },
    { code: 'E7', nameHe: 'רשלנות חמורה', nameEn: 'Gross negligence', isStandard: true },
    // Shlomo-specific
    { code: 'SH-E8', nameHe: 'מתקפת סייבר ממדינה (חלק C)', nameEn: 'State-sponsored cyber attack (Part C only)', isStandard: false },
    { code: 'SH-E9', nameHe: 'נזק סייבר ללא אימות דו-שלבי פעיל', nameEn: 'Cyber damage without active 2FA/MFA', isStandard: false },
  ],
};

const shlomoElectronicEquipmentPolicy: PolicySeed = {
  productCode: 'ELECTRONIC_EQUIPMENT',
  policyFormCode: 'SH-6100',
  bitStandard: 'BIT 2020',
  editionYear: 2020,
  structure: { chapters: ['Ch1 - Property', 'Ch2 - Data & Software', 'Ch3 - Additional Expenses', 'Ch4 - Business Interruption', 'Ch5 - Cyber Endorsement'] },
  strengths: [
    'BIT 2020 with unique Ch5: Cyber Endorsement for electronic equipment',
    'Ransomware payment coverage up to NIS 500K (unique in Israeli market)',
    'Data breach notification costs NIS 300K built-in',
    'Cloud service disruption BI extension — covers AWS/Azure/GCP outages',
    'Equipment matching NIS 200K and obsolete parts NIS 200K',
  ],
  weaknesses: [
    'Newer insurer — limited claims history for complex electronic equipment losses',
    'Cyber endorsement has aggregate sub-limit of NIS 1M — may not suit large enterprises',
    'Simple theft remains excluded with no extension option',
  ],
  notableTerms: [
    'All-risks trigger with integrated cyber coverage',
    '5-chapter structure: first Israeli EE policy to include dedicated cyber chapter',
    'Cloud BI extension — innovative for businesses dependent on cloud infrastructure',
  ],
  extensions: [
    { chapterCode: '1', code: '4.1', nameHe: 'תקלת מערכת מיזוג', nameEn: 'AC System Failure', isStandard: true },
    { chapterCode: '1', code: '4.2', nameHe: 'הוצאות פינוי הריסות', nameEn: 'Debris Removal Costs', isStandard: true },
    { chapterCode: '1', code: '4.3', nameHe: 'הוצאות נוספות הכרחיות', nameEn: 'Necessary Additional Expenses', isStandard: true, defaultLimit: 400000, limitNotes: '20% of benefits or NIS 400K, lower' },
    { chapterCode: '1', code: '4.4', nameHe: 'נזק נוסף במהלך תיקון', nameEn: 'Additional Damage During Repair', isStandard: true },
    { chapterCode: '1', code: '4.5', nameHe: 'נזק לרכוש סמוך', nameEn: 'Damage to Adjacent Property', isStandard: true, defaultLimit: 80000, limitNotes: 'NIS 80K first loss (vs NIS 60K BIT 2019)' },
    { chapterCode: '1', code: '4.6', nameHe: 'הוצאות התאמת ציוד', nameEn: 'Equipment Adaptation Expenses', isStandard: true, defaultLimit: 200000, limitNotes: 'NIS 200K first loss' },
    { chapterCode: '1', code: '4.7', nameHe: 'חלקים מיושנים', nameEn: 'Obsolete Parts', isStandard: true, defaultLimit: 200000, limitNotes: 'NIS 200K first loss' },
    { chapterCode: '1', code: '4.8', nameHe: 'הוצאות התאמת תוכנה', nameEn: 'Software Adaptation Expenses', isStandard: true, defaultLimit: 100000, limitNotes: 'NIS 100K first loss' },
    { chapterCode: '1', code: '4.9', nameHe: 'השבת סכום ביטוח', nameEn: 'Sum Insured Reinstatement', isStandard: true },
    { chapterCode: '1', code: '4.10', nameHe: 'תוספות לרכוש מבוטח', nameEn: 'Additions to Insured Property', isStandard: true, limitNotes: '4-10% of sum, max NIS 500K' },
    { chapterCode: '1', code: '4.11', nameHe: 'רעידת אדמה', nameEn: 'Earthquake', isStandard: true, limitNotes: 'At additional premium' },
    { chapterCode: '1', code: '4.12', nameHe: 'נזקי טבע', nameEn: 'Natural Perils (storm/flood)', isStandard: true, limitNotes: 'At additional premium' },
    { chapterCode: '4', code: '18.1', nameHe: 'פיצוי הפרת חוזה', nameEn: 'Breach of Contract Compensation', isStandard: true },
    { chapterCode: '4', code: '18.2', nameHe: 'חובות בספרים', nameEn: 'Outstanding Debts (Book Debts)', isStandard: true },
    { chapterCode: '4', code: '18.3', nameHe: 'שיפורי ציוד', nameEn: 'Equipment Improvements', isStandard: true },
    { chapterCode: '4', code: '18.4', nameHe: 'השבת סכום ביטוח', nameEn: 'Sum Insured Reinstatement', isStandard: true },
    // Shlomo-specific cyber extensions in Ch5
    { chapterCode: '5', code: 'SH-5.1', nameHe: 'תשלום כופר (Ransomware)', nameEn: 'Ransomware Payment Coverage', isStandard: false, defaultLimit: 500000, limitNotes: 'Shlomo-specific: NIS 500K — covers ransom payments with approved negotiator' },
    { chapterCode: '5', code: 'SH-5.2', nameHe: 'הוצאות הודעה על פריצת מידע', nameEn: 'Data Breach Notification Costs', isStandard: false, defaultLimit: 300000, limitNotes: 'Shlomo-specific: NIS 300K — covers notification, credit monitoring, and PR costs' },
    { chapterCode: '5', code: 'SH-5.3', nameHe: 'אבדן תוצאתי מהשבתת שירותי ענן', nameEn: 'Cloud Service Disruption BI', isStandard: false, defaultLimit: 400000, limitNotes: 'Shlomo-specific: NIS 400K — covers BI from AWS/Azure/GCP outage affecting insured' },
    { chapterCode: '5', code: 'SH-5.4', nameHe: 'שחזור מידע מגיבוי ענן', nameEn: 'Cloud Backup Data Recovery', isStandard: false, defaultLimit: 200000, limitNotes: 'Shlomo-specific: NIS 200K — professional data recovery services' },
    { chapterCode: '5', code: 'SH-5.5', nameHe: 'ייעוץ משפטי סייבר', nameEn: 'Cyber Legal Consultation', isStandard: false, defaultLimit: 150000, limitNotes: 'Shlomo-specific: NIS 150K — legal fees for Privacy Protection Authority proceedings' },
  ],
  exclusions: [
    { code: 'E1', nameHe: 'חריג שיורי (חפיפת אש)', nameEn: 'Residual policy exclusion (Fire overlap)', isStandard: true },
    { code: 'E2', nameHe: 'פגמים קיימים', nameEn: 'Pre-existing defects', isStandard: true },
    { code: 'E3', nameHe: 'בלאי סביר', nameEn: 'Reasonable wear and tear', isStandard: true },
    { code: 'E4', nameHe: 'אחריות יצרן/ספק', nameEn: 'Manufacturer/supplier warranty', isStandard: true },
    { code: 'E5', nameHe: 'גניבה פשוטה', nameEn: 'Simple theft (not burglary)', isStandard: true },
    { code: 'E6', nameHe: 'מלחמה/טרור', nameEn: 'War/terrorism', isStandard: true },
    { code: 'E7', nameHe: 'סיכונים גרעיניים', nameEn: 'Nuclear risks', isStandard: true },
    // Shlomo-specific cyber exclusions
    { code: 'SH-E8', nameHe: 'מתקפת סייבר ממדינה (חלק 5)', nameEn: 'State-sponsored cyber attack (Ch5)', isStandard: false },
    { code: 'SH-E9', nameHe: 'אי-עמידה בדרישות אבטחת מידע מינימליות', nameEn: 'Failure to meet minimum cybersecurity requirements', isStandard: false },
    { code: 'SH-E10', nameHe: 'שימוש בתוכנה פיראטית', nameEn: 'Use of pirated/unlicensed software', isStandard: false },
  ],
};

const shlomoFidelityCrimePolicy: PolicySeed = {
  productCode: 'FIDELITY_CRIME',
  policyFormCode: 'SH-6070',
  bitStandard: 'BIT 2020',
  editionYear: 2020,
  structure: { chapters: ['Single chapter + extensions + Cyber Crime Endorsement'] },
  strengths: [
    'BIT 2020 edition with integrated Cyber Crime Endorsement',
    'Social engineering fraud coverage up to NIS 300K (unique — excluded in all other insurers)',
    'Invoice manipulation/CEO fraud coverage NIS 200K',
    'Broad employee definition — includes remote workers and contractors with system access',
  ],
  weaknesses: [
    'Newer insurer — limited fidelity claims history',
    'Cyber crime endorsement has separate aggregate sub-limit of NIS 500K',
    'Social engineering requires documented verification procedures as condition precedent',
  ],
  notableTerms: [
    'Discovery-based trigger with retroactive date',
    'First Israeli fidelity policy to include social engineering/CEO fraud coverage',
    'Cyber crime endorsement addresses modern digital fraud techniques',
  ],
  extensions: [
    { code: '4', nameHe: 'תקופת גילוי', nameEn: 'Discovery Period Extension', isStandard: true },
    // Shlomo-specific cyber crime extensions
    { code: 'SH-4.1', nameHe: 'הונאת הנדסה חברתית', nameEn: 'Social Engineering Fraud', isStandard: false, defaultLimit: 300000, limitNotes: 'Shlomo-specific: NIS 300K — covers losses from phishing/vishing/pretexting where employee was deceived' },
    { code: 'SH-4.2', nameHe: 'הונאת חשבוניות/CEO Fraud', nameEn: 'Invoice Manipulation / CEO Fraud', isStandard: false, defaultLimit: 200000, limitNotes: 'Shlomo-specific: NIS 200K — covers fraudulent payment redirection via email compromise' },
    { code: 'SH-4.3', nameHe: 'גניבת זהות דיגיטלית של עובד', nameEn: 'Employee Digital Identity Theft', isStandard: false, defaultLimit: 150000, limitNotes: 'Shlomo-specific: NIS 150K — covers losses from stolen credentials used by third parties' },
  ],
  exclusions: [
    { code: 'E1', nameHe: 'נזק שהתגלה לפני תחילת הפוליסה', nameEn: 'Pre-inception discovered damage', isStandard: true },
    { code: 'E2', nameHe: 'נזק לאחר גילוי (אותו עובד)', nameEn: 'Post-discovery damage (same employee)', isStandard: true },
    { code: 'E3', nameHe: 'נזק לפני תאריך רטרואקטיבי', nameEn: 'Pre-retroactive date damage', isStandard: true },
    { code: 'E4', nameHe: 'אבדן תוצאתי/עקיף', nameEn: 'Consequential/indirect loss', isStandard: true },
    { code: 'E5', nameHe: 'גרעיני', nameEn: 'Nuclear', isStandard: true },
    { code: 'E6', nameHe: 'מלחמה/טרור', nameEn: 'War/terrorism', isStandard: true },
    // Shlomo-specific
    { code: 'SH-E7', nameHe: 'הונאה חברתית ללא נוהל אימות מתועד', nameEn: 'Social engineering without documented verification procedure', isStandard: false },
    { code: 'SH-E8', nameHe: 'מתקפת סייבר ממדינה', nameEn: 'State-sponsored cyber crime', isStandard: false },
  ],
};

// ============================================================
// ASSEMBLE ALL SHLOMO POLICIES
// ============================================================

const detailedProductCodes = [
  'FIRE_CONSEQUENTIAL_LOSS',
  'ELECTRONIC_EQUIPMENT',
  'FIDELITY_CRIME',
];

const shlomoPolicies: PolicySeed[] = [
  shlomoFirePolicy,
  shlomoElectronicEquipmentPolicy,
  shlomoFidelityCrimePolicy,
  ...ALL_PRODUCT_CODES.filter((code) => !detailedProductCodes.includes(code)).map(generateBaseShlomoPolicy),
];

// ============================================================
// SEED FUNCTION
// ============================================================

export async function seedShlomoPolicies(prisma: PrismaClient) {
  console.log('\n--- Seeding Shlomo (שלמה) policies...');
  await seedInsurerPoliciesForCompany('SHLOMO', shlomoPolicies, false);
  console.log('--- Shlomo seed complete.');
}
