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
}

interface ExclSeed {
  chapterCode?: string;
  code: string;
  nameHe: string;
  nameEn: string;
  description?: string;
  descriptionHe?: string;
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
// PHOENIX POLICIES — Will be added after PDF analysis
// ============================================================

// Placeholder: Phoenix policies will be added here as we process each PDF
// const phoenixPolicies: PolicySeed[] = [];

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
          isStandard: true, // Clal IS the standard
        },
        update: {
          nameHe: ext.nameHe,
          nameEn: ext.nameEn,
          description: ext.description,
          descriptionHe: ext.descriptionHe,
          defaultLimit: ext.defaultLimit,
          limitNotes: ext.limitNotes,
          isStandard: true,
        },
      });
    }

    // Seed exclusions
    for (const excl of policy.exclusions) {
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
          isStandard: true,
        },
        update: {
          nameHe: excl.nameHe,
          nameEn: excl.nameEn,
          description: excl.description,
          descriptionHe: excl.descriptionHe,
          isStandard: true,
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
