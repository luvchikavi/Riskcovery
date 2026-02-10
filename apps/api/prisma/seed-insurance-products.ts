import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================
// INSURANCE PRODUCT CATALOG SEED
// Based on 12 BIT-standard Israeli insurance master policies
// Source: INSURANCE_KNOWLEDGE_BASE.md
// ============================================================

interface ProductSeed {
  code: string;
  nameHe: string;
  nameEn: string;
  category: string;
  coverageTrigger: string;
  structure: Record<string, unknown>;
  insurer: string;
  bitStandard: string;
  description: string;
  descriptionHe: string;
}

interface ExtensionSeed {
  chapterCode?: string;
  code: string;
  nameHe: string;
  nameEn: string;
  description?: string;
  defaultLimit?: number;
  isFirstLoss?: boolean;
}

interface ExclusionSeed {
  chapterCode?: string;
  nameHe: string;
  nameEn: string;
  description?: string;
  isGeneral?: boolean;
}

// ============================================================
// 12 MASTER PRODUCTS
// ============================================================

const products: ProductSeed[] = [
  {
    code: 'FIRE_CONSEQUENTIAL_LOSS',
    nameHe: 'ביטוח אש מורחב ואבדן תוצאתי',
    nameEn: 'Fire & Consequential Loss',
    category: 'property',
    coverageTrigger: 'named-perils',
    structure: { chapters: ['Part A - Property Insurance', 'Part B - Business Interruption'] },
    insurer: 'Clal Insurance',
    bitStandard: 'BIT 2019',
    description: 'Physical loss/damage from named perils (fire, lightning, explosion, etc.) + business interruption coverage.',
    descriptionHe: 'ביטוח נזקי רכוש מסיכונים מכוסים (אש, ברק, פיצוץ וכו\') + אבדן תוצאתי / הפסד רווחים.',
  },
  {
    code: 'MECHANICAL_BREAKDOWN',
    nameHe: 'ביטוח שבר מכני',
    nameEn: 'Mechanical Breakdown',
    category: 'property',
    coverageTrigger: 'all-risks',
    structure: { chapters: ['Single chapter'] },
    insurer: 'Clal Insurance',
    bitStandard: 'BIT 2019',
    description: 'All-risks coverage for machinery — sudden, unforeseen physical damage. Complements Fire policy.',
    descriptionHe: 'כיסוי כל הסיכונים למכונות — נזק פיזי פתאומי ובלתי צפוי. משלים את פוליסת האש.',
  },
  {
    code: 'THIRD_PARTY_LIABILITY',
    nameHe: 'ביטוח אחריות כלפי צד שלישי',
    nameEn: 'Third Party Liability',
    category: 'liability',
    coverageTrigger: 'occurrence',
    structure: { chapters: ['Single chapter + extensions'] },
    insurer: 'Clal Insurance',
    bitStandard: 'BIT 2019',
    description: 'Legal liability for bodily injury, death, or property damage to third parties.',
    descriptionHe: 'אחריות משפטית לנזקי גוף, מוות או נזקי רכוש לצד שלישי.',
  },
  {
    code: 'EMPLOYERS_LIABILITY',
    nameHe: 'ביטוח אחריות מעבידים',
    nameEn: 'Employers Liability',
    category: 'liability',
    coverageTrigger: 'occurrence',
    structure: { chapters: ['Single chapter + extensions'] },
    insurer: 'Clal Insurance',
    bitStandard: 'BIT 2019',
    description: 'Legal liability for employee bodily injury, illness, or death from workplace accidents.',
    descriptionHe: 'אחריות משפטית לנזקי גוף, מחלה או מוות של עובדים מתאונות עבודה.',
  },
  {
    code: 'PRODUCT_LIABILITY',
    nameHe: 'ביטוח אחריות המוצר',
    nameEn: 'Product Liability',
    category: 'liability',
    coverageTrigger: 'claims-made',
    structure: { chapters: ['Single chapter + extensions'] },
    insurer: 'Clal Insurance',
    bitStandard: 'BIT 2019',
    description: 'Claims-made coverage for liability from defective products. Covers bodily injury and property damage.',
    descriptionHe: 'כיסוי על בסיס הגשת תביעה לאחריות ממוצרים פגומים. מכסה נזקי גוף ונזקי רכוש.',
  },
  {
    code: 'CASH_MONEY',
    nameHe: 'ביטוח כל הסיכונים - כספים',
    nameEn: 'Cash/Money',
    category: 'financial',
    coverageTrigger: 'all-risks',
    structure: { chapters: ['Single chapter + extensions'] },
    insurer: 'Clal Insurance',
    bitStandard: 'BIT 2019',
    description: 'All-risks coverage for business cash and negotiable instruments on premises and in transit.',
    descriptionHe: 'כיסוי כל הסיכונים לכספי העסק ושטרות סחירים בחצרים ובהעברה.',
  },
  {
    code: 'FIDELITY_CRIME',
    nameHe: 'ביטוח נאמנות',
    nameEn: 'Fidelity/Crime',
    category: 'financial',
    coverageTrigger: 'discovery',
    structure: { chapters: ['Single chapter + 1 extension'] },
    insurer: 'Clal Insurance',
    bitStandard: 'BIT 2019',
    description: 'Discovery-based coverage for losses caused by employee dishonesty (fraud, embezzlement, theft).',
    descriptionHe: 'כיסוי על בסיס גילוי להפסדים מחוסר נאמנות עובדים (הונאה, מעילה, גניבה).',
  },
  {
    code: 'CARGO_IN_TRANSIT',
    nameHe: 'ביטוח רכוש בהעברה',
    nameEn: 'Cargo in Transit',
    category: 'property',
    coverageTrigger: 'all-risks',
    structure: { chapters: ['Single chapter + extensions'] },
    insurer: 'Clal Insurance',
    bitStandard: 'BIT 2019',
    description: 'All-risks coverage for goods during transit by any vehicle within territorial limits.',
    descriptionHe: 'כיסוי כל הסיכונים לסחורות בהעברה בכל כלי רכב בתחום הטריטוריאלי.',
  },
  {
    code: 'TERRORISM',
    nameHe: 'ביטוח נזקי טרור',
    nameEn: 'Terrorism',
    category: 'property',
    coverageTrigger: 'named-perils',
    structure: { chapters: ['Chapter 1 - Property', 'Chapter 2 - Business Interruption'] },
    insurer: 'Phoenix Insurance',
    bitStandard: 'Pisga 2019',
    description: 'Top-up coverage for terror damage above Property Tax and Compensation Fund payments.',
    descriptionHe: 'כיסוי השלמה לנזקי טרור מעל תשלומי קרן הפיצויים של מס רכוש.',
  },
  {
    code: 'ELECTRONIC_EQUIPMENT',
    nameHe: 'ביטוח ציוד אלקטרוני',
    nameEn: 'Electronic Equipment',
    category: 'property',
    coverageTrigger: 'all-risks',
    structure: {
      chapters: [
        'Chapter 1 - Property Insurance',
        'Chapter 2 - Data & Software Restoration',
        'Chapter 3 - Additional Operating Expenses',
        'Chapter 4 - Business Interruption',
      ],
    },
    insurer: 'Clal Insurance',
    bitStandard: 'BIT 2019',
    description: 'All-risks coverage for electronic equipment including data restoration and business interruption.',
    descriptionHe: 'כיסוי כל הסיכונים לציוד אלקטרוני כולל שחזור מידע והפסד רווחים.',
  },
  {
    code: 'HEAVY_ENGINEERING_EQUIPMENT',
    nameHe: 'ביטוח ציוד מכני הנדסי',
    nameEn: 'Heavy/Engineering Equipment',
    category: 'engineering',
    coverageTrigger: 'all-risks',
    structure: { chapters: ['Single chapter + extensions'] },
    insurer: 'Clal Insurance',
    bitStandard: 'BIT 2016',
    description: 'All-risks coverage for heavy mechanical/engineering equipment whether in operation, at rest, or being maintained.',
    descriptionHe: 'כיסוי כל הסיכונים לציוד מכני הנדסי בפעולה, במנוחה או בתחזוקה.',
  },
  {
    code: 'CONTRACTOR_WORKS_CAR',
    nameHe: 'ביטוח עבודות קבלניות',
    nameEn: 'Contractor Works (CAR)',
    category: 'engineering',
    coverageTrigger: 'all-risks',
    structure: {
      chapters: [
        'Chapter A - Property Insurance',
        'Chapter B - Third Party Liability',
        'Chapter C - Employers Liability',
      ],
    },
    insurer: 'Clal Insurance',
    bitStandard: 'BIT 2019',
    description: 'All-risks construction coverage combining property, TPL, and EL in one policy.',
    descriptionHe: 'כיסוי כל הסיכונים לעבודות בנייה המשלב רכוש, צד שלישי ומעבידים בפוליסה אחת.',
  },
];

// ============================================================
// EXTENSIONS PER PRODUCT
// ============================================================

const extensionsByProduct: Record<string, ExtensionSeed[]> = {
  FIRE_CONSEQUENTIAL_LOSS: [
    // Part A extensions
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
    // Part B extensions
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

  MECHANICAL_BREAKDOWN: [
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

  THIRD_PARTY_LIABILITY: [
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

  EMPLOYERS_LIABILITY: [
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

  PRODUCT_LIABILITY: [
    { code: '4.1', nameHe: 'הרחבת מפיצים', nameEn: 'Vendors Endorsement' },
    { code: '4.2', nameHe: 'תקופת גילוי', nameEn: 'Run-off/Discovery Period' },
    { code: '4.3', nameHe: 'אחריות צולבת', nameEn: 'Cross Liability' },
    { code: '4.4', nameHe: 'הגנה פלילית/מנהלית', nameEn: 'Criminal/Admin Defense' },
    { code: '4.5', nameHe: 'פגיעה אישית', nameEn: 'Personal Injury', defaultLimit: 200000 },
    { code: '4.6', nameHe: 'עבודות שבוצעו', nameEn: 'Work Performed by Insured (completed operations)' },
  ],

  CASH_MONEY: [
    { code: '3.1', nameHe: 'כספים בבית מנהלים', nameEn: 'Money at Managers\'/Staff Homes' },
    { code: '3.2', nameHe: 'כלי כתב רשומים בדואר/מונית/שליח', nameEn: 'Registered Instruments by Mail/Taxi/Courier' },
    { code: '3.3', nameHe: 'זיוף שיקים גנובים', nameEn: 'Forgery of Stolen Blank Checks', defaultLimit: 50000, isFirstLoss: true },
    { code: '3.4', nameHe: 'נזק לכספת', nameEn: 'Damage to Safe' },
  ],

  FIDELITY_CRIME: [
    { code: '4', nameHe: 'תקופת גילוי', nameEn: 'Discovery Period Extension' },
  ],

  CARGO_IN_TRANSIT: [
    { code: '3.1', nameHe: 'אובדן יחידה שלמה', nameEn: 'Loss of Complete Unit' },
    { code: '3.2', nameHe: 'משלוחי יצוא/יבוא', nameEn: 'Export/Import Shipments' },
    { code: '3.3', nameHe: 'הגנת מותג/הצלה', nameEn: 'Brand Protection/Salvage' },
  ],

  TERRORISM: [
    // No standard extensions listed
  ],

  ELECTRONIC_EQUIPMENT: [
    // Chapter 1 extensions
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
    // Chapter 4 extensions
    { chapterCode: '4', code: '18.1', nameHe: 'השפעה בין-עסקית', nameEn: 'Inter-Business Impact' },
    { chapterCode: '4', code: '18.2', nameHe: 'שיפורי ציוד', nameEn: 'Equipment Improvements' },
    { chapterCode: '4', code: '18.3', nameHe: 'פיצוי הפרת חוזה', nameEn: 'Breach of Contract Compensation' },
    { chapterCode: '4', code: '18.4', nameHe: 'חובות בספרים', nameEn: 'Outstanding Debts (Book Debts)' },
    { chapterCode: '4', code: '18.5', nameHe: 'הוצאות הכנת תביעה', nameEn: 'Claim Preparation Costs' },
    { chapterCode: '4', code: '18.6', nameHe: 'השבת סכום ביטוח', nameEn: 'Sum Insured Reinstatement' },
  ],

  HEAVY_ENGINEERING_EQUIPMENT: [
    { code: '3.1', nameHe: 'גניבה, פריצה ושוד', nameEn: 'Theft, Burglary & Robbery', defaultLimit: 20000 },
    { code: '3.2', nameHe: 'הוצאות חילוץ, גרירה והעברה', nameEn: 'Salvage, Towing & Transport', defaultLimit: 20000, isFirstLoss: true },
    { code: '3.3', nameHe: 'השבה לקדמות', nameEn: 'Reinstatement of Sum Insured' },
    { code: '3.4', nameHe: 'הוצאות נוספות הכרחיות', nameEn: 'Additional Necessary Expenses', isFirstLoss: true },
  ],

  CONTRACTOR_WORKS_CAR: [
    // Chapter A extensions
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
    // Chapter B extensions
    { chapterCode: 'B', code: '7.1', nameHe: 'אחריות צולבת', nameEn: 'Cross Liability' },
    { chapterCode: 'B', code: '7.2', nameHe: 'פריטים תת-קרקעיים/תשתיות', nameEn: 'Underground Items/Utilities Liability' },
    { chapterCode: 'B', code: '7.3', nameHe: 'רעידות/החלשת תמיכה', nameEn: 'Vibration/Support Weakening', defaultLimit: 4000000 },
    { chapterCode: 'B', code: '7.4', nameHe: 'נזק רכוש מכלי רכב באתר', nameEn: 'Motor Vehicle Property Damage on Site', defaultLimit: 2000000 },
    { chapterCode: 'B', code: '7.5', nameHe: 'נזקי גוף מציוד כבד', nameEn: 'Bodily Injury from Heavy Equipment' },
    { chapterCode: 'B', code: '7.6', nameHe: 'אחריות כלי נשק', nameEn: 'Weapons Liability' },
    { chapterCode: 'B', code: '7.7', nameHe: 'שהות זמנית בחו"ל', nameEn: 'Temporary Stay Abroad' },
    // Chapter C extensions
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
};

// ============================================================
// EXCLUSIONS PER PRODUCT
// ============================================================

const exclusionsByProduct: Record<string, ExclusionSeed[]> = {
  FIRE_CONSEQUENTIAL_LOSS: [
    { nameEn: 'Consequential loss (Part A)', nameHe: 'אבדן תוצאתי (חלק א)', isGeneral: true },
    { nameEn: 'Electrical installation damage', nameHe: 'נזק למתקן חשמלי', isGeneral: true },
    { nameEn: 'Marine-insured property', nameHe: 'רכוש מבוטח ימי', isGeneral: true },
    { nameEn: 'Government-ordered damage', nameHe: 'נזק בהוראת ממשלה', isGeneral: true },
    { nameEn: 'Nuclear risks', nameHe: 'סיכונים גרעיניים', isGeneral: true },
    { nameEn: 'War/terrorism', nameHe: 'מלחמה/טרור', isGeneral: true },
    { nameEn: 'Earthquake (unless purchased)', nameHe: 'רעידת אדמה (אלא אם נרכש)', isGeneral: true },
    { nameEn: 'Pollution (unless from insured peril)', nameHe: 'זיהום (אלא אם מסיכון מבוטח)', isGeneral: true },
    { nameEn: 'Gross negligence', nameHe: 'רשלנות חמורה', isGeneral: true },
    { nameEn: 'Intangible property/data', nameHe: 'רכוש לא מוחשי/מידע', isGeneral: true },
  ],

  MECHANICAL_BREAKDOWN: [
    { nameEn: 'Fire policy perils (complementary)', nameHe: 'סיכוני פוליסת אש (משלים)', isGeneral: true },
    { nameEn: 'Consequential loss', nameHe: 'אבדן תוצאתי', isGeneral: true },
    { nameEn: 'Overload/experimental use', nameHe: 'עומס יתר/שימוש ניסיוני', isGeneral: true },
    { nameEn: 'Manufacturer/supplier warranty', nameHe: 'אחריות יצרן/ספק', isGeneral: true },
    { nameEn: 'Pre-existing defects', nameHe: 'פגמים קיימים', isGeneral: true },
    { nameEn: 'Consumables/spare parts', nameHe: 'מתכלים/חלפים', isGeneral: true },
    { nameEn: 'Wear/corrosion/deterioration', nameHe: 'בלאי/קורוזיה/התדרדרות', isGeneral: true },
    { nameEn: 'War/terrorism', nameHe: 'מלחמה/טרור', isGeneral: true },
    { nameEn: 'Theft', nameHe: 'גניבה', isGeneral: true },
    { nameEn: 'Gross negligence', nameHe: 'רשלנות חמורה', isGeneral: true },
  ],

  THIRD_PARTY_LIABILITY: [
    { nameEn: 'Employee injury', nameHe: 'פגיעת עובד', isGeneral: true },
    { nameEn: 'Motor vehicle liability', nameHe: 'אחריות כלי רכב', isGeneral: true },
    { nameEn: 'Product liability', nameHe: 'אחריות מוצר', isGeneral: true },
    { nameEn: 'Professional liability', nameHe: 'אחריות מקצועית', isGeneral: true },
    { nameEn: 'D&O liability', nameHe: 'אחריות נושאי משרה', isGeneral: true },
    { nameEn: 'Pollution (unless sudden/accidental)', nameHe: 'זיהום (אלא אם פתאומי)', isGeneral: true },
    { nameEn: 'Property in custody', nameHe: 'רכוש בהחזקה', isGeneral: true },
    { nameEn: 'Contractual liability', nameHe: 'אחריות חוזית', isGeneral: true },
    { nameEn: 'Nuclear/Radiation/EMF', nameHe: 'גרעיני/קרינה', isGeneral: true },
    { nameEn: 'War/terrorism', nameHe: 'מלחמה/טרור', isGeneral: true },
    { nameEn: 'Punitive damages', nameHe: 'פיצויים עונשיים', isGeneral: true },
    { nameEn: 'Asbestos', nameHe: 'אסבסט', isGeneral: true },
    { nameEn: 'Gross negligence', nameHe: 'רשלנות חמורה', isGeneral: true },
    { nameEn: 'Pure financial loss', nameHe: 'נזק כספי טהור', isGeneral: true },
  ],

  EMPLOYERS_LIABILITY: [
    { nameEn: 'Contractual liability', nameHe: 'אחריות חוזית', isGeneral: true },
    { nameEn: 'National Insurance default claims', nameHe: 'תביעות ביטוח לאומי', isGeneral: true },
    { nameEn: 'Asbestos/Silicone/Silicosis', nameHe: 'אסבסט/סיליקון/סיליקוזיס', isGeneral: true },
    { nameEn: 'War/terrorism', nameHe: 'מלחמה/טרור', isGeneral: true },
    { nameEn: 'Nuclear/Radiation/EMF', nameHe: 'גרעיני/קרינה', isGeneral: true },
    { nameEn: 'Motor vehicle road accidents', nameHe: 'תאונות דרכים', isGeneral: true },
    { nameEn: 'Punitive damages', nameHe: 'פיצויים עונשיים', isGeneral: true },
    { nameEn: 'Gross negligence', nameHe: 'רשלנות חמורה', isGeneral: true },
  ],

  PRODUCT_LIABILITY: [
    { nameEn: 'Employee injury', nameHe: 'פגיעת עובד', isGeneral: true },
    { nameEn: 'Contractual liability', nameHe: 'אחריות חוזית', isGeneral: true },
    { nameEn: 'Manufacture contrary to law', nameHe: 'ייצור בניגוד לחוק', isGeneral: true },
    { nameEn: 'Knowingly defective product', nameHe: 'מוצר פגום ביודעין', isGeneral: true },
    { nameEn: 'Product recall costs', nameHe: 'עלויות ריקול', isGeneral: true },
    { nameEn: 'Damage to product itself', nameHe: 'נזק למוצר עצמו', isGeneral: true },
    { nameEn: 'Nuclear/Radiation/EMF', nameHe: 'גרעיני/קרינה', isGeneral: true },
    { nameEn: 'War/terrorism', nameHe: 'מלחמה/טרור', isGeneral: true },
    { nameEn: 'Pre-retroactive date events', nameHe: 'אירועים לפני תאריך רטרואקטיבי', isGeneral: true },
    { nameEn: 'Punitive damages', nameHe: 'פיצויים עונשיים', isGeneral: true },
    { nameEn: 'Asbestos', nameHe: 'אסבסט', isGeneral: true },
    { nameEn: 'Gross negligence', nameHe: 'רשלנות חמורה', isGeneral: true },
  ],

  CASH_MONEY: [
    { nameEn: 'Unexplained shortage', nameHe: 'חוסר בלתי מוסבר', isGeneral: true },
    { nameEn: 'Money in unsupervised vehicles', nameHe: 'כספים ברכב ללא השגחה', isGeneral: true },
    { nameEn: 'Consequential loss', nameHe: 'אבדן תוצאתי', isGeneral: true },
    { nameEn: 'Employee fraud (except messenger)', nameHe: 'הונאת עובד (חוץ משליח)', isGeneral: true },
    { nameEn: 'Non-break-in/robbery theft', nameHe: 'גניבה שאינה פריצה/שוד', isGeneral: true },
    { nameEn: 'Electronic payment instruments', nameHe: 'אמצעי תשלום אלקטרוניים', isGeneral: true },
    { nameEn: 'War/terrorism', nameHe: 'מלחמה/טרור', isGeneral: true },
    { nameEn: 'Gross negligence', nameHe: 'רשלנות חמורה', isGeneral: true },
  ],

  FIDELITY_CRIME: [
    { nameEn: 'Pre-inception discovered damage', nameHe: 'נזק שהתגלה לפני תחילת הפוליסה', isGeneral: true },
    { nameEn: 'Post-discovery damage (same employee)', nameHe: 'נזק לאחר גילוי (אותו עובד)', isGeneral: true },
    { nameEn: 'Pre-retroactive date damage', nameHe: 'נזק לפני תאריך רטרואקטיבי', isGeneral: true },
    { nameEn: 'Consequential/indirect loss', nameHe: 'אבדן תוצאתי/עקיף', isGeneral: true },
    { nameEn: 'Nuclear', nameHe: 'גרעיני', isGeneral: true },
    { nameEn: 'War/terrorism', nameHe: 'מלחמה/טרור', isGeneral: true },
  ],

  CARGO_IN_TRANSIT: [
    { nameEn: 'Inherent defect/wear', nameHe: 'פגם טבוע/בלאי', isGeneral: true },
    { nameEn: 'Porcelain/glass breakage', nameHe: 'שבירת חרסינה/זכוכית', isGeneral: true },
    { nameEn: 'Container leakage', nameHe: 'דליפת מכולה', isGeneral: true },
    { nameEn: 'Consequential loss', nameHe: 'אבדן תוצאתי', isGeneral: true },
    { nameEn: 'Non-break-in/robbery theft', nameHe: 'גניבה שאינה פריצה/שוד', isGeneral: true },
    { nameEn: 'Unroadworthy vehicle', nameHe: 'רכב לא כשיר לדרך', isGeneral: true },
    { nameEn: 'Employee fraud', nameHe: 'הונאת עובד', isGeneral: true },
    { nameEn: 'War/terrorism', nameHe: 'מלחמה/טרור', isGeneral: true },
    { nameEn: 'Marine insurance overlap', nameHe: 'חפיפת ביטוח ימי', isGeneral: true },
    { nameEn: 'Gross negligence', nameHe: 'רשלנות חמורה', isGeneral: true },
    { nameEn: 'Overnight unattended parking', nameHe: 'חניה ללא השגחה ללילה', isGeneral: true },
  ],

  TERRORISM: [
    { nameEn: 'War/civil war', nameHe: 'מלחמה/מלחמת אזרחים', isGeneral: true },
    { nameEn: 'Biological/chemical weapons', nameHe: 'נשק ביולוגי/כימי', isGeneral: true },
    { nameEn: 'Break-in/theft (non-immediate)', nameHe: 'פריצה/גניבה (לא מיידית)', isGeneral: true },
    { nameEn: 'Military installations', nameHe: 'מתקנים צבאיים/ביטחוניים', isGeneral: true },
    { nameEn: 'Nuclear', nameHe: 'גרעיני', isGeneral: true },
    { nameEn: 'Events outside geographic limits', nameHe: 'אירועים מחוץ לגבולות', isGeneral: true },
  ],

  ELECTRONIC_EQUIPMENT: [
    { nameEn: 'Residual policy exclusion (Fire overlap)', nameHe: 'חריג שיורי (חפיפת אש)', chapterCode: '1', isGeneral: false },
    { nameEn: 'Pre-existing defects', nameHe: 'פגמים קיימים', chapterCode: '1', isGeneral: false },
    { nameEn: 'Wear/tear/corrosion', nameHe: 'בלאי/קורוזיה', chapterCode: '1', isGeneral: false },
    { nameEn: 'Repair of operational defects', nameHe: 'תיקון פגמים תפעוליים', chapterCode: '1', isGeneral: false },
    { nameEn: 'Manufacturer warranty liability', nameHe: 'אחריות יצרן', chapterCode: '1', isGeneral: false },
    { nameEn: 'Simple theft (not burglary)', nameHe: 'גניבה פשוטה (לא פריצה)', chapterCode: '1', isGeneral: false },
    { nameEn: 'Consumables/replaceable materials', nameHe: 'מתכלים/חומרים מתחלפים', chapterCode: '1', isGeneral: false },
    { nameEn: 'Unlicensed software', nameHe: 'תוכנה ללא רישיון', chapterCode: '2', isGeneral: false },
    { nameEn: 'No backup regime', nameHe: 'ללא משטר גיבוי', chapterCode: '2', isGeneral: false },
    { nameEn: 'Nuclear', nameHe: 'גרעיני', isGeneral: true },
    { nameEn: 'War/terrorism', nameHe: 'מלחמה/טרור', isGeneral: true },
    { nameEn: 'Gross negligence', nameHe: 'רשלנות חמורה', isGeneral: true },
  ],

  HEAVY_ENGINEERING_EQUIPMENT: [
    { nameEn: 'Consequential/indirect loss', nameHe: 'אבדן תוצאתי/עקיף', isGeneral: true },
    { nameEn: 'War/terrorism', nameHe: 'מלחמה/טרור', isGeneral: true },
    { nameEn: 'Overload/experimental use', nameHe: 'עומס יתר/שימוש ניסיוני', isGeneral: true },
    { nameEn: 'Theft/burglary (unless ext 3.1)', nameHe: 'גניבה/פריצה (אלא אם הרחבה 3.1)', isGeneral: true },
    { nameEn: 'Normal wear/corrosion', nameHe: 'בלאי רגיל/קורוזיה', isGeneral: true },
    { nameEn: 'Tire damage (tread <60%)', nameHe: 'נזק צמיגים (סוליה <60%)', isGeneral: true },
    { nameEn: 'Water source damage', nameHe: 'נזק ממקור מים', isGeneral: true },
    { nameEn: 'Overseas damage', nameHe: 'נזק בחו"ל', isGeneral: true },
    { nameEn: 'Unauthorized operator', nameHe: 'מפעיל ללא רישיון', isGeneral: true },
    { nameEn: 'Gross negligence', nameHe: 'רשלנות חמורה', isGeneral: true },
  ],

  CONTRACTOR_WORKS_CAR: [
    { nameEn: 'Faulty design/materials/workmanship', nameHe: 'תכנון/חומרים/עבודה פגומים', chapterCode: 'A', isGeneral: false },
    { nameEn: 'Wear/tear', nameHe: 'בלאי', chapterCode: 'A', isGeneral: false },
    { nameEn: 'Unexplained shortage', nameHe: 'חוסר בלתי מוסבר', chapterCode: 'A', isGeneral: false },
    { nameEn: 'Motor vehicle liability', nameHe: 'אחריות כלי רכב', chapterCode: 'B', isGeneral: false },
    { nameEn: 'Underground items', nameHe: 'פריטים תת-קרקעיים', chapterCode: 'B', isGeneral: false },
    { nameEn: 'Vibration/support weakening', nameHe: 'רעידות/החלשת תמיכה', chapterCode: 'B', isGeneral: false },
    { nameEn: 'War/terrorism', nameHe: 'מלחמה/טרור', isGeneral: true },
    { nameEn: 'Nuclear', nameHe: 'גרעיני', isGeneral: true },
    { nameEn: 'Work stoppage > 90 days', nameHe: 'הפסקת עבודה > 90 יום', isGeneral: true },
    { nameEn: 'Unlicensed crane operators', nameHe: 'מפעילי מנוף ללא רישיון', isGeneral: true },
    { nameEn: 'Gross negligence', nameHe: 'רשלנות חמורה', isGeneral: true },
  ],
};

// ============================================================
// CROSS-POLICY RELATIONS
// ============================================================

const crossPolicyRelations: { from: string; to: string; type: string; description: string }[] = [
  { from: 'FIRE_CONSEQUENTIAL_LOSS', to: 'MECHANICAL_BREAKDOWN', type: 'complementary', description: 'Mechanical Breakdown excludes Fire perils; designed to work together' },
  { from: 'FIRE_CONSEQUENTIAL_LOSS', to: 'TERRORISM', type: 'complementary', description: 'Terrorism is a top-up above Property Tax Fund; references Fire policy' },
  { from: 'THIRD_PARTY_LIABILITY', to: 'EMPLOYERS_LIABILITY', type: 'complementary', description: 'TPL excludes employee injury; EL covers it' },
  { from: 'THIRD_PARTY_LIABILITY', to: 'PRODUCT_LIABILITY', type: 'complementary', description: 'TPL excludes product liability; separate policy needed' },
  { from: 'ELECTRONIC_EQUIPMENT', to: 'FIRE_CONSEQUENTIAL_LOSS', type: 'residual', description: 'Electronic Equipment can be residual (covering only what Fire doesn\'t)' },
  { from: 'CONTRACTOR_WORKS_CAR', to: 'THIRD_PARTY_LIABILITY', type: 'bundled', description: 'CAR combines Property + TPL + EL for construction projects' },
];

// ============================================================
// SECTOR-PRODUCT MATRIX (10 sectors × 12 products)
// ============================================================

const sectorMatrix: { sector: string; productCode: string; necessity: string }[] = [
  // Manufacturing
  { sector: 'MANUFACTURING', productCode: 'FIRE_CONSEQUENTIAL_LOSS', necessity: 'mandatory' },
  { sector: 'MANUFACTURING', productCode: 'MECHANICAL_BREAKDOWN', necessity: 'mandatory' },
  { sector: 'MANUFACTURING', productCode: 'THIRD_PARTY_LIABILITY', necessity: 'mandatory' },
  { sector: 'MANUFACTURING', productCode: 'EMPLOYERS_LIABILITY', necessity: 'mandatory' },
  { sector: 'MANUFACTURING', productCode: 'PRODUCT_LIABILITY', necessity: 'mandatory' },
  { sector: 'MANUFACTURING', productCode: 'CASH_MONEY', necessity: 'recommended' },
  { sector: 'MANUFACTURING', productCode: 'FIDELITY_CRIME', necessity: 'recommended' },
  { sector: 'MANUFACTURING', productCode: 'CARGO_IN_TRANSIT', necessity: 'recommended' },
  { sector: 'MANUFACTURING', productCode: 'TERRORISM', necessity: 'recommended' },
  { sector: 'MANUFACTURING', productCode: 'ELECTRONIC_EQUIPMENT', necessity: 'recommended' },

  // Construction
  { sector: 'CONSTRUCTION', productCode: 'FIRE_CONSEQUENTIAL_LOSS', necessity: 'mandatory' },
  { sector: 'CONSTRUCTION', productCode: 'MECHANICAL_BREAKDOWN', necessity: 'recommended' },
  { sector: 'CONSTRUCTION', productCode: 'THIRD_PARTY_LIABILITY', necessity: 'mandatory' },
  { sector: 'CONSTRUCTION', productCode: 'EMPLOYERS_LIABILITY', necessity: 'mandatory' },
  { sector: 'CONSTRUCTION', productCode: 'CASH_MONEY', necessity: 'recommended' },
  { sector: 'CONSTRUCTION', productCode: 'FIDELITY_CRIME', necessity: 'recommended' },
  { sector: 'CONSTRUCTION', productCode: 'CARGO_IN_TRANSIT', necessity: 'recommended' },
  { sector: 'CONSTRUCTION', productCode: 'TERRORISM', necessity: 'recommended' },
  { sector: 'CONSTRUCTION', productCode: 'HEAVY_ENGINEERING_EQUIPMENT', necessity: 'mandatory' },
  { sector: 'CONSTRUCTION', productCode: 'CONTRACTOR_WORKS_CAR', necessity: 'mandatory' },

  // Technology
  { sector: 'TECHNOLOGY', productCode: 'FIRE_CONSEQUENTIAL_LOSS', necessity: 'mandatory' },
  { sector: 'TECHNOLOGY', productCode: 'THIRD_PARTY_LIABILITY', necessity: 'mandatory' },
  { sector: 'TECHNOLOGY', productCode: 'EMPLOYERS_LIABILITY', necessity: 'mandatory' },
  { sector: 'TECHNOLOGY', productCode: 'PRODUCT_LIABILITY', necessity: 'recommended' },
  { sector: 'TECHNOLOGY', productCode: 'FIDELITY_CRIME', necessity: 'recommended' },
  { sector: 'TECHNOLOGY', productCode: 'TERRORISM', necessity: 'recommended' },
  { sector: 'TECHNOLOGY', productCode: 'ELECTRONIC_EQUIPMENT', necessity: 'mandatory' },

  // Retail
  { sector: 'RETAIL', productCode: 'FIRE_CONSEQUENTIAL_LOSS', necessity: 'mandatory' },
  { sector: 'RETAIL', productCode: 'THIRD_PARTY_LIABILITY', necessity: 'mandatory' },
  { sector: 'RETAIL', productCode: 'EMPLOYERS_LIABILITY', necessity: 'mandatory' },
  { sector: 'RETAIL', productCode: 'PRODUCT_LIABILITY', necessity: 'recommended' },
  { sector: 'RETAIL', productCode: 'CASH_MONEY', necessity: 'mandatory' },
  { sector: 'RETAIL', productCode: 'FIDELITY_CRIME', necessity: 'recommended' },
  { sector: 'RETAIL', productCode: 'CARGO_IN_TRANSIT', necessity: 'recommended' },
  { sector: 'RETAIL', productCode: 'TERRORISM', necessity: 'recommended' },
  { sector: 'RETAIL', productCode: 'ELECTRONIC_EQUIPMENT', necessity: 'recommended' },

  // Logistics
  { sector: 'LOGISTICS', productCode: 'FIRE_CONSEQUENTIAL_LOSS', necessity: 'mandatory' },
  { sector: 'LOGISTICS', productCode: 'MECHANICAL_BREAKDOWN', necessity: 'recommended' },
  { sector: 'LOGISTICS', productCode: 'THIRD_PARTY_LIABILITY', necessity: 'mandatory' },
  { sector: 'LOGISTICS', productCode: 'EMPLOYERS_LIABILITY', necessity: 'mandatory' },
  { sector: 'LOGISTICS', productCode: 'CASH_MONEY', necessity: 'recommended' },
  { sector: 'LOGISTICS', productCode: 'FIDELITY_CRIME', necessity: 'recommended' },
  { sector: 'LOGISTICS', productCode: 'CARGO_IN_TRANSIT', necessity: 'mandatory' },
  { sector: 'LOGISTICS', productCode: 'TERRORISM', necessity: 'recommended' },
  { sector: 'LOGISTICS', productCode: 'HEAVY_ENGINEERING_EQUIPMENT', necessity: 'recommended' },

  // Financial Services
  { sector: 'FINANCIAL_SERVICES', productCode: 'FIRE_CONSEQUENTIAL_LOSS', necessity: 'mandatory' },
  { sector: 'FINANCIAL_SERVICES', productCode: 'THIRD_PARTY_LIABILITY', necessity: 'mandatory' },
  { sector: 'FINANCIAL_SERVICES', productCode: 'EMPLOYERS_LIABILITY', necessity: 'mandatory' },
  { sector: 'FINANCIAL_SERVICES', productCode: 'CASH_MONEY', necessity: 'mandatory' },
  { sector: 'FINANCIAL_SERVICES', productCode: 'FIDELITY_CRIME', necessity: 'mandatory' },
  { sector: 'FINANCIAL_SERVICES', productCode: 'TERRORISM', necessity: 'recommended' },
  { sector: 'FINANCIAL_SERVICES', productCode: 'ELECTRONIC_EQUIPMENT', necessity: 'mandatory' },

  // Healthcare
  { sector: 'HEALTHCARE', productCode: 'FIRE_CONSEQUENTIAL_LOSS', necessity: 'mandatory' },
  { sector: 'HEALTHCARE', productCode: 'MECHANICAL_BREAKDOWN', necessity: 'recommended' },
  { sector: 'HEALTHCARE', productCode: 'THIRD_PARTY_LIABILITY', necessity: 'mandatory' },
  { sector: 'HEALTHCARE', productCode: 'EMPLOYERS_LIABILITY', necessity: 'mandatory' },
  { sector: 'HEALTHCARE', productCode: 'PRODUCT_LIABILITY', necessity: 'mandatory' },
  { sector: 'HEALTHCARE', productCode: 'CASH_MONEY', necessity: 'recommended' },
  { sector: 'HEALTHCARE', productCode: 'FIDELITY_CRIME', necessity: 'recommended' },
  { sector: 'HEALTHCARE', productCode: 'TERRORISM', necessity: 'recommended' },
  { sector: 'HEALTHCARE', productCode: 'ELECTRONIC_EQUIPMENT', necessity: 'mandatory' },

  // Agriculture
  { sector: 'AGRICULTURE', productCode: 'FIRE_CONSEQUENTIAL_LOSS', necessity: 'mandatory' },
  { sector: 'AGRICULTURE', productCode: 'MECHANICAL_BREAKDOWN', necessity: 'mandatory' },
  { sector: 'AGRICULTURE', productCode: 'THIRD_PARTY_LIABILITY', necessity: 'mandatory' },
  { sector: 'AGRICULTURE', productCode: 'EMPLOYERS_LIABILITY', necessity: 'mandatory' },
  { sector: 'AGRICULTURE', productCode: 'PRODUCT_LIABILITY', necessity: 'recommended' },
  { sector: 'AGRICULTURE', productCode: 'CASH_MONEY', necessity: 'recommended' },
  { sector: 'AGRICULTURE', productCode: 'CARGO_IN_TRANSIT', necessity: 'recommended' },
  { sector: 'AGRICULTURE', productCode: 'TERRORISM', necessity: 'recommended' },
  { sector: 'AGRICULTURE', productCode: 'HEAVY_ENGINEERING_EQUIPMENT', necessity: 'recommended' },

  // Real Estate
  { sector: 'REAL_ESTATE', productCode: 'FIRE_CONSEQUENTIAL_LOSS', necessity: 'mandatory' },
  { sector: 'REAL_ESTATE', productCode: 'THIRD_PARTY_LIABILITY', necessity: 'mandatory' },
  { sector: 'REAL_ESTATE', productCode: 'EMPLOYERS_LIABILITY', necessity: 'mandatory' },
  { sector: 'REAL_ESTATE', productCode: 'FIDELITY_CRIME', necessity: 'recommended' },
  { sector: 'REAL_ESTATE', productCode: 'TERRORISM', necessity: 'mandatory' },
  { sector: 'REAL_ESTATE', productCode: 'ELECTRONIC_EQUIPMENT', necessity: 'recommended' },
  { sector: 'REAL_ESTATE', productCode: 'CONTRACTOR_WORKS_CAR', necessity: 'recommended' },

  // Consulting / Professional Services
  { sector: 'CONSULTING', productCode: 'FIRE_CONSEQUENTIAL_LOSS', necessity: 'mandatory' },
  { sector: 'CONSULTING', productCode: 'THIRD_PARTY_LIABILITY', necessity: 'mandatory' },
  { sector: 'CONSULTING', productCode: 'EMPLOYERS_LIABILITY', necessity: 'mandatory' },
  { sector: 'CONSULTING', productCode: 'PRODUCT_LIABILITY', necessity: 'recommended' },
  { sector: 'CONSULTING', productCode: 'FIDELITY_CRIME', necessity: 'recommended' },
  { sector: 'CONSULTING', productCode: 'TERRORISM', necessity: 'recommended' },
  { sector: 'CONSULTING', productCode: 'ELECTRONIC_EQUIPMENT', necessity: 'recommended' },
];

// ============================================================
// SEED FUNCTION
// ============================================================

async function seedInsuranceProducts() {
  console.log('Seeding insurance products...');

  // 1. Upsert all products
  for (const product of products) {
    await prisma.insuranceProduct.upsert({
      where: { code: product.code },
      create: product,
      update: {
        nameHe: product.nameHe,
        nameEn: product.nameEn,
        category: product.category,
        coverageTrigger: product.coverageTrigger,
        structure: product.structure,
        insurer: product.insurer,
        bitStandard: product.bitStandard,
        description: product.description,
        descriptionHe: product.descriptionHe,
      },
    });
    console.log(`  Product: ${product.code}`);
  }

  // 2. Upsert extensions
  let extCount = 0;
  for (const [productCode, extensions] of Object.entries(extensionsByProduct)) {
    const product = await prisma.insuranceProduct.findUnique({ where: { code: productCode } });
    if (!product) continue;

    for (const ext of extensions) {
      await prisma.policyExtension.upsert({
        where: {
          productId_code: { productId: product.id, code: ext.code },
        },
        create: {
          productId: product.id,
          chapterCode: ext.chapterCode,
          code: ext.code,
          nameHe: ext.nameHe,
          nameEn: ext.nameEn,
          description: ext.description,
          defaultLimit: ext.defaultLimit,
          isFirstLoss: ext.isFirstLoss ?? false,
        },
        update: {
          chapterCode: ext.chapterCode,
          nameHe: ext.nameHe,
          nameEn: ext.nameEn,
          description: ext.description,
          defaultLimit: ext.defaultLimit,
          isFirstLoss: ext.isFirstLoss ?? false,
        },
      });
      extCount++;
    }
  }
  console.log(`  Extensions: ${extCount}`);

  // 3. Upsert exclusions
  let exclCount = 0;
  for (const [productCode, exclusions] of Object.entries(exclusionsByProduct)) {
    const product = await prisma.insuranceProduct.findUnique({ where: { code: productCode } });
    if (!product) continue;

    for (const excl of exclusions) {
      await prisma.policyExclusion.upsert({
        where: {
          productId_nameEn: { productId: product.id, nameEn: excl.nameEn },
        },
        create: {
          productId: product.id,
          chapterCode: excl.chapterCode,
          nameHe: excl.nameHe,
          nameEn: excl.nameEn,
          description: excl.description,
          isGeneral: excl.isGeneral ?? true,
        },
        update: {
          chapterCode: excl.chapterCode,
          nameHe: excl.nameHe,
          nameEn: excl.nameEn,
          description: excl.description,
          isGeneral: excl.isGeneral ?? true,
        },
      });
      exclCount++;
    }
  }
  console.log(`  Exclusions: ${exclCount}`);

  // 4. Upsert cross-policy relations
  for (const rel of crossPolicyRelations) {
    const fromProduct = await prisma.insuranceProduct.findUnique({ where: { code: rel.from } });
    const toProduct = await prisma.insuranceProduct.findUnique({ where: { code: rel.to } });
    if (!fromProduct || !toProduct) continue;

    await prisma.crossPolicyRelation.upsert({
      where: {
        fromProductId_toProductId: { fromProductId: fromProduct.id, toProductId: toProduct.id },
      },
      create: {
        fromProductId: fromProduct.id,
        toProductId: toProduct.id,
        relationType: rel.type,
        description: rel.description,
      },
      update: {
        relationType: rel.type,
        description: rel.description,
      },
    });
  }
  console.log(`  Relations: ${crossPolicyRelations.length}`);

  // 5. Upsert sector-product mappings
  let mappingCount = 0;
  for (const mapping of sectorMatrix) {
    const product = await prisma.insuranceProduct.findUnique({ where: { code: mapping.productCode } });
    if (!product) continue;

    await prisma.sectorProductMapping.upsert({
      where: {
        sector_productId: { sector: mapping.sector, productId: product.id },
      },
      create: {
        sector: mapping.sector,
        productId: product.id,
        necessity: mapping.necessity,
      },
      update: {
        necessity: mapping.necessity,
      },
    });
    mappingCount++;
  }
  console.log(`  Sector mappings: ${mappingCount}`);

  console.log('Insurance products seed complete!');
}

seedInsuranceProducts()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
