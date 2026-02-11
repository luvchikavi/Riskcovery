import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================
// INSURER POLICY COMPARISON SEED
// Seeds: 7 Israeli insurers + Clal master baseline policies
// ============================================================

// ============================================================
// 7 ISRAELI INSURERS
// ============================================================

const insurers = [
  {
    code: 'CLAL',
    nameHe: 'כלל ביטוח',
    nameEn: 'Clal Insurance',
    website: 'https://www.clal.co.il',
    phone: '*5765',
  },
  {
    code: 'PHOENIX',
    nameHe: 'הפניקס',
    nameEn: 'Phoenix Insurance',
    website: 'https://www.fnx.co.il',
    phone: '*3455',
  },
  {
    code: 'HAREL',
    nameHe: 'הראל ביטוח',
    nameEn: 'Harel Insurance',
    website: 'https://www.harel-group.co.il',
    phone: '*4700',
  },
  {
    code: 'MIGDAL',
    nameHe: 'מגדל ביטוח',
    nameEn: 'Migdal Insurance',
    website: 'https://www.migdal.co.il',
    phone: '*4867',
  },
  {
    code: 'AYALON',
    nameHe: 'איילון ביטוח',
    nameEn: 'Ayalon Insurance',
    website: 'https://www.ayalon-ins.co.il',
    phone: '*2244',
  },
  {
    code: 'MENORAH',
    nameHe: 'מנורה מבטחים',
    nameEn: 'Menorah Mivtachim',
    website: 'https://www.menoramivt.co.il',
    phone: '*6289',
  },
  {
    code: 'SHLOMO',
    nameHe: 'שלמה ביטוח',
    nameEn: 'Shlomo Insurance',
    website: 'https://www.shlomo-bit.co.il',
    phone: '*8088',
  },
];

// ============================================================
// CLAL MASTER BASELINE — Extensions per product
// (Copied from seed-insurance-products.ts — the BIT standard)
// ============================================================

interface ExtSeed {
  chapterCode?: string;
  code: string;
  nameHe: string;
  nameEn: string;
  description?: string;
  descriptionHe?: string;
  defaultLimit?: number;
  limitNotes?: string;
  isStandard?: boolean; // true = exists in BIT standard, false = insurer-specific
}

interface ExclSeed {
  chapterCode?: string;
  code: string;
  nameHe: string;
  nameEn: string;
  description?: string;
  descriptionHe?: string;
  isStandard?: boolean; // true = exists in BIT standard, false = insurer-specific
}

interface PolicySeed {
  productCode: string;
  policyFormCode?: string;
  bitStandard: string;
  editionYear: number;
  structure: Record<string, unknown>;
  strengths: string[];
  weaknesses: string[];
  notableTerms: string[];
  extensions: ExtSeed[];
  exclusions: ExclSeed[];
}

// ============================================================
// CLAL MASTER POLICIES (BIT Standard Reference)
// ============================================================

const clalMasterPolicies: PolicySeed[] = [
  {
    productCode: 'FIRE_CONSEQUENTIAL_LOSS',
    bitStandard: 'BIT 2019',
    editionYear: 2019,
    structure: { chapters: ['Part A - Property Insurance', 'Part B - Business Interruption'] },
    strengths: ['BIT standard reference — most comprehensive baseline', 'Full 21 Part-A extensions + 19 Part-B extensions'],
    weaknesses: [],
    notableTerms: ['This is the BIT 2019 standard form used as the market baseline'],
    extensions: [
      { chapterCode: 'A', code: '3.1', nameHe: 'פריצה/גניבה', nameEn: 'Break-in/Theft' },
      { chapterCode: 'A', code: '3.2', nameHe: 'רכוש מחוץ לחצרים', nameEn: 'Property Outside Premises' },
      { chapterCode: 'A', code: '3.3', nameHe: 'רכוש מחוץ לגבולות טריטוריאליים', nameEn: 'Property Outside Territorial Limits' },
      { chapterCode: 'A', code: '3.4', nameHe: 'רכוש בזמן בנייה', nameEn: 'Property During Construction' },
      { chapterCode: 'A', code: '3.5', nameHe: 'רכוש בהעברה', nameEn: 'Property in Transit' },
      { chapterCode: 'A', code: '3.6', nameHe: 'חפצים אישיים של עובדים', nameEn: 'Employee Personal Effects' },
      { chapterCode: 'A', code: '3.7', nameHe: 'רכוש שירותים ציבוריים', nameEn: 'Public Utility Property' },
      { chapterCode: 'A', code: '3.8', nameHe: 'תוספות לרכוש', nameEn: 'Additions to Property' },
      { chapterCode: 'A', code: '3.9', nameHe: 'נזק עקיף למלאי', nameEn: 'Incidental Inventory Damage' },
      { chapterCode: 'A', code: '3.10', nameHe: 'התפוצצות חומרים חמים', nameEn: 'Hot Material Rupture' },
      { chapterCode: 'A', code: '3.11', nameHe: 'הוצאות לאחר אירוע', nameEn: 'Post-Event Expenses' },
      { chapterCode: 'A', code: '3.12', nameHe: 'הוצאות הכנת תביעה', nameEn: 'Claim Preparation Costs' },
      { chapterCode: 'A', code: '3.13', nameHe: 'שכ"ד חלופי', nameEn: 'Alternative Rent' },
      { chapterCode: 'A', code: '3.14', nameHe: 'רכוש שהוצא משימוש', nameEn: 'Property Taken Out of Service' },
      { chapterCode: 'A', code: '3.15', nameHe: 'הגנת שם מסחרי', nameEn: 'Brand Name Protection' },
      { chapterCode: 'A', code: '3.16', nameHe: 'קריסת מדפים', nameEn: 'Shelving Collapse' },
      { chapterCode: 'A', code: '3.17', nameHe: 'שבר זכוכית', nameEn: 'Glass Breakage' },
      { chapterCode: 'A', code: '3.18', nameHe: 'נזק ללוח חשמל', nameEn: 'Electrical Panel Damage' },
      { chapterCode: 'A', code: '3.19', nameHe: 'קריסת מבנה', nameEn: 'Massive Building Collapse' },
      { chapterCode: 'A', code: '3.20', nameHe: 'השלמה לכל הסיכונים', nameEn: 'All-Risks Completion' },
      { chapterCode: 'A', code: '3.21', nameHe: 'השבת סכום ביטוח', nameEn: 'Sum Insured Reinstatement' },
      { chapterCode: 'B', code: '10.1', nameHe: 'הפרעה בשירותים ציבוריים', nameEn: 'Public Services Disruption' },
      { chapterCode: 'B', code: '10.2', nameHe: 'השפעה הדדית בין עסקים', nameEn: 'Mutual Business Influence' },
      { chapterCode: 'B', code: '10.3', nameHe: 'הפרעה בספקים/לקוחות', nameEn: 'Suppliers/Customers Disruption' },
      { chapterCode: 'B', code: '10.4', nameHe: 'מניעת גישה', nameEn: 'Denial of Access' },
      { chapterCode: 'B', code: '10.5', nameHe: 'רכוש שאינו בבעלות', nameEn: 'Property Not Owned' },
      { chapterCode: 'B', code: '10.6', nameHe: 'מכירה ממלאי', nameEn: 'Sale from Inventory' },
      { chapterCode: 'B', code: '10.7', nameHe: 'אבדן תוצאתי בנייה', nameEn: 'Construction BI' },
      { chapterCode: 'B', code: '10.8', nameHe: 'אבדן תוצאתי העברה', nameEn: 'Transit BI' },
      { chapterCode: 'B', code: '10.9', nameHe: 'אבדן תוצאתי קריסת מבנה', nameEn: 'Building Collapse BI' },
      { chapterCode: 'B', code: '10.10', nameHe: 'שיפורי ציוד', nameEn: 'Equipment Improvements' },
      { chapterCode: 'B', code: '10.11', nameHe: 'הוצאות משתנות', nameEn: 'Changed Expenses' },
      { chapterCode: 'B', code: '10.12', nameHe: 'הוצאות עמידה בתקנות', nameEn: 'Compliance Costs' },
      { chapterCode: 'B', code: '10.13', nameHe: 'קנסות חוזיים', nameEn: 'Contract Penalties' },
      { chapterCode: 'B', code: '10.14', nameHe: 'חובות בספרים פתוחים', nameEn: 'Open Book Debts' },
      { chapterCode: 'B', code: '10.15', nameHe: 'הוצאות שונות', nameEn: 'Miscellaneous Expenses' },
      { chapterCode: 'B', code: '10.16', nameHe: 'הוצאות הכנת תביעה', nameEn: 'Claim Preparation Costs' },
      { chapterCode: 'B', code: '10.17', nameHe: 'עלויות מו"פ', nameEn: 'R&D Costs' },
      { chapterCode: 'B', code: '10.18', nameHe: 'סכום נוסף', nameEn: 'Additional Sum' },
      { chapterCode: 'B', code: '10.19', nameHe: 'השבת סכום ביטוח', nameEn: 'Sum Reinstatement' },
    ],
    exclusions: [
      { code: 'E1', nameHe: 'אבדן תוצאתי (חלק א)', nameEn: 'Consequential loss (Part A)' },
      { code: 'E2', nameHe: 'נזק למתקן חשמלי', nameEn: 'Electrical installation damage' },
      { code: 'E3', nameHe: 'רכוש מבוטח ימי', nameEn: 'Marine-insured property' },
      { code: 'E4', nameHe: 'נזק בהוראת ממשלה', nameEn: 'Government-ordered damage' },
      { code: 'E5', nameHe: 'סיכונים גרעיניים', nameEn: 'Nuclear risks' },
      { code: 'E6', nameHe: 'מלחמה/טרור', nameEn: 'War/terrorism' },
      { code: 'E7', nameHe: 'רעידת אדמה (אלא אם נרכש)', nameEn: 'Earthquake (unless purchased)' },
      { code: 'E8', nameHe: 'זיהום (אלא אם מסיכון מבוטח)', nameEn: 'Pollution (unless from insured peril)' },
      { code: 'E9', nameHe: 'רשלנות חמורה', nameEn: 'Gross negligence' },
      { code: 'E10', nameHe: 'רכוש לא מוחשי/מידע', nameEn: 'Intangible property/data' },
    ],
  },
  {
    productCode: 'MECHANICAL_BREAKDOWN',
    bitStandard: 'BIT 2019',
    editionYear: 2019,
    structure: { chapters: ['Single chapter'] },
    strengths: ['BIT standard reference'],
    weaknesses: [],
    notableTerms: ['Complementary to Fire policy — excludes fire perils'],
    extensions: [
      { code: '3.1', nameHe: 'פיצוץ/נוזלים/פקיעת צנרת', nameEn: 'Explosion/Liquid/Burst Pipe Gap' },
      { code: '3.2', nameHe: 'נזק ללוח חשמל', nameEn: 'Electrical Panel Damage' },
      { code: '3.3', nameHe: 'הוצאות נוספות הכרחיות', nameEn: 'Additional Necessary Expenses' },
      { code: '3.4', nameHe: 'ביטוח יסודות', nameEn: 'Foundation Insurance' },
      { code: '3.5', nameHe: 'דליפת גז תאונתית', nameEn: 'Accidental Gas Leak' },
      { code: '3.6', nameHe: 'רכוש נוסף שנמצא בתיקון', nameEn: 'Additional Property Found in Repair' },
      { code: '3.7', nameHe: 'נזק לרכוש סמוך/מחובר', nameEn: 'Adjacent/Connected Property Damage' },
      { code: '3.8', nameHe: 'הוצאות התאמת ציוד', nameEn: 'Equipment Adaptation Expenses' },
      { code: '3.9', nameHe: 'חלקים שאינם זמינים', nameEn: 'Parts No Longer Available' },
      { code: '3.10', nameHe: 'תוספות לרכוש', nameEn: 'Property Additions' },
      { code: '3.11', nameHe: 'השבת סכום ביטוח', nameEn: 'Sum Insured Reinstatement' },
    ],
    exclusions: [
      { code: 'E1', nameHe: 'סיכוני פוליסת אש (משלים)', nameEn: 'Fire policy perils (complementary)' },
      { code: 'E2', nameHe: 'אבדן תוצאתי', nameEn: 'Consequential loss' },
      { code: 'E3', nameHe: 'עומס יתר/שימוש ניסיוני', nameEn: 'Overload/experimental use' },
      { code: 'E4', nameHe: 'אחריות יצרן/ספק', nameEn: 'Manufacturer/supplier warranty' },
      { code: 'E5', nameHe: 'פגמים קיימים', nameEn: 'Pre-existing defects' },
      { code: 'E6', nameHe: 'מתכלים/חלפים', nameEn: 'Consumables/spare parts' },
      { code: 'E7', nameHe: 'בלאי/קורוזיה/התדרדרות', nameEn: 'Wear/corrosion/deterioration' },
      { code: 'E8', nameHe: 'מלחמה/טרור', nameEn: 'War/terrorism' },
      { code: 'E9', nameHe: 'גניבה', nameEn: 'Theft' },
      { code: 'E10', nameHe: 'רשלנות חמורה', nameEn: 'Gross negligence' },
    ],
  },
  {
    productCode: 'THIRD_PARTY_LIABILITY',
    bitStandard: 'BIT 2019',
    editionYear: 2019,
    structure: { chapters: ['Single chapter + extensions'] },
    strengths: ['BIT standard reference'],
    weaknesses: [],
    notableTerms: ['Occurrence-based trigger'],
    extensions: [
      { code: '4.1', nameHe: 'שהות זמנית בחו"ל', nameEn: 'Temporary Stay Abroad' },
      { code: '4.2', nameHe: 'אחריות צולבת', nameEn: 'Cross Liability' },
      { code: '4.3', nameHe: 'רכוש עובדים', nameEn: 'Employee Property' },
      { code: '4.4', nameHe: 'פעילות קבלני משנה', nameEn: 'Subcontractor Activities' },
      { code: '4.5', nameHe: 'אחריות בנייה/שיפוץ', nameEn: 'Construction/Renovation Liability' },
      { code: '4.6', nameHe: 'אחריות אירועים', nameEn: 'Event Liability' },
      { code: '4.7', nameHe: 'נזק רכוש מכלי רכב', nameEn: 'Motor Vehicle Property Damage', defaultLimit: 2000000 },
      { code: '4.8', nameHe: 'פגיעה אישית', nameEn: 'Personal Injury', defaultLimit: 200000 },
      { code: '4.9', nameHe: 'מניעת גישה', nameEn: 'Prevention of Access' },
      { code: '4.10', nameHe: 'אחריות שילוחית', nameEn: 'Vicarious Liability' },
      { code: '4.11', nameHe: 'הרעלת מזון', nameEn: 'Food Poisoning' },
      { code: '4.12', nameHe: 'אחריות אישית של עובד', nameEn: 'Employee Personal Liability' },
      { code: '4.13', nameHe: 'ויתור על שיבוב', nameEn: 'Waiver of Subrogation' },
      { code: '4.14', nameHe: 'צד שלישי שהמבוטח התחייב', nameEn: 'Third Party Insured Obligated' },
      { code: '4.15', nameHe: 'כלי נשק', nameEn: 'Weapons' },
      { code: '4.16', nameHe: 'הגנה פלילית/מנהלית', nameEn: 'Criminal/Admin Defense' },
    ],
    exclusions: [
      { code: 'E1', nameHe: 'פגיעת עובד', nameEn: 'Employee injury' },
      { code: 'E2', nameHe: 'אחריות כלי רכב', nameEn: 'Motor vehicle liability' },
      { code: 'E3', nameHe: 'אחריות מוצר', nameEn: 'Product liability' },
      { code: 'E4', nameHe: 'אחריות מקצועית', nameEn: 'Professional liability' },
      { code: 'E5', nameHe: 'אחריות נושאי משרה', nameEn: 'D&O liability' },
      { code: 'E6', nameHe: 'זיהום (אלא אם פתאומי)', nameEn: 'Pollution (unless sudden/accidental)' },
      { code: 'E7', nameHe: 'רכוש בהחזקה', nameEn: 'Property in custody' },
      { code: 'E8', nameHe: 'אחריות חוזית', nameEn: 'Contractual liability' },
      { code: 'E9', nameHe: 'גרעיני/קרינה', nameEn: 'Nuclear/Radiation/EMF' },
      { code: 'E10', nameHe: 'מלחמה/טרור', nameEn: 'War/terrorism' },
      { code: 'E11', nameHe: 'פיצויים עונשיים', nameEn: 'Punitive damages' },
      { code: 'E12', nameHe: 'אסבסט', nameEn: 'Asbestos' },
      { code: 'E13', nameHe: 'רשלנות חמורה', nameEn: 'Gross negligence' },
      { code: 'E14', nameHe: 'נזק כספי טהור', nameEn: 'Pure financial loss' },
    ],
  },
  {
    productCode: 'EMPLOYERS_LIABILITY',
    bitStandard: 'BIT 2019',
    editionYear: 2019,
    structure: { chapters: ['Single chapter + extensions'] },
    strengths: ['BIT standard reference'],
    weaknesses: [],
    notableTerms: ['Occurrence-based trigger'],
    extensions: [
      { code: '4.1', nameHe: 'שהות זמנית בחו"ל', nameEn: 'Temporary Stay Abroad' },
      { code: '4.2', nameHe: 'עובדים בחוזים מיוחדים', nameEn: 'Special Contract Employees' },
      { code: '4.3', nameHe: 'פעילויות הקשורות לעבודה', nameEn: 'Work-Related Activities' },
      { code: '4.4', nameHe: 'אחריות אישית של עובד', nameEn: 'Employee Personal Liability' },
      { code: '4.5', nameHe: 'כלי נשק', nameEn: 'Weapons' },
      { code: '4.6', nameHe: 'קבלנים/קבלני משנה ועובדיהם', nameEn: 'Contractors/Subcontractors & Workers' },
      { code: '4.7', nameHe: 'עובדי שטחים מוחזקים', nameEn: 'Held Territories Employees' },
      { code: '4.8', nameHe: 'בעלי שליטה בשכר', nameEn: 'Controlling Shareholders on Payroll' },
      { code: '4.9', nameHe: 'צד שלישי שהתחייב לבטח', nameEn: 'Third Party Required to Be Insured' },
      { code: '4.10', nameHe: 'פגיעה אישית', nameEn: 'Personal Injury', defaultLimit: 200000 },
      { code: '4.11', nameHe: 'הגנה פלילית/מנהלית', nameEn: 'Criminal/Admin Defense' },
      { code: '4.12', nameHe: 'ויתור על שיבוב', nameEn: 'Waiver of Subrogation' },
    ],
    exclusions: [
      { code: 'E1', nameHe: 'אחריות חוזית', nameEn: 'Contractual liability' },
      { code: 'E2', nameHe: 'תביעות ביטוח לאומי', nameEn: 'National Insurance default claims' },
      { code: 'E3', nameHe: 'אסבסט/סיליקון/סיליקוזיס', nameEn: 'Asbestos/Silicone/Silicosis' },
      { code: 'E4', nameHe: 'מלחמה/טרור', nameEn: 'War/terrorism' },
      { code: 'E5', nameHe: 'גרעיני/קרינה', nameEn: 'Nuclear/Radiation/EMF' },
      { code: 'E6', nameHe: 'תאונות דרכים', nameEn: 'Motor vehicle road accidents' },
      { code: 'E7', nameHe: 'פיצויים עונשיים', nameEn: 'Punitive damages' },
      { code: 'E8', nameHe: 'רשלנות חמורה', nameEn: 'Gross negligence' },
    ],
  },
  {
    productCode: 'PRODUCT_LIABILITY',
    bitStandard: 'BIT 2019',
    editionYear: 2019,
    structure: { chapters: ['Single chapter + extensions'] },
    strengths: ['BIT standard reference'],
    weaknesses: [],
    notableTerms: ['Claims-made trigger'],
    extensions: [
      { code: '4.1', nameHe: 'הרחבת מפיצים', nameEn: 'Vendors Endorsement' },
      { code: '4.2', nameHe: 'תקופת גילוי', nameEn: 'Run-off/Discovery Period' },
      { code: '4.3', nameHe: 'אחריות צולבת', nameEn: 'Cross Liability' },
      { code: '4.4', nameHe: 'הגנה פלילית/מנהלית', nameEn: 'Criminal/Admin Defense' },
      { code: '4.5', nameHe: 'פגיעה אישית', nameEn: 'Personal Injury', defaultLimit: 200000 },
      { code: '4.6', nameHe: 'עבודות שבוצעו', nameEn: 'Work Performed by Insured (completed operations)' },
    ],
    exclusions: [
      { code: 'E1', nameHe: 'פגיעת עובד', nameEn: 'Employee injury' },
      { code: 'E2', nameHe: 'אחריות חוזית', nameEn: 'Contractual liability' },
      { code: 'E3', nameHe: 'ייצור בניגוד לחוק', nameEn: 'Manufacture contrary to law' },
      { code: 'E4', nameHe: 'מוצר פגום ביודעין', nameEn: 'Knowingly defective product' },
      { code: 'E5', nameHe: 'עלויות ריקול', nameEn: 'Product recall costs' },
      { code: 'E6', nameHe: 'נזק למוצר עצמו', nameEn: 'Damage to product itself' },
      { code: 'E7', nameHe: 'גרעיני/קרינה', nameEn: 'Nuclear/Radiation/EMF' },
      { code: 'E8', nameHe: 'מלחמה/טרור', nameEn: 'War/terrorism' },
      { code: 'E9', nameHe: 'אירועים לפני תאריך רטרואקטיבי', nameEn: 'Pre-retroactive date events' },
      { code: 'E10', nameHe: 'פיצויים עונשיים', nameEn: 'Punitive damages' },
      { code: 'E11', nameHe: 'אסבסט', nameEn: 'Asbestos' },
      { code: 'E12', nameHe: 'רשלנות חמורה', nameEn: 'Gross negligence' },
    ],
  },
  {
    productCode: 'CASH_MONEY',
    bitStandard: 'BIT 2019',
    editionYear: 2019,
    structure: { chapters: ['Single chapter + extensions'] },
    strengths: ['BIT standard reference'],
    weaknesses: [],
    notableTerms: ['All-risks trigger'],
    extensions: [
      { code: '3.1', nameHe: 'כספים בבית מנהלים', nameEn: 'Money at Managers\'/Staff Homes' },
      { code: '3.2', nameHe: 'כלי כתב רשומים בדואר/מונית/שליח', nameEn: 'Registered Instruments by Mail/Taxi/Courier' },
      { code: '3.3', nameHe: 'זיוף שיקים גנובים', nameEn: 'Forgery of Stolen Blank Checks', defaultLimit: 50000, limitNotes: '50,000 per event' },
      { code: '3.4', nameHe: 'נזק לכספת', nameEn: 'Damage to Safe' },
    ],
    exclusions: [
      { code: 'E1', nameHe: 'חוסר בלתי מוסבר', nameEn: 'Unexplained shortage' },
      { code: 'E2', nameHe: 'כספים ברכב ללא השגחה', nameEn: 'Money in unsupervised vehicles' },
      { code: 'E3', nameHe: 'אבדן תוצאתי', nameEn: 'Consequential loss' },
      { code: 'E4', nameHe: 'הונאת עובד (חוץ משליח)', nameEn: 'Employee fraud (except messenger)' },
      { code: 'E5', nameHe: 'גניבה שאינה פריצה/שוד', nameEn: 'Non-break-in/robbery theft' },
      { code: 'E6', nameHe: 'אמצעי תשלום אלקטרוניים', nameEn: 'Electronic payment instruments' },
      { code: 'E7', nameHe: 'מלחמה/טרור', nameEn: 'War/terrorism' },
      { code: 'E8', nameHe: 'רשלנות חמורה', nameEn: 'Gross negligence' },
    ],
  },
  {
    productCode: 'FIDELITY_CRIME',
    bitStandard: 'BIT 2019',
    editionYear: 2019,
    structure: { chapters: ['Single chapter + 1 extension'] },
    strengths: ['BIT standard reference'],
    weaknesses: [],
    notableTerms: ['Discovery-based trigger'],
    extensions: [
      { code: '4', nameHe: 'תקופת גילוי', nameEn: 'Discovery Period Extension' },
    ],
    exclusions: [
      { code: 'E1', nameHe: 'נזק שהתגלה לפני תחילת הפוליסה', nameEn: 'Pre-inception discovered damage' },
      { code: 'E2', nameHe: 'נזק לאחר גילוי (אותו עובד)', nameEn: 'Post-discovery damage (same employee)' },
      { code: 'E3', nameHe: 'נזק לפני תאריך רטרואקטיבי', nameEn: 'Pre-retroactive date damage' },
      { code: 'E4', nameHe: 'אבדן תוצאתי/עקיף', nameEn: 'Consequential/indirect loss' },
      { code: 'E5', nameHe: 'גרעיני', nameEn: 'Nuclear' },
      { code: 'E6', nameHe: 'מלחמה/טרור', nameEn: 'War/terrorism' },
    ],
  },
  {
    productCode: 'CARGO_IN_TRANSIT',
    bitStandard: 'BIT 2019',
    editionYear: 2019,
    structure: { chapters: ['Single chapter + extensions'] },
    strengths: ['BIT standard reference'],
    weaknesses: [],
    notableTerms: ['All-risks trigger'],
    extensions: [
      { code: '3.1', nameHe: 'אובדן יחידה שלמה', nameEn: 'Loss of Complete Unit' },
      { code: '3.2', nameHe: 'משלוחי יצוא/יבוא', nameEn: 'Export/Import Shipments' },
      { code: '3.3', nameHe: 'הגנת מותג/הצלה', nameEn: 'Brand Protection/Salvage' },
    ],
    exclusions: [
      { code: 'E1', nameHe: 'פגם טבוע/בלאי', nameEn: 'Inherent defect/wear' },
      { code: 'E2', nameHe: 'שבירת חרסינה/זכוכית', nameEn: 'Porcelain/glass breakage' },
      { code: 'E3', nameHe: 'דליפת מכולה', nameEn: 'Container leakage' },
      { code: 'E4', nameHe: 'אבדן תוצאתי', nameEn: 'Consequential loss' },
      { code: 'E5', nameHe: 'גניבה שאינה פריצה/שוד', nameEn: 'Non-break-in/robbery theft' },
      { code: 'E6', nameHe: 'רכב לא כשיר לדרך', nameEn: 'Unroadworthy vehicle' },
      { code: 'E7', nameHe: 'הונאת עובד', nameEn: 'Employee fraud' },
      { code: 'E8', nameHe: 'מלחמה/טרור', nameEn: 'War/terrorism' },
      { code: 'E9', nameHe: 'חפיפת ביטוח ימי', nameEn: 'Marine insurance overlap' },
      { code: 'E10', nameHe: 'רשלנות חמורה', nameEn: 'Gross negligence' },
      { code: 'E11', nameHe: 'חניה ללא השגחה ללילה', nameEn: 'Overnight unattended parking' },
    ],
  },
  {
    productCode: 'TERRORISM',
    bitStandard: 'BIT 2013',
    editionYear: 2013,
    structure: { chapters: ['Chapter 1 - Property', 'Chapter 2 - Business Interruption'] },
    strengths: ['BIT standard reference'],
    weaknesses: [],
    notableTerms: ['Top-up above Property Tax Fund', 'Older BIT 2013 standard'],
    extensions: [],
    exclusions: [
      { code: 'E1', nameHe: 'מלחמה/מלחמת אזרחים', nameEn: 'War/civil war' },
      { code: 'E2', nameHe: 'נשק ביולוגי/כימי', nameEn: 'Biological/chemical weapons' },
      { code: 'E3', nameHe: 'פריצה/גניבה (לא מיידית)', nameEn: 'Break-in/theft (non-immediate)' },
      { code: 'E4', nameHe: 'מתקנים צבאיים/ביטחוניים', nameEn: 'Military installations' },
      { code: 'E5', nameHe: 'גרעיני', nameEn: 'Nuclear' },
      { code: 'E6', nameHe: 'אירועים מחוץ לגבולות', nameEn: 'Events outside geographic limits' },
    ],
  },
  {
    productCode: 'ELECTRONIC_EQUIPMENT',
    bitStandard: 'BIT 2019',
    editionYear: 2019,
    structure: { chapters: ['Ch1 - Property', 'Ch2 - Data & Software', 'Ch3 - Additional Expenses', 'Ch4 - Business Interruption'] },
    strengths: ['BIT standard reference', '4-chapter structure with comprehensive coverage'],
    weaknesses: [],
    notableTerms: ['All-risks trigger', 'Can be residual to Fire policy'],
    extensions: [
      { chapterCode: '1', code: '4.1', nameHe: 'תקלת מערכת מיזוג', nameEn: 'AC System Failure' },
      { chapterCode: '1', code: '4.2', nameHe: 'הוצאות פינוי הריסות', nameEn: 'Debris Removal Costs' },
      { chapterCode: '1', code: '4.3', nameHe: 'הוצאות נוספות הכרחיות', nameEn: 'Necessary Additional Expenses', defaultLimit: 400000 },
      { chapterCode: '1', code: '4.4', nameHe: 'נזק נוסף במהלך תיקון', nameEn: 'Additional Damage During Repair' },
      { chapterCode: '1', code: '4.5', nameHe: 'נזק לרכוש סמוך', nameEn: 'Damage to Adjacent Property', defaultLimit: 60000 },
      { chapterCode: '1', code: '4.6', nameHe: 'הוצאות התאמת ציוד', nameEn: 'Equipment Adaptation Expenses', defaultLimit: 160000 },
      { chapterCode: '1', code: '4.7', nameHe: 'חלקים מיושנים', nameEn: 'Obsolete Parts', defaultLimit: 160000 },
      { chapterCode: '1', code: '4.8', nameHe: 'תוספות לרכוש מבוטח', nameEn: 'Additions to Insured Property' },
      { chapterCode: '1', code: '4.9', nameHe: 'הוצאות התאמת תוכנה', nameEn: 'Software Adaptation Expenses', defaultLimit: 80000 },
      { chapterCode: '1', code: '4.10', nameHe: 'השבת סכום ביטוח', nameEn: 'Sum Insured Reinstatement' },
      { chapterCode: '4', code: '18.1', nameHe: 'השפעה בין-עסקית', nameEn: 'Inter-Business Impact' },
      { chapterCode: '4', code: '18.2', nameHe: 'שיפורי ציוד', nameEn: 'Equipment Improvements' },
      { chapterCode: '4', code: '18.3', nameHe: 'פיצוי הפרת חוזה', nameEn: 'Breach of Contract Compensation' },
      { chapterCode: '4', code: '18.4', nameHe: 'חובות בספרים', nameEn: 'Outstanding Debts (Book Debts)' },
      { chapterCode: '4', code: '18.5', nameHe: 'הוצאות הכנת תביעה', nameEn: 'Claim Preparation Costs' },
      { chapterCode: '4', code: '18.6', nameHe: 'השבת סכום ביטוח', nameEn: 'Sum Insured Reinstatement' },
    ],
    exclusions: [
      { code: 'E1', nameHe: 'חריג שיורי (חפיפת אש)', nameEn: 'Residual policy exclusion (Fire overlap)' },
      { code: 'E2', nameHe: 'פגמים קיימים', nameEn: 'Pre-existing defects' },
      { code: 'E3', nameHe: 'בלאי/קורוזיה', nameEn: 'Wear/tear/corrosion' },
      { code: 'E4', nameHe: 'תיקון פגמים תפעוליים', nameEn: 'Repair of operational defects' },
      { code: 'E5', nameHe: 'אחריות יצרן', nameEn: 'Manufacturer warranty liability' },
      { code: 'E6', nameHe: 'גניבה פשוטה (לא פריצה)', nameEn: 'Simple theft (not burglary)' },
      { code: 'E7', nameHe: 'מתכלים/חומרים מתחלפים', nameEn: 'Consumables/replaceable materials' },
      { code: 'E8', nameHe: 'תוכנה ללא רישיון', nameEn: 'Unlicensed software' },
      { code: 'E9', nameHe: 'ללא משטר גיבוי', nameEn: 'No backup regime' },
      { code: 'E10', nameHe: 'גרעיני', nameEn: 'Nuclear' },
      { code: 'E11', nameHe: 'מלחמה/טרור', nameEn: 'War/terrorism' },
      { code: 'E12', nameHe: 'רשלנות חמורה', nameEn: 'Gross negligence' },
    ],
  },
  {
    productCode: 'HEAVY_ENGINEERING_EQUIPMENT',
    bitStandard: 'BIT 2016',
    editionYear: 2016,
    structure: { chapters: ['Single chapter + extensions'] },
    strengths: ['BIT standard reference'],
    weaknesses: [],
    notableTerms: ['All-risks trigger', 'BIT 2016 (older standard)'],
    extensions: [
      { code: '3.1', nameHe: 'גניבה, פריצה ושוד', nameEn: 'Theft, Burglary & Robbery', defaultLimit: 20000 },
      { code: '3.2', nameHe: 'הוצאות חילוץ, גרירה והעברה', nameEn: 'Salvage, Towing & Transport', defaultLimit: 20000 },
      { code: '3.3', nameHe: 'השבה לקדמות', nameEn: 'Reinstatement of Sum Insured' },
      { code: '3.4', nameHe: 'הוצאות נוספות הכרחיות', nameEn: 'Additional Necessary Expenses' },
    ],
    exclusions: [
      { code: 'E1', nameHe: 'אבדן תוצאתי/עקיף', nameEn: 'Consequential/indirect loss' },
      { code: 'E2', nameHe: 'מלחמה/טרור', nameEn: 'War/terrorism' },
      { code: 'E3', nameHe: 'עומס יתר/שימוש ניסיוני', nameEn: 'Overload/experimental use' },
      { code: 'E4', nameHe: 'גניבה/פריצה (אלא אם הרחבה 3.1)', nameEn: 'Theft/burglary (unless ext 3.1)' },
      { code: 'E5', nameHe: 'בלאי רגיל/קורוזיה', nameEn: 'Normal wear/corrosion' },
      { code: 'E6', nameHe: 'נזק צמיגים (סוליה <60%)', nameEn: 'Tire damage (tread <60%)' },
      { code: 'E7', nameHe: 'נזק ממקור מים', nameEn: 'Water source damage' },
      { code: 'E8', nameHe: 'נזק בחו"ל', nameEn: 'Overseas damage' },
      { code: 'E9', nameHe: 'מפעיל ללא רישיון', nameEn: 'Unauthorized operator' },
      { code: 'E10', nameHe: 'רשלנות חמורה', nameEn: 'Gross negligence' },
    ],
  },
  {
    productCode: 'CONTRACTOR_WORKS_CAR',
    bitStandard: 'BIT 2019',
    editionYear: 2019,
    structure: { chapters: ['Ch A - Property', 'Ch B - Third Party Liability', 'Ch C - Employers Liability'] },
    strengths: ['BIT standard reference', '3-chapter combined coverage'],
    weaknesses: [],
    notableTerms: ['All-risks trigger', 'Bundles Property + TPL + EL'],
    extensions: [
      { chapterCode: 'A', code: '3.1', nameHe: 'גניבה/פריצה', nameEn: 'Theft/Burglary' },
      { chapterCode: 'A', code: '3.2', nameHe: 'רכוש בעבודה', nameEn: 'Property Being Worked Upon' },
      { chapterCode: 'A', code: '3.3', nameHe: 'רכוש סמוך/קרוב', nameEn: 'Adjacent/Nearby Property' },
      { chapterCode: 'A', code: '3.4', nameHe: 'רכוש בהעברה', nameEn: 'Property in Transit' },
      { chapterCode: 'A', code: '3.5', nameHe: 'מבנים נלווים וציוד קל', nameEn: 'Auxiliary Buildings & Light Equipment', defaultLimit: 40000 },
      { chapterCode: 'A', code: '3.6.1', nameHe: 'הוצאות פינוי הריסות', nameEn: 'Debris Removal Costs' },
      { chapterCode: 'A', code: '3.6.2', nameHe: 'שכר אדריכלים/מומחים', nameEn: 'Architects\'/Professionals\' Fees' },
      { chapterCode: 'A', code: '3.6.3', nameHe: 'שינויים נדרשי רשות', nameEn: 'Authority-Required Modifications' },
      { chapterCode: 'A', code: '3.6.4', nameHe: 'הוצאות נוספות הכרחיות', nameEn: 'Necessary Additional Expenses' },
      { chapterCode: 'A', code: '3.7', nameHe: 'השבת סכום ביטוח', nameEn: 'Reinstatement of Sum Insured' },
      { chapterCode: 'B', code: '7.1', nameHe: 'אחריות צולבת', nameEn: 'Cross Liability' },
      { chapterCode: 'B', code: '7.2', nameHe: 'פריטים תת-קרקעיים/תשתיות', nameEn: 'Underground Items/Utilities Liability' },
      { chapterCode: 'B', code: '7.3', nameHe: 'רעידות/החלשת תמיכה', nameEn: 'Vibration/Support Weakening', defaultLimit: 4000000 },
      { chapterCode: 'B', code: '7.4', nameHe: 'נזק רכוש מכלי רכב באתר', nameEn: 'Motor Vehicle Property Damage on Site', defaultLimit: 2000000 },
      { chapterCode: 'B', code: '7.5', nameHe: 'נזקי גוף מציוד כבד', nameEn: 'Bodily Injury from Heavy Equipment' },
      { chapterCode: 'B', code: '7.6', nameHe: 'אחריות כלי נשק', nameEn: 'Weapons Liability' },
      { chapterCode: 'B', code: '7.7', nameHe: 'שהות זמנית בחו"ל', nameEn: 'Temporary Stay Abroad' },
      { chapterCode: 'C', code: '11.1', nameHe: 'שהות זמנית בחו"ל', nameEn: 'Temporary Stay Abroad' },
      { chapterCode: 'C', code: '11.2', nameHe: 'עובדי חוזים מיוחדים', nameEn: 'Special Contract Workers' },
      { chapterCode: 'C', code: '11.3', nameHe: 'פעילויות קשורות לעבודה', nameEn: 'Work-Related Activities' },
      { chapterCode: 'C', code: '11.4', nameHe: 'אחריות אישית של עובד', nameEn: 'Individual Worker\'s Liability' },
      { chapterCode: 'C', code: '11.5', nameHe: 'כלי נשק', nameEn: 'Weapons' },
      { chapterCode: 'C', code: '11.6', nameHe: 'אחריות לקבלנים/קב"מ ועובדיהם', nameEn: 'Liability to Contractors/Subcontractors & Workers' },
      { chapterCode: 'C', code: '11.7', nameHe: 'עובדי שטחים מוחזקים', nameEn: 'Workers from Held Territories' },
      { chapterCode: 'C', code: '11.8', nameHe: 'אחריות לבעלי שליטה', nameEn: 'Liability to Controlling Persons' },
      { chapterCode: 'C', code: '11.9', nameHe: 'צד שלישי שהתחייב לבטח', nameEn: 'Third Party Insured Obligated' },
    ],
    exclusions: [
      { code: 'E1', nameHe: 'תכנון/חומרים/עבודה פגומים', nameEn: 'Faulty design/materials/workmanship' },
      { code: 'E2', nameHe: 'בלאי', nameEn: 'Wear/tear' },
      { code: 'E3', nameHe: 'חוסר בלתי מוסבר', nameEn: 'Unexplained shortage' },
      { code: 'E4', nameHe: 'אחריות כלי רכב', nameEn: 'Motor vehicle liability' },
      { code: 'E5', nameHe: 'פריטים תת-קרקעיים', nameEn: 'Underground items' },
      { code: 'E6', nameHe: 'רעידות/החלשת תמיכה', nameEn: 'Vibration/support weakening' },
      { code: 'E7', nameHe: 'מלחמה/טרור', nameEn: 'War/terrorism' },
      { code: 'E8', nameHe: 'גרעיני', nameEn: 'Nuclear' },
      { code: 'E9', nameHe: 'הפסקת עבודה > 90 יום', nameEn: 'Work stoppage > 90 days' },
      { code: 'E10', nameHe: 'מפעילי מנוף ללא רישיון', nameEn: 'Unlicensed crane operators' },
      { code: 'E11', nameHe: 'רשלנות חמורה', nameEn: 'Gross negligence' },
    ],
  },
];

// ============================================================
// PHOENIX (פניקס) POLICIES — Pisga Edition
// All 12 policy types extracted from Phoenix PDFs
// ============================================================

const phoenixPolicies: PolicySeed[] = [
  // 1. FIRE & CONSEQUENTIAL LOSS — Pisga 2018, Form 300203141
  {
    productCode: 'FIRE_CONSEQUENTIAL_LOSS',
    policyFormCode: '300203141',
    bitStandard: 'Pisga 2018',
    editionYear: 2018,
    structure: { chapters: ['Part A - Property Insurance', 'Part B - Business Interruption'] },
    strengths: [
      'Earthquake extension included (BIT standard compliant)',
      'Natural disaster extension available',
      'Comprehensive 21+19 extension structure matching BIT',
    ],
    weaknesses: [
      'Break-in/Theft (3.1) requires extra premium — free in Clal BIT 2019',
    ],
    notableTerms: [
      'Pisga 2018 edition — Phoenix premium product line',
      'Earthquake defined as 72-hour continuous period from first tremor',
    ],
    extensions: [
      { chapterCode: 'A', code: '3.1', nameHe: 'פריצה/גניבה', nameEn: 'Break-in/Theft', isStandard: true, limitNotes: 'Requires extra premium (free in BIT)' },
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
      { code: 'E4', nameHe: 'נזק בהוראת ממשלה', nameEn: 'Government-ordered damage', isStandard: true },
      { code: 'E5', nameHe: 'סיכונים גרעיניים', nameEn: 'Nuclear risks', isStandard: true },
      { code: 'E6', nameHe: 'מלחמה/טרור', nameEn: 'War/terrorism', isStandard: true },
      { code: 'E7', nameHe: 'רעידת אדמה (אלא אם נרכש)', nameEn: 'Earthquake (unless purchased)', isStandard: true },
      { code: 'E8', nameHe: 'זיהום (אלא אם מסיכון מבוטח)', nameEn: 'Pollution (unless from insured peril)', isStandard: true },
      { code: 'E9', nameHe: 'רשלנות חמורה', nameEn: 'Gross negligence', isStandard: true },
      { code: 'E10', nameHe: 'רכוש לא מוחשי/מידע', nameEn: 'Intangible property/data', isStandard: true },
    ],
  },

  // 2. THIRD PARTY LIABILITY — Pisga 5/2017, Form 300203060
  {
    productCode: 'THIRD_PARTY_LIABILITY',
    policyFormCode: '300203060',
    bitStandard: 'Pisga 5/2017',
    editionYear: 2017,
    structure: { chapters: ['Single chapter + extensions'] },
    strengths: [
      'Weapons coverage (ext 4.15) — unique provision for licensed firearms liability',
      'Criminal/Admin defense at NIS 200K/event, 400K aggregate',
      'Motor vehicle property damage extension with NIS 1M/2M cap',
      'Prevention of access extension — up to 25% of liability limit',
    ],
    weaknesses: [
      'Older edition (2017) vs Clal BIT 2019',
    ],
    notableTerms: [
      'Occurrence-based trigger',
      'Personal Injury extension includes autonomy of will, defamation, false arrest, invasion of privacy',
      'Waiver of subrogation explicitly allows pre-arranged written waiver',
    ],
    extensions: [
      { code: '4.1', nameHe: 'שהות זמנית בחו"ל', nameEn: 'Temporary Stay Abroad', isStandard: true },
      { code: '4.2', nameHe: 'אחריות צולבת', nameEn: 'Cross Liability', isStandard: true },
      { code: '4.3', nameHe: 'רכוש עובדים', nameEn: 'Employee Property', isStandard: true },
      { code: '4.4', nameHe: 'פעילות קבלני משנה', nameEn: 'Subcontractor Activities', isStandard: true },
      { code: '4.5', nameHe: 'אחריות בנייה/שיפוץ', nameEn: 'Construction/Renovation Liability', isStandard: true },
      { code: '4.6', nameHe: 'אחריות אירועים', nameEn: 'Event Liability', isStandard: true },
      { code: '4.7', nameHe: 'נזק רכוש מכלי רכב', nameEn: 'Motor Vehicle Property Damage', isStandard: true, defaultLimit: 2000000, limitNotes: 'NIS 1M per event, NIS 2M aggregate' },
      { code: '4.8', nameHe: 'פגיעה אישית', nameEn: 'Personal Injury', isStandard: true, defaultLimit: 200000, limitNotes: 'NIS 200K per event and for the insurance period' },
      { code: '4.9', nameHe: 'מניעת גישה', nameEn: 'Prevention of Access', isStandard: true, limitNotes: '25% of liability limit per event' },
      { code: '4.10', nameHe: 'אחריות שילוחית', nameEn: 'Vicarious Liability', isStandard: true },
      { code: '4.11', nameHe: 'הרעלת מזון', nameEn: 'Food Poisoning', isStandard: true },
      { code: '4.12', nameHe: 'אחריות אישית של עובד', nameEn: 'Employee Personal Liability', isStandard: true },
      { code: '4.13', nameHe: 'ויתור על שיבוב', nameEn: 'Waiver of Subrogation', isStandard: true },
      { code: '4.14', nameHe: 'צד שלישי שהמבוטח התחייב', nameEn: 'Third Party Insured Obligated', isStandard: true },
      { code: '4.15', nameHe: 'כלי נשק', nameEn: 'Weapons', isStandard: true },
      { code: '4.16', nameHe: 'הגנה פלילית/מנהלית', nameEn: 'Criminal/Admin Defense', isStandard: true, defaultLimit: 200000, limitNotes: 'NIS 200K/event, NIS 400K aggregate' },
    ],
    exclusions: [
      { code: 'E1', nameHe: 'פגיעת עובד', nameEn: 'Employee injury', isStandard: true },
      { code: 'E2', nameHe: 'אחריות כלי רכב', nameEn: 'Motor vehicle liability', isStandard: true },
      { code: 'E3', nameHe: 'אחריות מוצר/מקצועית/נושאי משרה', nameEn: 'Product/Professional/D&O liability', isStandard: true },
      { code: 'E4', nameHe: 'זיהום (אלא אם פתאומי)', nameEn: 'Pollution (unless sudden/accidental)', isStandard: true },
      { code: 'E5', nameHe: 'רכוש בהחזקה', nameEn: 'Property in custody/care', isStandard: true },
      { code: 'E6', nameHe: 'אחריות חוזית', nameEn: 'Contractual liability', isStandard: true },
      { code: 'E7', nameHe: 'סיכונים גרעיניים', nameEn: 'Nuclear risks', isStandard: true },
      { code: 'E8', nameHe: 'קרינה ושדות אלקטרומגנטיים', nameEn: 'Radiation and EMF', isStandard: true },
      { code: 'E9', nameHe: 'מלחמה/טרור', nameEn: 'War/terrorism', isStandard: true },
      { code: 'E10', nameHe: 'פיצויים עונשיים', nameEn: 'Punitive damages', isStandard: true },
      { code: 'E11', nameHe: 'אסבסט', nameEn: 'Asbestos', isStandard: true },
      { code: 'E12', nameHe: 'רשלנות חמורה', nameEn: 'Gross negligence', isStandard: true },
      { code: 'E13', nameHe: 'נזק כספי טהור', nameEn: 'Pure financial loss', isStandard: true },
    ],
  },

  // 3. EMPLOYERS LIABILITY — Pisga 4/2017, Form 300203059
  {
    productCode: 'EMPLOYERS_LIABILITY',
    policyFormCode: '300203059',
    bitStandard: 'Pisga 4/2017',
    editionYear: 2017,
    structure: { chapters: ['Single chapter + extensions'] },
    strengths: [
      'Weapons extension — covers licensed firearms on site',
      'Residents of administered territories extension — practical for Israeli employers',
      'Controlling person coverage — for shareholders insured committed to indemnify',
      'Criminal/Admin defense NIS 200K/event, NIS 400K aggregate',
      'Comprehensive PI definition including autonomy of will, mental anguish',
    ],
    weaknesses: [
      'Older edition (2017) vs Clal BIT 2019',
    ],
    notableTerms: [
      'Occurrence-based trigger',
      'Contractor/subcontractor extension does NOT substitute their own EL insurance',
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
      { code: '4.9', nameHe: 'פגיעה אישית', nameEn: 'Personal Injury', isStandard: true, defaultLimit: 200000, limitNotes: 'NIS 200K per event and for the insurance period' },
      { code: '4.10', nameHe: 'צד שלישי שהתחייב לבטח', nameEn: 'Third Party Required to Be Insured', isStandard: true },
      { code: '4.11', nameHe: 'הגנה פלילית/מנהלית', nameEn: 'Criminal/Admin Defense', isStandard: true, defaultLimit: 200000, limitNotes: 'NIS 200K/event, NIS 400K aggregate' },
      { code: '4.12', nameHe: 'ויתור על שיבוב', nameEn: 'Waiver of Subrogation', isStandard: true },
    ],
    exclusions: [
      { code: 'E1', nameHe: 'אחריות חוזית', nameEn: 'Contractual liability', isStandard: true },
      { code: 'E2', nameHe: 'תביעות ביטוח לאומי', nameEn: 'National Insurance default claims', isStandard: true },
      { code: 'E3', nameHe: 'מבוטח לא חב בדמי ביטוח לאומי', nameEn: 'Not obligated to pay NII premiums', isStandard: false },
      { code: 'E4', nameHe: 'אסבסט', nameEn: 'Asbestos', isStandard: true },
      { code: 'E5', nameHe: 'סיליקוזיס', nameEn: 'Silicosis/Asbestosis', isStandard: true },
      { code: 'E6', nameHe: 'מלחמה/טרור', nameEn: 'War/terrorism', isStandard: true },
      { code: 'E7', nameHe: 'סיכונים גרעיניים', nameEn: 'Nuclear risks', isStandard: true },
      { code: 'E8', nameHe: 'קרינה ושדות אלקטרומגנטיים', nameEn: 'Radiation and EMF', isStandard: true },
      { code: 'E9', nameHe: 'תאונות דרכים', nameEn: 'Motor vehicle road accidents', isStandard: true },
      { code: 'E10', nameHe: 'פיצויים עונשיים', nameEn: 'Punitive damages', isStandard: true },
      { code: 'E11', nameHe: 'רשלנות חמורה', nameEn: 'Gross negligence', isStandard: true },
    ],
  },

  // 4. PRODUCT LIABILITY — Pisga 6/2018, Form 300203062
  {
    productCode: 'PRODUCT_LIABILITY',
    policyFormCode: '300203062',
    bitStandard: 'Pisga 6/2018',
    editionYear: 2018,
    structure: { chapters: ['Single chapter + extensions'] },
    strengths: [
      'Built-in 12-month discovery period (free — many insurers charge separately)',
      'Retroactive date carries forward across renewals',
      'Vendors Endorsement with formal mechanism for named distributors',
      'Criminal/Admin defense NIS 200K/claim, NIS 400K aggregate',
    ],
    weaknesses: [
      'More exclusions (19) than Clal baseline (12)',
      'BSE, genetic engineering, and silicone exclusions — more granular',
      'Prior knowledge exclusion includes insurance carrier knowledge — stricter',
    ],
    notableTerms: [
      'Claims-made trigger with retroactive date',
      'Completed operations sub-limit NIS 200K',
      'Duty of care obligation is a coverage condition, not just recommendation',
    ],
    extensions: [
      { code: '4.1', nameHe: 'תקופת גילוי 12 חודשים', nameEn: 'Discovery Period (12 months)', isStandard: true, limitNotes: 'Automatic if no replacement policy purchased' },
      { code: '4.2', nameHe: 'אחריות צולבת', nameEn: 'Cross Liability', isStandard: true },
      { code: '4.3', nameHe: 'הגנה פלילית/מנהלית', nameEn: 'Criminal/Admin Defense', isStandard: true, defaultLimit: 200000, limitNotes: 'NIS 200K/claim, NIS 400K aggregate' },
      { code: '4.4', nameHe: 'הרחב מפיצים (Vendors)', nameEn: 'Vendors Endorsement', isStandard: true, limitNotes: 'At additional premium, per schedule' },
      { code: '4.5', nameHe: 'עבודות שנמסרו', nameEn: 'Completed Operations', isStandard: true, defaultLimit: 200000, limitNotes: 'NIS 200K per claim and aggregate' },
    ],
    exclusions: [
      { code: 'E1', nameHe: 'פגיעת עובד', nameEn: 'Employee injury', isStandard: true },
      { code: 'E2', nameHe: 'אחריות חוזית', nameEn: 'Contractual liability', isStandard: true },
      { code: 'E3', nameHe: 'ייצור בניגוד לחוק', nameEn: 'Manufacture contrary to law', isStandard: true },
      { code: 'E4', nameHe: 'מוצר פגום ביודעין', nameEn: 'Knowingly defective product', isStandard: true },
      { code: 'E5', nameHe: 'אי-התאמת מוצר לייעוד', nameEn: 'Product not suitable for intended use', isStandard: false },
      { code: 'E6', nameHe: 'עלויות ריקול/החלפה/נזק עצמי', nameEn: 'Recall/replacement/damage to product itself', isStandard: true },
      { code: 'E7', nameHe: 'רכוש בבעלות המבוטח', nameEn: 'Insured-owned property', isStandard: false },
      { code: 'E8', nameHe: 'סיכונים גרעיניים', nameEn: 'Nuclear risks', isStandard: true },
      { code: 'E9', nameHe: 'קרינה ושדות אלקטרומגנטיים', nameEn: 'Radiation and EMF', isStandard: true },
      { code: 'E10', nameHe: 'מלחמה/טרור', nameEn: 'War/terrorism', isStandard: true },
      { code: 'E11', nameHe: 'ידיעה מוקדמת', nameEn: 'Prior knowledge', isStandard: true },
      { code: 'E12', nameHe: 'נזק לפני תאריך רטרואקטיבי', nameEn: 'Pre-retroactive date damage', isStandard: true },
      { code: 'E13', nameHe: 'פיצויים עונשיים', nameEn: 'Punitive damages', isStandard: true },
      { code: 'E14', nameHe: 'זיהום (אלא אם פתאומי)', nameEn: 'Pollution (unless sudden)', isStandard: true },
      { code: 'E15', nameHe: 'אסבסט', nameEn: 'Asbestos', isStandard: true },
      { code: 'E16', nameHe: 'כלי טיס וחלקיהם', nameEn: 'Aircraft and parts', isStandard: false },
      { code: 'E17', nameHe: 'BSE/הנדסה גנטית/גוף אדם', nameEn: 'BSE/Genetic engineering/Human body products', isStandard: false },
      { code: 'E18', nameHe: 'נזק כספי טהור', nameEn: 'Pure financial loss', isStandard: true },
      { code: 'E19', nameHe: 'מוצרים המכילים סיליקון', nameEn: 'Silicone-containing products', isStandard: false },
    ],
  },

  // 5. CASH/MONEY — Pisga 12/2018, Form 300203057
  {
    productCode: 'CASH_MONEY',
    policyFormCode: '300203057',
    bitStandard: 'Pisga 12/2018',
    editionYear: 2018,
    structure: { chapters: ['Single chapter + extensions'] },
    strengths: [
      'Managers residence extension included free (often paid in BIT)',
      'Crossed instruments via mail/courier built-in',
      'Forgery extension NIS 50K — bridges gap with fidelity policy',
      'Safe damage extension available as add-on',
    ],
    weaknesses: [],
    notableTerms: [
      'All-risks trigger',
      'Employee fraud exclusion clearly carved out for fidelity policy',
    ],
    extensions: [
      { code: '3.1', nameHe: 'כספים בבית מנהלים/פקידים', nameEn: 'Cash at Managers/Officers Homes', isStandard: true, limitNotes: '20% of transit sum, max NIS 50K' },
      { code: '3.2', nameHe: 'ממסרים משורטטים בדואר/מונית/שליח', nameEn: 'Crossed Instruments by Mail/Taxi/Courier', isStandard: true },
      { code: '3.3', nameHe: 'זיוף המחאות', nameEn: 'Forgery of Stolen Checks', isStandard: true, defaultLimit: 50000, limitNotes: 'NIS 50K per event and per policy period' },
      { code: '3.4', nameHe: 'נזק לכספת', nameEn: 'Damage to Safe', isStandard: true, limitNotes: 'At additional premium, per schedule' },
    ],
    exclusions: [
      { code: 'E1', nameHe: 'חוסר בלתי מוסבר', nameEn: 'Unexplained shortage', isStandard: true },
      { code: 'E2', nameHe: 'כספים ברכב ללא השגחה', nameEn: 'Cash in unattended vehicle', isStandard: true },
      { code: 'E3', nameHe: 'אבדן תוצאתי', nameEn: 'Consequential loss', isStandard: true },
      { code: 'E4', nameHe: 'הונאת/מעילת עובד', nameEn: 'Employee fraud/embezzlement', isStandard: true },
      { code: 'E5', nameHe: 'בלאי/חרקים/התדרדרות', nameEn: 'Wear and tear/vermin/deterioration', isStandard: false },
      { code: 'E6', nameHe: 'סיכונים גרעיניים', nameEn: 'Nuclear risks', isStandard: true },
      { code: 'E7', nameHe: 'מלחמה/טרור', nameEn: 'War/terrorism', isStandard: true },
      { code: 'E8', nameHe: 'גניבה שאינה פריצה/שוד', nameEn: 'Non-break-in/robbery theft', isStandard: true },
      { code: 'E9', nameHe: 'אמצעי תשלום אלקטרוניים', nameEn: 'Electronic payment instruments', isStandard: true },
      { code: 'E10', nameHe: 'זיוף המחאות/מסמכים סחירים', nameEn: 'Forgery of checks/negotiable documents', isStandard: true },
    ],
  },

  // 6. FIDELITY/CRIME — Pisga 12/2018, Form 300203055
  {
    productCode: 'FIDELITY_CRIME',
    policyFormCode: '300203055',
    bitStandard: 'Pisga 12/2018',
    editionYear: 2018,
    structure: { chapters: ['Single chapter + 1 extension'] },
    strengths: [
      'Broad employee definition — includes directors and anyone performing work',
      'Compact exclusion list (7 only)',
      'No standalone prior knowledge exclusion — handled by retroactive date',
      'Merger/consolidation clause for M&A certainty',
    ],
    weaknesses: [],
    notableTerms: [
      'Discovery-based trigger with retroactive date',
      'Loss discovered within 12 months of employee departure',
    ],
    extensions: [
      { code: '4', nameHe: 'תקופת גילוי', nameEn: 'Discovery Period Extension', isStandard: true },
    ],
    exclusions: [
      { code: 'E1', nameHe: 'פיטורין/עזיבת עובד >12 חודשים', nameEn: 'Employee departure >12 months undiscovered', isStandard: true },
      { code: 'E2', nameHe: 'נזק שהתגלה לפני תחילת הפוליסה', nameEn: 'Pre-inception discovered loss', isStandard: true },
      { code: 'E3', nameHe: 'אבדן תוצאתי', nameEn: 'Consequential loss', isStandard: true },
      { code: 'E4', nameHe: 'נזק לאחר גילוי אי-יושר', nameEn: 'Post-discovery damage', isStandard: true },
      { code: 'E5', nameHe: 'נזק לפני תאריך רטרואקטיבי', nameEn: 'Pre-retroactive date damage', isStandard: true },
      { code: 'E6', nameHe: 'סיכונים גרעיניים', nameEn: 'Nuclear risks', isStandard: true },
      { code: 'E7', nameHe: 'מלחמה/טרור', nameEn: 'War/terrorism', isStandard: true },
    ],
  },

  // 7. CARGO IN TRANSIT — Pisga 11/2018, Form 300203056
  {
    productCode: 'CARGO_IN_TRANSIT',
    policyFormCode: '300203056',
    bitStandard: 'Pisga 11/2018',
    editionYear: 2018,
    structure: { chapters: ['Single chapter + extensions'] },
    strengths: [
      'Export FOB/CIF extension built-in free — bridges marine/inland gap',
      'Import shipments extension built-in free',
      'Complete packaging treated as insured property',
      'Total loss naming convention — insurer bears identification costs',
      'Knowledge definition favors insured (only direct manager, not dispatchers)',
    ],
    weaknesses: [
      'More exclusions (11) than Clal baseline (11) — similar scope',
    ],
    notableTerms: [
      'All-risks trigger',
      'Burglary definition includes theft of entire vehicle with cargo',
    ],
    extensions: [
      { code: '3.1', nameHe: 'אריזה שלמה', nameEn: 'Complete Packaging', isStandard: true },
      { code: '3.2', nameHe: 'משלוחי יצוא FOB/CIF', nameEn: 'Export Shipments FOB/CIF', isStandard: true },
      { code: '3.3', nameHe: 'משלוחי יבוא', nameEn: 'Import Shipments', isStandard: true },
      { code: '3.4', nameHe: 'אובדן מוחלט/זיהוי מותג', nameEn: 'Total Loss / Brand Identification', isStandard: true },
    ],
    exclusions: [
      { code: 'E1', nameHe: 'חומרים מסוכנים/מתפוצצים', nameEn: 'Hazardous/explosive materials', isStandard: false },
      { code: 'E2', nameHe: 'בלאי/התדרדרות הדרגתית', nameEn: 'Wear and tear/gradual deterioration', isStandard: true },
      { code: 'E3', nameHe: 'שבר חרסינה/זכוכית/קרמיקה', nameEn: 'Porcelain/glass/ceramics breakage', isStandard: true },
      { code: 'E4', nameHe: 'אחריות כלשהי (מלבד רכוש)', nameEn: 'Any liability except property damage', isStandard: false },
      { code: 'E5', nameHe: 'רכב/נהג לא כשירים', nameEn: 'Unfit vehicle/unlicensed driver/DUI', isStandard: true },
      { code: 'E6', nameHe: 'גניבה שאינה פריצה/שוד', nameEn: 'Non-break-in/robbery theft', isStandard: true },
      { code: 'E7', nameHe: 'הונאת/מעילת עובד/קבלן', nameEn: 'Employee/contractor fraud', isStandard: true },
      { code: 'E8', nameHe: 'מלחמה/טרור', nameEn: 'War/terrorism', isStandard: true },
      { code: 'E9', nameHe: 'נטישת רכוש', nameEn: 'Property abandonment', isStandard: false },
      { code: 'E10', nameHe: 'סיכונים גרעיניים', nameEn: 'Nuclear risks', isStandard: true },
      { code: 'E11', nameHe: 'חפיפת ביטוח ימי/מידע אלקטרוני', nameEn: 'Marine insurance overlap / electronic data', isStandard: true },
    ],
  },

  // 8. TERRORISM — Pisga 6/2019, Form 300203050
  {
    productCode: 'TERRORISM',
    policyFormCode: '300203050',
    bitStandard: 'Pisga 6/2019',
    editionYear: 2019,
    structure: { chapters: ['Section 1 - Property', 'Section 2 - Business Interruption'] },
    strengths: [
      'Bio/Chemical agents dispersed in terror attack — physical damage IS covered',
      'Two-section structure covers both property and BI',
      'Broad terror definition — includes unknown perpetrators',
      'Index-linked sums and deductibles (CPI protection)',
      'No exclusion for civil commotion related to terror',
    ],
    weaknesses: [
      'Off-premises property, reinstatement, and transit extensions from underlying policy do NOT apply',
      'BI section: Public services/suppliers/customers extensions from underlying policy excluded',
    ],
    notableTerms: [
      'Excess over Property Tax Fund (מס רכוש) layer',
      '3-year limitation period',
      'Nuclear/radiological excluded (standard)',
    ],
    extensions: [],
    exclusions: [
      { code: 'E1', nameHe: 'מלחמה/מלחמת אזרחים/תפיסת שלטון', nameEn: 'War/civil war/seizure of power', isStandard: true },
      { code: 'E2', nameHe: 'חומר ביולוגי/כימי (פיזי מכוסה)', nameEn: 'Bio/chemical material (physical damage covered)', isStandard: true },
      { code: 'E3', nameHe: 'מחוץ לגבול גיאוגרפי', nameEn: 'Outside geographic limit', isStandard: true },
      { code: 'E4', nameHe: 'מתקנים צבאיים/ביטחוניים', nameEn: 'Military/security installations', isStandard: true },
      { code: 'E5', nameHe: 'רכוש לא כלול בפוליסת אש/ציוד', nameEn: 'Property not in underlying fire/EE policy', isStandard: false },
      { code: 'E6', nameHe: 'הרחבות רכוש מחוץ/השבה/העברה', nameEn: 'Off-premises/reinstatement/transit extensions excluded', isStandard: false },
      { code: 'E7', nameHe: 'אבדן תוצאתי (מלבד פרק 2)', nameEn: 'Consequential loss (except Section 2)', isStandard: true },
      { code: 'E8', nameHe: 'ביטוח ימי', nameEn: 'Marine insurance', isStandard: true },
    ],
  },

  // 9. ELECTRONIC EQUIPMENT — Pisga 11/2018, Form 300203051
  {
    productCode: 'ELECTRONIC_EQUIPMENT',
    policyFormCode: '300203051',
    bitStandard: 'Pisga 11/2018',
    editionYear: 2018,
    structure: { chapters: ['Ch1 - Property', 'Ch2 - Data & Software', 'Ch3 - Additional Expenses', 'Ch4 - Business Interruption'] },
    strengths: [
      'Comprehensive 4-chapter structure (Property + Data + OpEx + BI)',
      'Optional comprehensive software cover for non-physical data losses',
      'Equipment matching NIS 160K built-in',
      'Obsolete parts NIS 160K built-in',
      'Breach of contract penalties extension',
      'Book debts extension',
    ],
    weaknesses: [
      'Simple theft excluded with no extension option',
    ],
    notableTerms: [
      'All-risks trigger',
      'Can be residual to Fire policy (excludes fire perils)',
      'Software cover includes virus, electromagnetic interference, power issues',
    ],
    extensions: [
      { chapterCode: '1', code: '4.1', nameHe: 'תקלת מערכת מיזוג', nameEn: 'AC System Failure', isStandard: true },
      { chapterCode: '1', code: '4.2', nameHe: 'הוצאות פינוי הריסות', nameEn: 'Debris Removal Costs', isStandard: true },
      { chapterCode: '1', code: '4.3', nameHe: 'הוצאות נוספות הכרחיות', nameEn: 'Necessary Additional Expenses', isStandard: true, defaultLimit: 400000, limitNotes: '20% of benefits or NIS 400K, lower of two' },
      { chapterCode: '1', code: '4.4', nameHe: 'נזק נוסף במהלך תיקון', nameEn: 'Additional Damage During Repair', isStandard: true },
      { chapterCode: '1', code: '4.5', nameHe: 'נזק לרכוש סמוך', nameEn: 'Damage to Adjacent Property', isStandard: true, defaultLimit: 60000, limitNotes: 'NIS 60K first loss' },
      { chapterCode: '1', code: '4.6', nameHe: 'הוצאות התאמת ציוד', nameEn: 'Equipment Adaptation Expenses', isStandard: true, defaultLimit: 160000, limitNotes: 'NIS 160K first loss' },
      { chapterCode: '1', code: '4.7', nameHe: 'חלקים מיושנים', nameEn: 'Obsolete Parts', isStandard: true, defaultLimit: 160000, limitNotes: 'NIS 160K first loss' },
      { chapterCode: '1', code: '4.8', nameHe: 'הוצאות התאמת תוכנה', nameEn: 'Software Adaptation Expenses', isStandard: true, defaultLimit: 80000, limitNotes: 'NIS 80K first loss' },
      { chapterCode: '1', code: '4.9', nameHe: 'השבת סכום ביטוח', nameEn: 'Sum Insured Reinstatement', isStandard: true, limitNotes: 'At additional premium' },
      { chapterCode: '1', code: '4.10', nameHe: 'תוספות לרכוש מבוטח', nameEn: 'Additions to Insured Property', isStandard: true, limitNotes: '4-10% of sum, max NIS 500K' },
      { chapterCode: '1', code: '4.11', nameHe: 'רעידת אדמה', nameEn: 'Earthquake', isStandard: true, limitNotes: 'At additional premium, separate deductible' },
      { chapterCode: '1', code: '4.12', nameHe: 'נזקי טבע', nameEn: 'Natural Perils (storm/flood)', isStandard: true, limitNotes: 'At additional premium' },
      { chapterCode: '4', code: '18.1', nameHe: 'פיצוי הפרת חוזה', nameEn: 'Breach of Contract Compensation', isStandard: true, limitNotes: 'First loss' },
      { chapterCode: '4', code: '18.2', nameHe: 'חובות בספרים', nameEn: 'Outstanding Debts (Book Debts)', isStandard: true, limitNotes: 'First loss' },
      { chapterCode: '4', code: '18.3', nameHe: 'שיפורי ציוד', nameEn: 'Equipment Improvements', isStandard: true },
      { chapterCode: '4', code: '18.4', nameHe: 'השבת סכום ביטוח', nameEn: 'Sum Insured Reinstatement', isStandard: true },
    ],
    exclusions: [
      { code: 'E1', nameHe: 'חריג שיורי (חפיפת אש)', nameEn: 'Residual policy exclusion (Fire overlap)', isStandard: true },
      { code: 'E2', nameHe: 'פגמים קיימים', nameEn: 'Pre-existing defects', isStandard: true },
      { code: 'E3', nameHe: 'בלאי סביר', nameEn: 'Reasonable wear and tear', isStandard: true },
      { code: 'E4', nameHe: 'ליקויים תפעוליים', nameEn: 'Operational defects', isStandard: true },
      { code: 'E5', nameHe: 'אחזקה שוטפת', nameEn: 'Routine maintenance', isStandard: false },
      { code: 'E6', nameHe: 'אחריות יצרן/ספק/מתקן', nameEn: 'Manufacturer/supplier/installer warranty', isStandard: true },
      { code: 'E7', nameHe: 'ציוד בכלי טיס/שיט', nameEn: 'Property on aircraft/watercraft', isStandard: false },
      { code: 'E8', nameHe: 'אבדן תוצאתי', nameEn: 'Consequential damage', isStandard: true },
      { code: 'E9', nameHe: 'מתכלים/חלקי חילוף', nameEn: 'Consumables/spare parts', isStandard: true },
      { code: 'E10', nameHe: 'פגמים אסטטיים', nameEn: 'Aesthetic defects', isStandard: false },
      { code: 'E11', nameHe: 'גניבה פשוטה', nameEn: 'Simple theft (not burglary)', isStandard: true },
      { code: 'E12', nameHe: 'מלחמה/טרור', nameEn: 'War/terrorism', isStandard: true },
      { code: 'E13', nameHe: 'סיכונים גרעיניים', nameEn: 'Nuclear risks', isStandard: true },
      { code: 'E14', nameHe: 'רכוש לא מוחשי (מלבד פרק 2)', nameEn: 'Intangible property (except Ch2)', isStandard: true },
      { code: 'E15', nameHe: 'מחוץ לגבול גיאוגרפי', nameEn: 'Outside geographic boundary', isStandard: true },
    ],
  },

  // 10. MECHANICAL BREAKDOWN — Pisga 6/2019, Form 300203160
  {
    productCode: 'MECHANICAL_BREAKDOWN',
    policyFormCode: '300203160',
    bitStandard: 'Pisga 6/2019',
    editionYear: 2019,
    structure: { chapters: ['Single chapter + extensions'] },
    strengths: [
      'Very high matching/adaptation limits (NIS 1M or 15% of benefits)',
      'Adjacent property damage up to NIS 1M',
      'Refrigerant gas and operating materials extension',
      'Departmental BI calculation available',
      'Consolidated full/partial indemnity period for BI',
    ],
    weaknesses: [
      'More exclusions (15) than Clal baseline (10)',
      'Internal damage threshold — only 60% or less of original value covered',
    ],
    notableTerms: [
      'Complementary to Fire policy — excludes fire perils',
      '60% threshold for internal mechanical/electrical breakdown',
      'Income deferral mechanism for BI',
    ],
    extensions: [
      { code: '3.1', nameHe: 'התפוצצות/נוזלים/פקיעת צנרת', nameEn: 'Explosion/Liquid/Burst Pipe Gap', isStandard: true },
      { code: '3.2', nameHe: 'נזק לחוטי חשמל/לוח חשמל', nameEn: 'Electrical Wiring/Panel Damage', isStandard: true, defaultLimit: 200000, limitNotes: '5% of sum insured or NIS 200K, lower' },
      { code: '3.3', nameHe: 'הוצאות נוספות הכרחיות', nameEn: 'Necessary Additional Expenses', isStandard: true, defaultLimit: 400000, limitNotes: '20% of benefits or NIS 400K, lower' },
      { code: '3.4', nameHe: 'ביטוח יסודות', nameEn: 'Foundation Insurance', isStandard: true },
      { code: '3.5', nameHe: 'דליפת גז קירור תאונתית', nameEn: 'Accidental Refrigerant Gas Leak', isStandard: true },
      { code: '3.6', nameHe: 'נזק נוסף שנמצא בתיקון', nameEn: 'Additional Damage Found in Repair', isStandard: true },
      { code: '3.7', nameHe: 'נזק לרכוש סמוך/מחובר', nameEn: 'Adjacent/Connected Property Damage', isStandard: true, defaultLimit: 1000000, limitNotes: 'NIS 1M or 5% of sum insured, lower' },
      { code: '3.8', nameHe: 'הוצאות התאמת ציוד', nameEn: 'Equipment Adaptation Expenses', isStandard: true, defaultLimit: 1000000, limitNotes: 'NIS 1M or 15% of benefits, lower' },
      { code: '3.9', nameHe: 'חלקים מיושנים', nameEn: 'Obsolete Parts', isStandard: true, defaultLimit: 40000, limitNotes: 'NIS 40K or 5% of benefits, lower' },
      { code: '3.10', nameHe: 'תוספות לרכוש מבוטח', nameEn: 'Property Additions', isStandard: true, limitNotes: '4-10% of sum, max NIS 500K' },
      { code: '3.11', nameHe: 'השבת סכום ביטוח', nameEn: 'Sum Insured Reinstatement', isStandard: true },
      { code: '3.12', nameHe: 'חלוקה מחלקתית (BI)', nameEn: 'Departmental Allocation (BI)', isStandard: false },
      { code: '3.13', nameHe: 'דחיית הכנסות (BI)', nameEn: 'Income Deferral (BI)', isStandard: false },
    ],
    exclusions: [
      { code: 'E1', nameHe: 'סיכוני פוליסת אש (משלים)', nameEn: 'Fire policy perils (complementary)', isStandard: true },
      { code: 'E2', nameHe: 'אבדן תוצאתי', nameEn: 'Consequential loss', isStandard: true },
      { code: 'E3', nameHe: 'עומס יתר', nameEn: 'Overloading/excess strain', isStandard: true },
      { code: 'E4', nameHe: 'אחריות יצרן/ספק/מתקן', nameEn: 'Manufacturer/supplier/installer warranty', isStandard: true },
      { code: 'E5', nameHe: 'פגמים קיימים', nameEn: 'Pre-existing defects', isStandard: true },
      { code: 'E6', nameHe: 'מתכלים/חלפים', nameEn: 'Consumables/spare parts', isStandard: true },
      { code: 'E7', nameHe: 'בלאי/שימוש רגיל', nameEn: 'Wear/normal use', isStandard: true },
      { code: 'E8', nameHe: 'נזקים פנימיים (>60% של ערך)', nameEn: 'Internal damage (>60% of value)', isStandard: false },
      { code: 'E9', nameHe: 'נזק לצמיג', nameEn: 'Tire damage', isStandard: false },
      { code: 'E10', nameHe: 'נזק ממקור מים', nameEn: 'Water source damage', isStandard: false },
      { code: 'E11', nameHe: 'מחוץ לגבול גיאוגרפי', nameEn: 'Outside geographic boundary', isStandard: true },
      { code: 'E12', nameHe: 'נטישה', nameEn: 'Property abandonment', isStandard: false },
      { code: 'E13', nameHe: 'המשך פעולה אחרי נזק', nameEn: 'Continued operation after damage', isStandard: false },
      { code: 'E14', nameHe: 'מפעיל לא מוסמך', nameEn: 'Unauthorized operator', isStandard: true },
      { code: 'E15', nameHe: 'רכוש לא מוחשי', nameEn: 'Intangible property (data/software)', isStandard: true },
    ],
  },

  // 11. HEAVY/ENGINEERING EQUIPMENT — Pisga 7/2019, Form 300203052
  {
    productCode: 'HEAVY_ENGINEERING_EQUIPMENT',
    policyFormCode: '300203052',
    bitStandard: 'Pisga 7/2019',
    editionYear: 2019,
    structure: { chapters: ['Single chapter + extensions'] },
    strengths: [
      'Dedicated theft/burglary/robbery extension with detailed sub-categories',
      'Towing and salvage NIS 20K per event built-in',
      'Broad all-risks insuring clause',
      'Equipment matching up to NIS 1M (vs NIS 160K in electronic equipment)',
      'Adjacent property damage up to NIS 1M',
    ],
    weaknesses: [
      'More exclusions (16) than Clal baseline (10)',
      'Internal damage threshold — only 60% or less covered',
      'No built-in BI chapter (unlike electronic equipment)',
    ],
    notableTerms: [
      'All-risks trigger',
      'Requisitioned property exclusion — relevant for Israeli military context',
      '60% threshold for internal mechanical/electrical damage',
    ],
    extensions: [
      { code: '3.1', nameHe: 'הוצאות חילוץ, גרירה והעברה', nameEn: 'Towing, Salvage & Transport', isStandard: true, defaultLimit: 20000, limitNotes: 'NIS 20K per event, first loss' },
      { code: '3.2', nameHe: 'הוצאות נוספות הכרחיות', nameEn: 'Necessary Additional Expenses', isStandard: true, limitNotes: '20% of benefits, first loss' },
      { code: '3.3', nameHe: 'השבת סכום ביטוח', nameEn: 'Reinstatement of Sum Insured', isStandard: true },
      { code: '3.4', nameHe: 'גניבה, פריצה ושוד', nameEn: 'Theft, Burglary & Robbery', isStandard: true, limitNotes: 'At additional premium, per schedule with security conditions' },
      { code: '3.5', nameHe: 'הוצאות נוספות הכרחיות (משופר)', nameEn: 'Enhanced Necessary Expenses', isStandard: false, limitNotes: 'At additional premium, 20% of benefits' },
      { code: '3.6', nameHe: 'נזק נוסף שנמצא בתיקון', nameEn: 'Additional Damage Found in Repair', isStandard: true },
      { code: '3.7', nameHe: 'נזק לרכוש סמוך', nameEn: 'Damage to Adjacent Property', isStandard: false, defaultLimit: 1000000, limitNotes: 'NIS 1M or 5% of sum insured, lower; first loss' },
      { code: '3.8', nameHe: 'הוצאות התאמת ציוד', nameEn: 'Equipment Adaptation Expenses', isStandard: false, defaultLimit: 1000000, limitNotes: 'NIS 1M or 15% of benefits, lower; first loss' },
      { code: '3.9', nameHe: 'חלקים מיושנים', nameEn: 'Obsolete Parts', isStandard: false, defaultLimit: 40000, limitNotes: 'NIS 40K or 5% of benefits, lower; first loss' },
    ],
    exclusions: [
      { code: 'E1', nameHe: 'אבדן תוצאתי', nameEn: 'Consequential loss', isStandard: true },
      { code: 'E2', nameHe: 'מלחמה/טרור', nameEn: 'War/terrorism', isStandard: true },
      { code: 'E3', nameHe: 'סיכונים גרעיניים', nameEn: 'Nuclear risks', isStandard: true },
      { code: 'E4', nameHe: 'עומס יתר', nameEn: 'Overloading/excess strain', isStandard: true },
      { code: 'E5', nameHe: 'גניבה/פריצה/שוד (אלא אם הרחבה)', nameEn: 'Theft/burglary (unless extension 3.4)', isStandard: true },
      { code: 'E6', nameHe: 'בלאי/שימוש רגיל', nameEn: 'Normal wear/use', isStandard: true },
      { code: 'E7', nameHe: 'נזקים פנימיים (>60% של ערך)', nameEn: 'Internal damage (>60% of value)', isStandard: false },
      { code: 'E8', nameHe: 'נזק לצמיג', nameEn: 'Tire damage', isStandard: true },
      { code: 'E9', nameHe: 'נזק ממקור מים', nameEn: 'Water source damage', isStandard: true },
      { code: 'E10', nameHe: 'מחוץ לגבול גיאוגרפי', nameEn: 'Outside geographic boundary', isStandard: true },
      { code: 'E11', nameHe: 'רכוש מגויס', nameEn: 'Requisitioned/commandeered property', isStandard: false },
      { code: 'E12', nameHe: 'נטישה', nameEn: 'Property abandonment', isStandard: false },
      { code: 'E13', nameHe: 'המשך פעולה אחרי נזק', nameEn: 'Continued operation after damage', isStandard: false },
      { code: 'E14', nameHe: 'מפעיל לא מוסמך', nameEn: 'Unauthorized operator', isStandard: true },
      { code: 'E15', nameHe: 'רכוש לא מוחשי', nameEn: 'Intangible property (data/software)', isStandard: false },
      { code: 'E16', nameHe: 'פגמים קיימים', nameEn: 'Pre-existing defects', isStandard: true },
    ],
  },

  // 12. CONTRACTOR WORKS (CAR) — Pisga 4/2018, Form 300203049
  {
    productCode: 'CONTRACTOR_WORKS_CAR',
    policyFormCode: '300203049',
    bitStandard: 'Pisga 4/2018',
    editionYear: 2018,
    structure: { chapters: ['Ch A - Property', 'Ch B - Third Party Liability', 'Ch C - Employers Liability'] },
    strengths: [
      '3-section integrated structure (Property + TPL + EL) eliminates coverage gaps',
      'Theft/burglary with guarding clause — covers even when no workers on site',
      'Motor vehicle property damage on site NIS 1M/event, NIS 2M aggregate',
      'Vibration & weakening of support extension available (critical for urban construction)',
      'Automatic reinstatement of sum insured after claim',
      'Earthquake coverage included as named peril',
      'Extended maintenance/defects period coverage',
      'EL extension for any person insured contractually committed to cover',
    ],
    weaknesses: [
      'Vibration extension deductible is high: 5-20% of Section B limit or NIS 4M',
    ],
    notableTerms: [
      'All-risks trigger',
      'Earthquake defined as 72-hour continuous period',
      'Work stoppage >90 days excluded',
      'Unlicensed crane operator excluded',
    ],
    extensions: [
      { chapterCode: 'A', code: '3.1', nameHe: 'רכוש אישי עובדים', nameEn: 'Workers Personal Property on Site', isStandard: true },
      { chapterCode: 'A', code: '3.2', nameHe: 'רכוש סמוך', nameEn: 'Adjacent Property', isStandard: true },
      { chapterCode: 'A', code: '3.3', nameHe: 'מבני עזר וציוד קל', nameEn: 'Auxiliary Buildings & Light Equipment', isStandard: true, defaultLimit: 40000, limitNotes: 'Max NIS 40K per single item' },
      { chapterCode: 'A', code: '3.4.1', nameHe: 'הוצאות פינוי הריסות', nameEn: 'Debris Removal Costs', isStandard: true },
      { chapterCode: 'A', code: '3.4.2', nameHe: 'שכר אדריכלים/מומחים', nameEn: 'Architects/Professionals Fees', isStandard: true },
      { chapterCode: 'A', code: '3.4.3', nameHe: 'שינויים נדרשי רשות', nameEn: 'Authority-Required Modifications', isStandard: true },
      { chapterCode: 'A', code: '3.4.4', nameHe: 'הוצאות נוספות הכרחיות', nameEn: 'Necessary Additional Expenses', isStandard: true },
      { chapterCode: 'A', code: '3.5', nameHe: 'גניבה/פריצה', nameEn: 'Theft/Burglary', isStandard: true, limitNotes: 'Insured must maintain guard at all times' },
      { chapterCode: 'A', code: '3.6', nameHe: 'רכוש בהעברה', nameEn: 'Property in Transit', isStandard: true },
      { chapterCode: 'A', code: '3.7', nameHe: 'השבת סכום ביטוח', nameEn: 'Reinstatement of Sum Insured', isStandard: true },
      { chapterCode: 'B', code: '4.1', nameHe: 'אחריות צולבת', nameEn: 'Cross Liability', isStandard: true },
      { chapterCode: 'B', code: '4.2', nameHe: 'נזק תת-קרקעי (צנרת/כבלים)', nameEn: 'Underground Damage (pipes/cables)', isStandard: true },
      { chapterCode: 'B', code: '4.3', nameHe: 'נזק רכוש מכלי רכב באתר', nameEn: 'Motor Vehicle Property Damage on Site', isStandard: true, defaultLimit: 2000000, limitNotes: 'NIS 1M/event, NIS 2M aggregate' },
      { chapterCode: 'B', code: '4.4', nameHe: 'כלי נשק', nameEn: 'Weapons Liability', isStandard: true },
      { chapterCode: 'B', code: '4.5', nameHe: 'נזק מחוץ לגבול גיאוגרפי', nameEn: 'Damage Outside Geographic Limit', isStandard: false, limitNotes: 'Excludes bodily injury/death' },
      { chapterCode: 'B', code: '5.1', nameHe: 'נזקי גוף מציוד כבד (צמ"ה)', nameEn: 'Bodily Injury from Heavy Equipment', isStandard: true, limitNotes: 'At additional premium' },
      { chapterCode: 'B', code: '5.2', nameHe: 'רעידות/החלשת משען', nameEn: 'Vibration/Support Weakening', isStandard: true, defaultLimit: 4000000, limitNotes: '5-20% of Section B limit or NIS 4M, at additional premium' },
      { chapterCode: 'C', code: '4.1C', nameHe: 'שהות מחוץ לגבול גיאוגרפי', nameEn: 'Stay Outside Geographic Limit', isStandard: true },
      { chapterCode: 'C', code: '4.2C', nameHe: 'חבות בגין שכר', nameEn: 'Salary/Wages Liability', isStandard: true },
      { chapterCode: 'C', code: '4.3C', nameHe: 'עובד בכל עת בשירות', nameEn: 'Workers at All Times in Service', isStandard: true },
      { chapterCode: 'C', code: '4.4C', nameHe: 'אחריות אישית עובד', nameEn: 'Worker Personal Liability', isStandard: true },
      { chapterCode: 'C', code: '4.5C', nameHe: 'כלי נשק', nameEn: 'Weapons (EL)', isStandard: true },
      { chapterCode: 'C', code: '4.6C', nameHe: 'עובדי קבלנים/קב"מ', nameEn: 'Subcontractors Workers', isStandard: true },
      { chapterCode: 'C', code: '4.7C', nameHe: 'עובדי שטחים מוחזקים', nameEn: 'Held Territories Workers', isStandard: true },
      { chapterCode: 'C', code: '4.8C', nameHe: 'בעלי שליטה במבוטח', nameEn: 'Controlling Persons Liability', isStandard: true },
      { chapterCode: 'C', code: '4.9C', nameHe: 'צד שלישי שהתחייב בכתב', nameEn: 'Contractually Obligated Third Party', isStandard: true },
    ],
    exclusions: [
      { code: 'E1', nameHe: 'מלחמה/טרור/מרד/מהפכה', nameEn: 'War/terrorism/rebellion/revolution', isStandard: true },
      { code: 'E2', nameHe: 'גרעיני/קרינה', nameEn: 'Nuclear/radiation', isStandard: true },
      { code: 'E3', nameHe: 'הפסקת עבודה >90 יום', nameEn: 'Work stoppage >90 days', isStandard: true },
      { code: 'E4', nameHe: 'מחוץ לגבול גיאוגרפי', nameEn: 'Outside geographic limit', isStandard: true },
      { code: 'E5', nameHe: 'מנוף/הרמה ללא רישיון', nameEn: 'Unlicensed crane/lifting operator', isStandard: true },
      { code: 'E6', nameHe: 'אבדן תוצאתי/קנסות/איחור', nameEn: 'Consequential loss/fines/delay penalties', isStandard: true },
      { code: 'E7', nameHe: 'תכנון/חומרים/עבודה פגומים', nameEn: 'Faulty design/materials/workmanship', isStandard: true },
      { code: 'E8', nameHe: 'בלאי/פחת/קורוזיה', nameEn: 'Wear/depreciation/corrosion', isStandard: true },
      { code: 'E9', nameHe: 'שבר מכני/קלקול חשמלי', nameEn: 'Mechanical breakdown (unless commissioning)', isStandard: true },
      { code: 'E10', nameHe: 'חוסר בלתי מוסבר', nameEn: 'Unexplained shortage', isStandard: true },
      { code: 'E11', nameHe: 'גניבה/פריצה ללא עובדים (מלבד הרחבה)', nameEn: 'Theft when no workers (unless ext 3.5)', isStandard: true },
      { code: 'E12', nameHe: 'אחריות כלי רכב (פוליסת חובה)', nameEn: 'Motor vehicle liability (compulsory)', isStandard: true },
      { code: 'E13', nameHe: 'תשתיות תת-קרקעיות (מלבד הרחבה)', nameEn: 'Underground utilities (unless ext)', isStandard: true },
      { code: 'E14', nameHe: 'רעידות/החלשת תמיכה (מלבד הרחבה)', nameEn: 'Vibration/support (unless ext)', isStandard: true },
      { code: 'E15', nameHe: 'זיהום (אלא אם פתאומי)', nameEn: 'Pollution (unless sudden)', isStandard: true },
      { code: 'E16', nameHe: 'אסבסט/סיליקוזיס', nameEn: 'Asbestos/Silicosis', isStandard: true },
      { code: 'E17', nameHe: 'פיצויים עונשיים', nameEn: 'Punitive damages', isStandard: true },
      { code: 'E18', nameHe: 'אחריות חוזית (EL)', nameEn: 'Contractual liability (EL section)', isStandard: true },
    ],
  },
];

// ============================================================
// SEED FUNCTION
// ============================================================

async function seedInsurerPolicies() {
  console.log('=== Seeding Insurer Policies ===\n');

  // 1. Seed all insurers
  console.log('1. Seeding insurers...');
  for (const insurer of insurers) {
    await prisma.insurer.upsert({
      where: { code: insurer.code },
      create: insurer,
      update: {
        nameHe: insurer.nameHe,
        nameEn: insurer.nameEn,
        website: insurer.website,
        phone: insurer.phone,
      },
    });
    console.log(`   ✓ ${insurer.code} (${insurer.nameHe})`);
  }

  // 2. Seed Clal master policies
  console.log('\n2. Seeding Clal master policies...');
  await seedInsurerPoliciesForCompany('CLAL', clalMasterPolicies, true);

  // 3. Seed Phoenix policies
  console.log('\n3. Seeding Phoenix (פניקס) policies...');
  await seedInsurerPoliciesForCompany('PHOENIX', phoenixPolicies, false);

  console.log('\n=== Insurer Policy seed complete! ===');
}

async function seedInsurerPoliciesForCompany(
  insurerCode: string,
  policies: PolicySeed[],
  isMaster: boolean
) {
  const insurer = await prisma.insurer.findUnique({ where: { code: insurerCode } });
  if (!insurer) {
    console.error(`   ✗ Insurer ${insurerCode} not found!`);
    return;
  }

  for (const policy of policies) {
    // Upsert the policy
    const insurerPolicy = await prisma.insurerPolicy.upsert({
      where: {
        insurerId_productCode: {
          insurerId: insurer.id,
          productCode: policy.productCode,
        },
      },
      create: {
        insurerId: insurer.id,
        productCode: policy.productCode,
        policyFormCode: policy.policyFormCode,
        bitStandard: policy.bitStandard,
        editionYear: policy.editionYear,
        structure: policy.structure,
        strengths: policy.strengths,
        weaknesses: policy.weaknesses,
        notableTerms: policy.notableTerms,
        isMaster,
      },
      update: {
        policyFormCode: policy.policyFormCode,
        bitStandard: policy.bitStandard,
        editionYear: policy.editionYear,
        structure: policy.structure,
        strengths: policy.strengths,
        weaknesses: policy.weaknesses,
        notableTerms: policy.notableTerms,
        isMaster,
      },
    });

    // Seed extensions
    for (const ext of policy.extensions) {
      const standard = ext.isStandard ?? isMaster;
      await prisma.insurerPolicyExtension.upsert({
        where: {
          insurerPolicyId_code: {
            insurerPolicyId: insurerPolicy.id,
            code: ext.code,
          },
        },
        create: {
          insurerPolicyId: insurerPolicy.id,
          code: ext.code,
          nameHe: ext.nameHe,
          nameEn: ext.nameEn,
          description: ext.description,
          descriptionHe: ext.descriptionHe,
          defaultLimit: ext.defaultLimit,
          limitNotes: ext.limitNotes,
          isStandard: standard,
        },
        update: {
          nameHe: ext.nameHe,
          nameEn: ext.nameEn,
          description: ext.description,
          descriptionHe: ext.descriptionHe,
          defaultLimit: ext.defaultLimit,
          limitNotes: ext.limitNotes,
          isStandard: standard,
        },
      });
    }

    // Seed exclusions
    for (const excl of policy.exclusions) {
      const standard = excl.isStandard ?? isMaster;
      await prisma.insurerPolicyExclusion.upsert({
        where: {
          insurerPolicyId_code: {
            insurerPolicyId: insurerPolicy.id,
            code: excl.code,
          },
        },
        create: {
          insurerPolicyId: insurerPolicy.id,
          code: excl.code,
          nameHe: excl.nameHe,
          nameEn: excl.nameEn,
          description: excl.description,
          descriptionHe: excl.descriptionHe,
          isStandard: standard,
        },
        update: {
          nameHe: excl.nameHe,
          nameEn: excl.nameEn,
          description: excl.description,
          descriptionHe: excl.descriptionHe,
          isStandard: standard,
        },
      });
    }

    const extCount = policy.extensions.length;
    const exclCount = policy.exclusions.length;
    console.log(`   ✓ ${policy.productCode} — ${extCount} extensions, ${exclCount} exclusions`);
  }
}

// Export for use by other seed files (e.g., Phoenix, Harel, etc.)
export { seedInsurerPoliciesForCompany, PolicySeed, ExtSeed, ExclSeed };

seedInsurerPolicies()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
