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
    { chapterCode: 'A', code: '3.1', nameHe: 'פריצה/גניבה', nameEn: 'Break-in/Theft', description: 'מרחיב את הכיסוי לנזקי רכוש שנגרמו כתוצאה מפריצה או גניבה, כולל נזק פיזי לרכוש במהלך הפריצה. הכיסוי כפוף לאמצעי מיגון מינימליים כנדרש בפוליסה.' },
    { chapterCode: 'A', code: '3.2', nameHe: 'רכוש מחוץ לחצרים', nameEn: 'Property Outside Premises', description: 'כיסוי לרכוש המבוטח הנמצא זמנית מחוץ לחצרי המבוטח, כגון ציוד בתערוכות או רכוש באחסנה חיצונית. כפוף לגבול אחריות נפרד.' },
    { chapterCode: 'A', code: '3.3', nameHe: 'רכוש מחוץ לגבולות טריטוריאליים', nameEn: 'Property Outside Territorial Limits', description: 'הרחבה לכיסוי רכוש הנמצא מחוץ לגבולות הטריטוריאליים המוגדרים בפוליסה, לרוב בגבול אחריות מופחת.' },
    { chapterCode: 'A', code: '3.4', nameHe: 'רכוש בזמן בנייה', nameEn: 'Property During Construction', description: 'כיסוי לרכוש מבוטח בזמן עבודות בנייה, שיפוץ או הרחבה בחצרי המבוטח. לא מחליף פוליסת עבודות קבלניות (CAR).' },
    { chapterCode: 'A', code: '3.5', nameHe: 'רכוש בהעברה', nameEn: 'Property in Transit', description: 'כיסוי לנזק לרכוש מבוטח בזמן העברה בין מיקומים, כולל טעינה ופריקה. כפוף לגבול אחריות נפרד ולתנאי אריזה נאותה.' },
    { chapterCode: 'A', code: '3.6', nameHe: 'חפצים אישיים של עובדים', nameEn: 'Employee Personal Effects', description: 'כיסוי לחפצים אישיים של עובדים הנמצאים בחצרי המבוטח שניזוקו כתוצאה מסיכון מבוטח. לא כולל מזומנים, תכשיטים ומסמכים.' },
    { chapterCode: 'A', code: '3.7', nameHe: 'רכוש שירותים ציבוריים', nameEn: 'Public Utility Property', description: 'כיסוי לנזק לציוד ותשתיות של חברות שירות ציבוריות (חשמל, מים, גז) הנמצאים בחצרי המבוטח ובאחריותו.' },
    { chapterCode: 'A', code: '3.8', nameHe: 'תוספות לרכוש', nameEn: 'Additions to Property', description: 'כיסוי אוטומטי לרכוש חדש שנרכש במהלך תקופת הביטוח, עד לאחוז מסוים מסכום הביטוח, ללא צורך בהודעה מיידית למבטח.' },
    { chapterCode: 'A', code: '3.9', nameHe: 'נזק עקיף למלאי', nameEn: 'Incidental Inventory Damage', description: 'כיסוי לנזק עקיף למלאי כתוצאה מאירוע מבוטח, כגון קלקול מזון עקב הפסקת חשמל שנגרמה משריפה.' },
    { chapterCode: 'A', code: '3.10', nameHe: 'התפוצצות חומרים חמים', nameEn: 'Hot Material Rupture', description: 'כיסוי לנזק שנגרם מהתפוצצות או פיצוץ של דודי קיטור, כלי לחץ וציוד המכיל חומרים בטמפרטורה גבוהה.' },
    { chapterCode: 'A', code: '3.11', nameHe: 'הוצאות לאחר אירוע', nameEn: 'Post-Event Expenses', description: 'החזר הוצאות סבירות שנגרמו למבוטח לאחר אירוע ביטוחי, כגון הוצאות שמירה, גידור זמני, כיבוי שריפה וניקוי.' },
    { chapterCode: 'A', code: '3.12', nameHe: 'הוצאות הכנת תביעה', nameEn: 'Claim Preparation Costs', description: 'כיסוי הוצאות רואי חשבון, שמאים ומומחים לצורך הכנת תביעת הביטוח והוכחת הנזק.' },
    { chapterCode: 'A', code: '3.13', nameHe: 'שכ"ד חלופי', nameEn: 'Alternative Rent', description: 'כיסוי דמי שכירות חלופיים כאשר המבוטח נאלץ לפנות את חצריו עקב נזק מאירוע מבוטח, לתקופה מוגבלת.' },
    { chapterCode: 'A', code: '3.14', nameHe: 'רכוש שהוצא משימוש', nameEn: 'Property Taken Out of Service', description: 'כיסוי לרכוש שאינו בשימוש פעיל אך עדיין נמצא בחצרי המבוטח, כגון ציוד מאוחסן או מכונות בהמתנה.' },
    { chapterCode: 'A', code: '3.15', nameHe: 'הגנת שם מסחרי', nameEn: 'Brand Name Protection', description: 'כיסוי הוצאות הקשורות להגנה על המותג במקרה של נזק לסחורות ממותגות, כולל הוצאות השמדת מוצרים פגומים.' },
    { chapterCode: 'A', code: '3.16', nameHe: 'קריסת מדפים', nameEn: 'Shelving Collapse', description: 'כיסוי לנזק שנגרם מקריסת מדפים, מתקני אחסון או מערכות שילוח במחסנים ובמפעלים.' },
    { chapterCode: 'A', code: '3.17', nameHe: 'שבר זכוכית', nameEn: 'Glass Breakage', description: 'כיסוי לנזק לשמשות, חלונות ראווה, מחיצות זכוכית ושלטי זכוכית מכל סיבה, כולל שבר תאונתי.' },
    { chapterCode: 'A', code: '3.18', nameHe: 'נזק ללוח חשמל', nameEn: 'Electrical Panel Damage', description: 'כיסוי לנזק ללוחות חשמל ומערכות חשמל ראשיות כתוצאה מקצר חשמלי, עומס יתר או תנודות מתח.' },
    { chapterCode: 'A', code: '3.19', nameHe: 'קריסת מבנה', nameEn: 'Massive Building Collapse', description: 'כיסוי לנזק שנגרם מקריסת מבנה או חלק ממנו, שאינו תוצאה של סיכון אחר המכוסה בפוליסה הבסיסית.' },
    { chapterCode: 'A', code: '3.20', nameHe: 'השלמה לכל הסיכונים', nameEn: 'All-Risks Completion', description: 'הרחבה הממירה את בסיס הכיסוי מ"סיכונים מפורשים" ל"כל הסיכונים" – כל נזק פיזי פתאומי ובלתי צפוי מכוסה, אלא אם הוחרג במפורש.' },
    { chapterCode: 'A', code: '3.21', nameHe: 'השבת סכום ביטוח', nameEn: 'Sum Insured Reinstatement', description: 'לאחר תשלום תביעה, סכום הביטוח מושב לגובהו המקורי באופן אוטומטי, ללא הפחתה בגין סכום התביעה ששולם.' },
    // Part B extensions
    { chapterCode: 'B', code: '10.1', nameHe: 'הפרעה בשירותים ציבוריים', nameEn: 'Public Services Disruption', description: 'כיסוי לאבדן רווחים כתוצאה מהפסקת אספקת חשמל, מים, גז או תקשורת על ידי ספקי שירות ציבוריים.' },
    { chapterCode: 'B', code: '10.2', nameHe: 'השפעה הדדית בין עסקים', nameEn: 'Mutual Business Influence', description: 'כיסוי לאבדן רווחים שנגרם לעסק אחד של המבוטח עקב נזק שאירע בעסק אחר של אותו מבוטח.' },
    { chapterCode: 'B', code: '10.3', nameHe: 'הפרעה בספקים/לקוחות', nameEn: 'Suppliers/Customers Disruption', description: 'כיסוי לאבדן רווחים שנגרם עקב נזק פיזי אצל ספק או לקוח עיקרי של המבוטח, שהשפיע על פעילות העסק.' },
    { chapterCode: 'B', code: '10.4', nameHe: 'מניעת גישה', nameEn: 'Denial of Access', description: 'כיסוי לאבדן רווחים כאשר הגישה לחצרי המבוטח נמנעת על ידי רשויות או עקב נזק לרכוש סמוך.' },
    { chapterCode: 'B', code: '10.5', nameHe: 'רכוש שאינו בבעלות', nameEn: 'Property Not Owned', description: 'כיסוי לאבדן רווחים כתוצאה מנזק לרכוש שאינו בבעלות המבוטח אך משמש את עסקו, כגון ציוד מושכר.' },
    { chapterCode: 'B', code: '10.6', nameHe: 'מכירה ממלאי', nameEn: 'Sale from Inventory', description: 'מאפשר למבוטח לצמצם את תקופת השיפוי על ידי מכירת מוצרים מתוך מלאי קיים, תוך קיזוז מסכום התביעה.' },
    { chapterCode: 'B', code: '10.7', nameHe: 'אבדן תוצאתי בנייה', nameEn: 'Construction BI', description: 'כיסוי לאבדן רווחים שנגרם עקב נזק לרכוש בזמן עבודות בנייה או שיפוץ בחצרי המבוטח.' },
    { chapterCode: 'B', code: '10.8', nameHe: 'אבדן תוצאתי העברה', nameEn: 'Transit BI', description: 'כיסוי לאבדן רווחים שנגרם עקב נזק לרכוש בזמן העברה, כאשר הנזק מונע מהמבוטח להמשיך בפעילותו.' },
    { chapterCode: 'B', code: '10.9', nameHe: 'אבדן תוצאתי קריסת מבנה', nameEn: 'Building Collapse BI', description: 'כיסוי לאבדן רווחים שנגרם כתוצאה מקריסת מבנה, כולל תקופת השיקום והבנייה מחדש.' },
    { chapterCode: 'B', code: '10.10', nameHe: 'שיפורי ציוד', nameEn: 'Equipment Improvements', description: 'כיסוי עלויות נוספות עבור שדרוג ציוד שניזוק לציוד מודרני יותר, כאשר הציוד המקורי אינו זמין עוד.' },
    { chapterCode: 'B', code: '10.11', nameHe: 'הוצאות משתנות', nameEn: 'Changed Expenses', description: 'כיסוי הוצאות חריגות שנגרמו כדי למנוע או לצמצם אבדן רווחים, כגון שעות עבודה נוספות או שכירת ציוד חלופי.' },
    { chapterCode: 'B', code: '10.12', nameHe: 'הוצאות עמידה בתקנות', nameEn: 'Compliance Costs', description: 'כיסוי עלויות נוספות הנדרשות לעמידה בתקנות ובדרישות רגולטוריות חדשות בעקבות שיקום לאחר אירוע.' },
    { chapterCode: 'B', code: '10.13', nameHe: 'קנסות חוזיים', nameEn: 'Contract Penalties', description: 'כיסוי קנסות חוזיים שהמבוטח חויב לשלם עקב עיכובים באספקה או אי-עמידה בהתחייבויות חוזיות בגלל אירוע מבוטח.' },
    { chapterCode: 'B', code: '10.14', nameHe: 'חובות בספרים פתוחים', nameEn: 'Open Book Debts', description: 'כיסוי לחובות של לקוחות שלא ניתן לגבות עקב השמדת ספרי חשבונות או מערכות מידע באירוע מבוטח.' },
    { chapterCode: 'B', code: '10.15', nameHe: 'הוצאות שונות', nameEn: 'Miscellaneous Expenses', description: 'כיסוי להוצאות שונות שאינן נכללות בהרחבות אחרות, הקשורות ישירות לאירוע המבוטח ולצמצום הנזק.' },
    { chapterCode: 'B', code: '10.16', nameHe: 'הוצאות הכנת תביעה', nameEn: 'Claim Preparation Costs', description: 'כיסוי שכר טרחת רואי חשבון ומומחים לצורך הוכחת אבדן הרווחים והכנת תביעת הביטוח.' },
    { chapterCode: 'B', code: '10.17', nameHe: 'עלויות מו"פ', nameEn: 'R&D Costs', description: 'כיסוי לעלויות מחקר ופיתוח שהושקעו בפרויקטים שניזוקו או אבדו כתוצאה מאירוע מבוטח.' },
    { chapterCode: 'B', code: '10.18', nameHe: 'סכום נוסף', nameEn: 'Additional Sum', description: 'סכום ביטוח נוסף מעבר לגבול האחריות הבסיסי, המיועד לכיסוי חריגות בלתי צפויות בהיקף הנזק.' },
    { chapterCode: 'B', code: '10.19', nameHe: 'השבת סכום ביטוח', nameEn: 'Sum Reinstatement', description: 'השבת סכום הביטוח לגובהו המקורי לאחר תשלום תביעת אבדן תוצאתי, ללא הפחתה.' },
  ],

  MECHANICAL_BREAKDOWN: [
    { code: '3.1', nameHe: 'פיצוץ/נוזלים/פקיעת צנרת', nameEn: 'Explosion/Liquid/Burst Pipe Gap', description: 'כיסוי לנזק שנגרם מפיצוץ דוד קיטור, פקיעת צנרת או דליפת נוזלים ממכונות ומערכות מכניות.' },
    { code: '3.2', nameHe: 'נזק ללוח חשמל', nameEn: 'Electrical Panel Damage', description: 'כיסוי לנזק ללוחות חשמל ומנועים חשמליים כתוצאה מקצר, עומס יתר או תנודות מתח. מרחיב את הכיסוי מעבר לתקלה מכנית טהורה.' },
    { code: '3.3', nameHe: 'הוצאות נוספות הכרחיות', nameEn: 'Additional Necessary Expenses', description: 'כיסוי עלויות נוספות הנדרשות לתיקון או החלפת ציוד, כגון שעות נוספות, משלוח אקספרס של חלפים, והובלה מיוחדת.' },
    { code: '3.4', nameHe: 'ביטוח יסודות', nameEn: 'Foundation Insurance', description: 'כיסוי לנזק ליסודות וביסוסים של מכונות כבדות, כולל עלויות חפירה, יציקה מחדש והתאמה.' },
    { code: '3.5', nameHe: 'דליפת גז תאונתית', nameEn: 'Accidental Gas Leak', description: 'כיסוי לנזק שנגרם מדליפת גז תאונתית ממערכות קירור, מיזוג אוויר או ציוד תעשייתי.' },
    { code: '3.6', nameHe: 'רכוש נוסף שנמצא בתיקון', nameEn: 'Additional Property Found in Repair', description: 'כיסוי לנזק נוסף שהתגלה במהלך תיקון התקלה המקורית, ושלא היה ניתן לזהותו ללא הפירוק.' },
    { code: '3.7', nameHe: 'נזק לרכוש סמוך/מחובר', nameEn: 'Adjacent/Connected Property Damage', description: 'כיסוי לנזק שנגרם לרכוש הסמוך למכונה שניזוקה או המחובר אליה, כתוצאה ישירה מהתקלה המכנית.' },
    { code: '3.8', nameHe: 'הוצאות התאמת ציוד', nameEn: 'Equipment Adaptation Expenses', description: 'כיסוי עלויות התאמה טכנית הנדרשות כאשר חלק חלופי אינו זהה למקורי ונדרשים שינויים בהתקנה.' },
    { code: '3.9', nameHe: 'חלקים שאינם זמינים', nameEn: 'Parts No Longer Available', description: 'כיסוי עלויות ייצור מיוחד או התאמה כאשר חלפים מקוריים אינם זמינים עוד בשוק עבור ציוד ישן.' },
    { code: '3.10', nameHe: 'תוספות לרכוש', nameEn: 'Property Additions', description: 'כיסוי אוטומטי לציוד מכני חדש שנרכש במהלך תקופת הביטוח, עד אחוז מסוים מסכום הביטוח.' },
    { code: '3.11', nameHe: 'השבת סכום ביטוח', nameEn: 'Sum Insured Reinstatement', description: 'לאחר תשלום תביעה, סכום הביטוח מושב לגובהו המקורי ללא הפחתה, תמורת תוספת פרמיה יחסית.' },
  ],

  THIRD_PARTY_LIABILITY: [
    { code: '4.1', nameHe: 'שהות זמנית בחו"ל', nameEn: 'Temporary Stay Abroad', description: 'הרחבת הכיסוי הטריטוריאלי לתביעות צד שלישי שנגרמו במהלך שהייה זמנית של המבוטח או עובדיו בחו"ל.' },
    { code: '4.2', nameHe: 'אחריות צולבת', nameEn: 'Cross Liability', description: 'כאשר יש מספר מבוטחים בפוליסה, כל מבוטח נחשב כאילו הונפקה לו פוליסה נפרדת, ותביעה של מבוטח אחד כנגד אחר מכוסה.' },
    { code: '4.3', nameHe: 'רכוש עובדים', nameEn: 'Employee Property', description: 'כיסוי לנזק שנגרם לרכוש של עובדי המבוטח (רכב, חפצים אישיים) כתוצאה מפעילות עסקית של המבוטח.' },
    { code: '4.4', nameHe: 'פעילות קבלני משנה', nameEn: 'Subcontractor Activities', description: 'הרחבת הכיסוי לתביעות צד שלישי שנגרמו על ידי קבלני משנה הפועלים מטעם המבוטח.' },
    { code: '4.5', nameHe: 'אחריות בנייה/שיפוץ', nameEn: 'Construction/Renovation Liability', description: 'כיסוי לאחריות כלפי צד שלישי בגין עבודות בנייה, שיפוץ או תחזוקה המבוצעות בחצרי המבוטח.' },
    { code: '4.6', nameHe: 'אחריות אירועים', nameEn: 'Event Liability', description: 'כיסוי לאחריות כלפי צד שלישי במהלך אירועים מיוחדים שמארגן המבוטח, כגון ימי פתוח, כנסים ותערוכות.' },
    { code: '4.7', nameHe: 'נזק רכוש מכלי רכב', nameEn: 'Motor Vehicle Property Damage', defaultLimit: 2000000, description: 'כיסוי לנזק לרכוש צד שלישי שנגרם על ידי כלי רכב בחצרי המבוטח (לא בכביש ציבורי), עד לגבול אחריות מוגדר.' },
    { code: '4.8', nameHe: 'פגיעה אישית', nameEn: 'Personal Injury', defaultLimit: 200000, description: 'כיסוי לתביעות בגין לשון הרע, פגיעה בפרטיות, מעצר שווא והסגת גבול שנגרמו על ידי המבוטח כלפי צד שלישי.' },
    { code: '4.9', nameHe: 'מניעת גישה', nameEn: 'Prevention of Access', description: 'כיסוי לתביעות צד שלישי בגין חסימת גישה לרכושם כתוצאה מפעילות המבוטח.' },
    { code: '4.10', nameHe: 'אחריות שילוחית', nameEn: 'Vicarious Liability', description: 'כיסוי לאחריות המבוטח כמעסיק או כמזמין עבודה עבור מעשים או מחדלים של עובדיו או קבלניו.' },
    { code: '4.11', nameHe: 'הרעלת מזון', nameEn: 'Food Poisoning', description: 'כיסוי לתביעות צד שלישי הנובעות מהרעלת מזון שסופק או הוכן על ידי המבוטח, כולל במסגרת מפעל הזנה לעובדים.' },
    { code: '4.12', nameHe: 'אחריות אישית של עובד', nameEn: 'Employee Personal Liability', description: 'הרחבת הכיסוי לאחריות אישית של עובדי המבוטח כלפי צד שלישי במסגרת מילוי תפקידם.' },
    { code: '4.13', nameHe: 'ויתור על שיבוב', nameEn: 'Waiver of Subrogation', description: 'המבטח מוותר על זכותו לחזור בתביעת שיבוב כנגד צדדים שלישיים מסוימים, כגון שוכרים, ספקים או קבלנים.' },
    { code: '4.14', nameHe: 'צד שלישי שהמבוטח התחייב', nameEn: 'Third Party Insured Obligated', description: 'הרחבת רשימת המבוטחים לכלול צדדים שלישיים שהמבוטח התחייב חוזית לבטח, כגון בעלי נכסים מושכרים.' },
    { code: '4.15', nameHe: 'כלי נשק', nameEn: 'Weapons', description: 'כיסוי לנזק שנגרם לצד שלישי כתוצאה משימוש בכלי נשק על ידי מאבטחים או שומרים בשירות המבוטח.' },
    { code: '4.16', nameHe: 'הגנה פלילית/מנהלית', nameEn: 'Criminal/Admin Defense', description: 'כיסוי הוצאות הגנה משפטית בהליכים פליליים או מנהליים שהוגשו כנגד המבוטח בקשר לאירוע מכוסה.' },
  ],

  EMPLOYERS_LIABILITY: [
    { code: '4.1', nameHe: 'שהות זמנית בחו"ל', nameEn: 'Temporary Stay Abroad', description: 'הרחבת הכיסוי לתביעות עובדים שנפגעו במהלך שהייה זמנית בחו"ל במסגרת עבודתם.' },
    { code: '4.2', nameHe: 'עובדים בחוזים מיוחדים', nameEn: 'Special Contract Employees', description: 'כיסוי לתביעות עובדים המועסקים באמצעות חוזים מיוחדים, כגון עובדי קבלן כוח אדם, עובדים זמניים ומתמחים.' },
    { code: '4.3', nameHe: 'פעילויות הקשורות לעבודה', nameEn: 'Work-Related Activities', description: 'כיסוי לתביעות בגין פגיעות שנגרמו במהלך פעילויות קשורות לעבודה מחוץ לחצרי המעסיק, כגון אירועי חברה וכנסים.' },
    { code: '4.4', nameHe: 'אחריות אישית של עובד', nameEn: 'Employee Personal Liability', description: 'הרחבת הכיסוי לאחריות אישית של עובדים בכירים שנתבעים אישית בגין תאונת עבודה של עובד אחר.' },
    { code: '4.5', nameHe: 'כלי נשק', nameEn: 'Weapons', description: 'כיסוי לפגיעת עובד שנגרמה כתוצאה משימוש בכלי נשק על ידי מאבטח או שומר במסגרת תפקידו.' },
    { code: '4.6', nameHe: 'קבלנים/קבלני משנה ועובדיהם', nameEn: 'Contractors/Subcontractors & Workers', description: 'הרחבת הגדרת "עובד" לכלול עובדי קבלנים וקבלני משנה הפועלים בחצרי המבוטח או מטעמו.' },
    { code: '4.7', nameHe: 'עובדי שטחים מוחזקים', nameEn: 'Held Territories Employees', description: 'כיסוי לתביעות עובדים תושבי השטחים המוחזקים, הנדרש בשל מורכבות משפטית מיוחדת.' },
    { code: '4.8', nameHe: 'בעלי שליטה בשכר', nameEn: 'Controlling Shareholders on Payroll', description: 'הרחבת הגדרת "עובד" לכלול בעלי שליטה ומנהלים בכירים המקבלים שכר מהחברה, לצורך כיסוי תביעות מעבידים.' },
    { code: '4.9', nameHe: 'צד שלישי שהתחייב לבטח', nameEn: 'Third Party Required to Be Insured', description: 'הרחבת רשימת המבוטחים לכלול צדדים שלישיים שהמבוטח התחייב חוזית לכלול בביטוח מעבידים.' },
    { code: '4.10', nameHe: 'פגיעה אישית', nameEn: 'Personal Injury', defaultLimit: 200000, description: 'כיסוי לתביעות עובדים בגין פגיעה אישית שאינה תאונת עבודה קלאסית, כגון הטרדה או פגיעה בפרטיות.' },
    { code: '4.11', nameHe: 'הגנה פלילית/מנהלית', nameEn: 'Criminal/Admin Defense', description: 'כיסוי הוצאות הגנה משפטית בהליכים פליליים או מנהליים בגין תאונת עבודה, כולל ייצוג בפני משרד העבודה.' },
    { code: '4.12', nameHe: 'ויתור על שיבוב', nameEn: 'Waiver of Subrogation', description: 'המבטח מוותר על זכותו לחזור בתביעת שיבוב כנגד צדדים שלישיים מסוימים שהמבוטח התחייב כלפיהם חוזית.' },
  ],

  PRODUCT_LIABILITY: [
    { code: '4.1', nameHe: 'הרחבת מפיצים', nameEn: 'Vendors Endorsement', description: 'הרחבת הכיסוי לכלול מפיצים, סוכנים וקמעונאים המוכרים את מוצרי המבוטח כמבוטחים נוספים בפוליסה.' },
    { code: '4.2', nameHe: 'תקופת גילוי', nameEn: 'Run-off/Discovery Period', description: 'תקופה נוספת לאחר סיום הפוליסה שבמהלכה ניתן לדווח על תביעות בגין אירועים שקרו בתקופת הביטוח. חיונית בפוליסת claims-made.' },
    { code: '4.3', nameHe: 'אחריות צולבת', nameEn: 'Cross Liability', description: 'כל מבוטח בפוליסה נחשב כאילו הונפקה לו פוליסה נפרדת, ותביעה של מבוטח אחד כנגד אחר מכוסה.' },
    { code: '4.4', nameHe: 'הגנה פלילית/מנהלית', nameEn: 'Criminal/Admin Defense', description: 'כיסוי הוצאות הגנה משפטית בהליכים פליליים או מנהליים שהוגשו כנגד המבוטח בקשר למוצר פגום.' },
    { code: '4.5', nameHe: 'פגיעה אישית', nameEn: 'Personal Injury', defaultLimit: 200000, description: 'כיסוי לתביעות בגין לשון הרע, פגיעה בפרטיות ופגיעות אישיות שאינן נזק גוף הנובעות מהמוצר.' },
    { code: '4.6', nameHe: 'עבודות שבוצעו', nameEn: 'Work Performed by Insured (completed operations)', description: 'כיסוי לתביעות הנובעות מעבודות שהושלמו ונמסרו ללקוח, לאחר שהמבוטח סיים את מעורבותו הישירה.' },
  ],

  CASH_MONEY: [
    { code: '3.1', nameHe: 'כספים בבית מנהלים', nameEn: 'Money at Managers\'/Staff Homes', description: 'כיסוי לכספים ולשטרות ערך הנמצאים באופן זמני בבית מנהלים או עובדים מורשים, בכפוף לתנאי אחסון.' },
    { code: '3.2', nameHe: 'כלי כתב רשומים בדואר/מונית/שליח', nameEn: 'Registered Instruments by Mail/Taxi/Courier', description: 'כיסוי לאובדן כלי כתב ערכיים (שיקים, שטרות) הנשלחים בדואר רשום, במונית או עם שליח.' },
    { code: '3.3', nameHe: 'זיוף שיקים גנובים', nameEn: 'Forgery of Stolen Blank Checks', defaultLimit: 50000, isFirstLoss: true, description: 'כיסוי להפסד שנגרם מזיוף שיקים ריקים שנגנבו מהמבוטח. כיסוי על בסיס First Loss עד לגבול המוגדר.' },
    { code: '3.4', nameHe: 'נזק לכספת', nameEn: 'Damage to Safe', description: 'כיסוי לנזק פיזי לכספות ולארונות ביטחון כתוצאה מניסיון פריצה או גניבה, כולל עלויות תיקון או החלפה.' },
  ],

  FIDELITY_CRIME: [
    { code: '4', nameHe: 'תקופת גילוי', nameEn: 'Discovery Period Extension', description: 'תקופה נוספת לאחר סיום הפוליסה שבמהלכה ניתן לדווח על מעילות שבוצעו בתקופת הביטוח אך התגלו מאוחר יותר.' },
  ],

  CARGO_IN_TRANSIT: [
    { code: '3.1', nameHe: 'אובדן יחידה שלמה', nameEn: 'Loss of Complete Unit', description: 'כיסוי לאובדן יחידה שלמה של סחורה (למשל מכולה או משטח) כאשר לא ניתן לאתר אותה, גם ללא ראיה לנזק פיזי. מאפשר תביעה על בסיס היעלמות.' },
    { code: '3.2', nameHe: 'משלוחי יצוא/יבוא', nameEn: 'Export/Import Shipments', description: 'הרחבת הכיסוי הטריטוריאלי למשלוחים בינלאומיים – יצוא ויבוא. כולל כיסוי במהלך הובלה ימית, אווירית ויבשתית בין מדינות, בכפוף לתנאי ICC.' },
    { code: '3.3', nameHe: 'הגנת מותג/הצלה', nameEn: 'Brand Protection/Salvage', description: 'כיסוי עלויות השמדת סחורה ממותגת שניזוקה כדי למנוע פגיעה במוניטין המותג, במקום מכירתה כסלבג\' (salvage). כולל הוצאות השמדה מבוקרת.' },
  ],

  TERRORISM: [
    // No standard extensions listed
  ],

  ELECTRONIC_EQUIPMENT: [
    // Chapter 1 extensions
    { chapterCode: '1', code: '4.1', nameHe: 'תקלת מערכת מיזוג', nameEn: 'AC System Failure', description: 'כיסוי לנזק לציוד אלקטרוני שנגרם כתוצאה מכשל במערכת מיזוג האוויר בחדר השרתים או באזור הציוד.' },
    { chapterCode: '1', code: '4.2', nameHe: 'הוצאות פינוי הריסות', nameEn: 'Debris Removal Costs', description: 'כיסוי עלויות פינוי שרידי ציוד אלקטרוני שניזוק, כולל טיפול בחומרים מסוכנים ופסולת אלקטרונית.' },
    { chapterCode: '1', code: '4.3', nameHe: 'הוצאות נוספות הכרחיות', nameEn: 'Necessary Additional Expenses', defaultLimit: 400000, description: 'כיסוי הוצאות חריגות לתיקון או החלפת ציוד, כגון שעות נוספות, הובלה מיוחדת ושכירת ציוד חלופי.' },
    { chapterCode: '1', code: '4.4', nameHe: 'נזק נוסף במהלך תיקון', nameEn: 'Additional Damage During Repair', description: 'כיסוי לנזק שנגרם לציוד במהלך ניסיון תיקון, כולל נזק שנגרם בטעות על ידי טכנאי או כתוצאה מפירוק.' },
    { chapterCode: '1', code: '4.5', nameHe: 'נזק לרכוש סמוך', nameEn: 'Damage to Adjacent Property', defaultLimit: 60000, description: 'כיסוי לנזק לציוד או רכוש הסמוך לציוד האלקטרוני שניזוק, כתוצאה ישירה מהתקלה.' },
    { chapterCode: '1', code: '4.6', nameHe: 'הוצאות התאמת ציוד', nameEn: 'Equipment Adaptation Expenses', defaultLimit: 160000, description: 'כיסוי עלויות התאמה כאשר ציוד חלופי אינו זהה למקורי ונדרשים שינויים בחיבור, תוכנה או תשתית.' },
    { chapterCode: '1', code: '4.7', nameHe: 'חלקים מיושנים', nameEn: 'Obsolete Parts', defaultLimit: 160000, description: 'כיסוי עלויות ייצור או התאמה מיוחדת כאשר רכיבים אלקטרוניים מקוריים אינם מיוצרים עוד.' },
    { chapterCode: '1', code: '4.8', nameHe: 'תוספות לרכוש מבוטח', nameEn: 'Additions to Insured Property', description: 'כיסוי אוטומטי לציוד אלקטרוני חדש שנרכש במהלך תקופת הביטוח, עד אחוז מסוים מסכום הביטוח.' },
    { chapterCode: '1', code: '4.9', nameHe: 'הוצאות התאמת תוכנה', nameEn: 'Software Adaptation Expenses', defaultLimit: 80000, description: 'כיסוי עלויות התקנה והתאמה מחדש של תוכנות לאחר החלפת ציוד, כולל רישוי, קונפיגורציה ובדיקות.' },
    { chapterCode: '1', code: '4.10', nameHe: 'השבת סכום ביטוח', nameEn: 'Sum Insured Reinstatement', description: 'השבת סכום הביטוח לגובהו המקורי לאחר תשלום תביעה, ללא הפחתה בגין סכום ששולם.' },
    // Chapter 4 extensions
    { chapterCode: '4', code: '18.1', nameHe: 'השפעה בין-עסקית', nameEn: 'Inter-Business Impact', description: 'כיסוי לאבדן רווחים שנגרם לעסק אחד של המבוטח עקב תקלת ציוד אלקטרוני בעסק אחר של אותו מבוטח.' },
    { chapterCode: '4', code: '18.2', nameHe: 'שיפורי ציוד', nameEn: 'Equipment Improvements', description: 'כיסוי עלויות שדרוג ציוד לדגם מתקדם יותר כאשר הדגם המקורי אינו זמין עוד בשוק.' },
    { chapterCode: '4', code: '18.3', nameHe: 'פיצוי הפרת חוזה', nameEn: 'Breach of Contract Compensation', description: 'כיסוי לקנסות חוזיים ופיצויים שהמבוטח נדרש לשלם עקב אי-עמידה בהתחייבויות בגלל תקלת ציוד אלקטרוני.' },
    { chapterCode: '4', code: '18.4', nameHe: 'חובות בספרים', nameEn: 'Outstanding Debts (Book Debts)', description: 'כיסוי לחובות לקוחות שלא ניתן לגבות עקב אובדן נתוני חשבוניות ומערכות הנהלת חשבונות.' },
    { chapterCode: '4', code: '18.5', nameHe: 'הוצאות הכנת תביעה', nameEn: 'Claim Preparation Costs', description: 'כיסוי שכר טרחת מומחים לצורך הוכחת אבדן הרווחים והכנת תביעת הביטוח.' },
    { chapterCode: '4', code: '18.6', nameHe: 'השבת סכום ביטוח', nameEn: 'Sum Insured Reinstatement', description: 'השבת סכום ביטוח אבדן הרווחים לגובהו המקורי לאחר תשלום תביעה.' },
  ],

  HEAVY_ENGINEERING_EQUIPMENT: [
    { code: '3.1', nameHe: 'גניבה, פריצה ושוד', nameEn: 'Theft, Burglary & Robbery', defaultLimit: 20000, description: 'כיסוי לגניבה, פריצה או שוד של ציוד הנדסי כבד או חלקים ממנו. כפוף לאמצעי מיגון ותנאי אחסון כנדרש בפוליסה.' },
    { code: '3.2', nameHe: 'הוצאות חילוץ, גרירה והעברה', nameEn: 'Salvage, Towing & Transport', defaultLimit: 20000, isFirstLoss: true, description: 'כיסוי על בסיס First Loss להוצאות חילוץ ציוד כבד שנתקע, גרירתו ממקום התקלה והעברתו למוסך או לאתר אחר.' },
    { code: '3.3', nameHe: 'השבה לקדמות', nameEn: 'Reinstatement of Sum Insured', description: 'השבת סכום הביטוח לגובהו המקורי לאחר תשלום תביעה, כך שהציוד ממשיך להיות מבוטח במלוא ערכו.' },
    { code: '3.4', nameHe: 'הוצאות נוספות הכרחיות', nameEn: 'Additional Necessary Expenses', isFirstLoss: true, description: 'כיסוי על בסיס First Loss להוצאות חריגות הנדרשות לתיקון הציוד, כגון הובלה מיוחדת, מנוף ושעות עבודה נוספות.' },
  ],

  CONTRACTOR_WORKS_CAR: [
    // Chapter A extensions
    { chapterCode: 'A', code: '3.1', nameHe: 'גניבה/פריצה', nameEn: 'Theft/Burglary', description: 'כיסוי לגניבה ופריצה של חומרי בנייה, ציוד וכלים באתר הבנייה. כפוף לאמצעי מיגון ושמירה כנדרש.' },
    { chapterCode: 'A', code: '3.2', nameHe: 'רכוש בעבודה', nameEn: 'Property Being Worked Upon', description: 'כיסוי לנזק שנגרם לרכוש קיים שעליו או בסמוך אליו מבוצעות עבודות הבנייה, כגון מבנה קיים בשיפוץ.' },
    { chapterCode: 'A', code: '3.3', nameHe: 'רכוש סמוך/קרוב', nameEn: 'Adjacent/Nearby Property', description: 'כיסוי לנזק שנגרם לרכוש של צדדים שלישיים הסמוך לאתר הבנייה כתוצאה ישירה מעבודות הפרויקט.' },
    { chapterCode: 'A', code: '3.4', nameHe: 'רכוש בהעברה', nameEn: 'Property in Transit', description: 'כיסוי לנזק לחומרי בנייה וציוד בזמן הובלה מהספק לאתר או בין אתרים, כולל טעינה ופריקה.' },
    { chapterCode: 'A', code: '3.5', nameHe: 'מבנים נלווים וציוד קל', nameEn: 'Auxiliary Buildings & Light Equipment', defaultLimit: 40000, description: 'כיסוי למבנים זמניים באתר (קרוואנים, מחסנים) ולציוד קל כגון כלי עבודה, פיגומים וגידור.' },
    { chapterCode: 'A', code: '3.6.1', nameHe: 'הוצאות פינוי הריסות', nameEn: 'Debris Removal Costs', description: 'כיסוי עלויות פינוי הריסות ופסולת בנייה מאתר שניזוק, כולל הובלה לאתר פסולת מורשה.' },
    { chapterCode: 'A', code: '3.6.2', nameHe: 'שכר אדריכלים/מומחים', nameEn: 'Architects\'/Professionals\' Fees', description: 'כיסוי שכר טרחת אדריכלים, מהנדסים ויועצים מקצועיים הנדרשים לתכנון מחדש של חלקי הפרויקט שניזוקו.' },
    { chapterCode: 'A', code: '3.6.3', nameHe: 'שינויים נדרשי רשות', nameEn: 'Authority-Required Modifications', description: 'כיסוי עלויות נוספות הנדרשות לעמידה בדרישות רגולטוריות חדשות שנכנסו לתוקף בין מועד הנזק לבין השיקום.' },
    { chapterCode: 'A', code: '3.6.4', nameHe: 'הוצאות נוספות הכרחיות', nameEn: 'Necessary Additional Expenses', description: 'כיסוי להוצאות חריגות הנדרשות להאצת תיקון הנזק, כגון עבודה בשעות נוספות, משלוח אקספרס חומרים ושכירת ציוד מיוחד.' },
    { chapterCode: 'A', code: '3.7', nameHe: 'השבת סכום ביטוח', nameEn: 'Reinstatement of Sum Insured', description: 'השבת סכום הביטוח לגובהו המקורי לאחר תשלום תביעה, כך שהפרויקט ממשיך להיות מבוטח במלוא ערכו.' },
    // Chapter B extensions
    { chapterCode: 'B', code: '7.1', nameHe: 'אחריות צולבת', nameEn: 'Cross Liability', description: 'כל מבוטח בפוליסה (מזמין, קבלן ראשי, קבלני משנה) נחשב כאילו הונפקה לו פוליסה נפרדת. חיוני בפרויקטים עם מספר שותפים.' },
    { chapterCode: 'B', code: '7.2', nameHe: 'פריטים תת-קרקעיים/תשתיות', nameEn: 'Underground Items/Utilities Liability', description: 'כיסוי לאחריות בגין נזק לתשתיות תת-קרקעיות (צנרת, כבלים, ביוב) שנגרם במהלך עבודות חפירה ובנייה.' },
    { chapterCode: 'B', code: '7.3', nameHe: 'רעידות/החלשת תמיכה', nameEn: 'Vibration/Support Weakening', defaultLimit: 4000000, description: 'כיסוי לאחריות בגין נזק למבנים סמוכים שנגרם מרעידות, הדפים או החלשת תמיכה כתוצאה מעבודות כיפון, חפירה או דפיקת כלונסאות.' },
    { chapterCode: 'B', code: '7.4', nameHe: 'נזק רכוש מכלי רכב באתר', nameEn: 'Motor Vehicle Property Damage on Site', defaultLimit: 2000000, description: 'כיסוי לנזק לרכוש צד שלישי שנגרם על ידי כלי רכב ומשאיות הפועלים בתוך אתר הבנייה.' },
    { chapterCode: 'B', code: '7.5', nameHe: 'נזקי גוף מציוד כבד', nameEn: 'Bodily Injury from Heavy Equipment', description: 'כיסוי לתביעות נזקי גוף שנגרמו לצד שלישי כתוצאה מהפעלת ציוד הנדסי כבד (מנופים, באגרים, חופרים) באתר.' },
    { chapterCode: 'B', code: '7.6', nameHe: 'אחריות כלי נשק', nameEn: 'Weapons Liability', description: 'כיסוי לנזק שנגרם לצד שלישי כתוצאה משימוש בכלי נשק על ידי מאבטחי אתר הבנייה.' },
    { chapterCode: 'B', code: '7.7', nameHe: 'שהות זמנית בחו"ל', nameEn: 'Temporary Stay Abroad', description: 'הרחבת הכיסוי הטריטוריאלי לאחריות צד שלישי במהלך שהייה זמנית בחו"ל הקשורה לפרויקט.' },
    // Chapter C extensions
    { chapterCode: 'C', code: '11.1', nameHe: 'שהות זמנית בחו"ל', nameEn: 'Temporary Stay Abroad', description: 'כיסוי לתביעות עובדים שנפגעו במהלך נסיעת עבודה לחו"ל הקשורה לפרויקט הבנייה.' },
    { chapterCode: 'C', code: '11.2', nameHe: 'עובדי חוזים מיוחדים', nameEn: 'Special Contract Workers', description: 'הרחבת הגדרת "עובד" לכלול עובדי כוח אדם, עובדים זמניים ומתמחים המועסקים באתר הבנייה.' },
    { chapterCode: 'C', code: '11.3', nameHe: 'פעילויות קשורות לעבודה', nameEn: 'Work-Related Activities', description: 'כיסוי לפגיעות עובדים במהלך פעילויות קשורות לעבודה מחוץ לאתר, כגון הדרכות בטיחות ופגישות.' },
    { chapterCode: 'C', code: '11.4', nameHe: 'אחריות אישית של עובד', nameEn: 'Individual Worker\'s Liability', description: 'הרחבת הכיסוי לאחריות אישית של מנהלי עבודה ועובדים בכירים שנתבעים אישית בגין תאונת עבודה.' },
    { chapterCode: 'C', code: '11.5', nameHe: 'כלי נשק', nameEn: 'Weapons', description: 'כיסוי לפגיעת עובד שנגרמה כתוצאה משימוש בכלי נשק על ידי מאבטח באתר הבנייה.' },
    { chapterCode: 'C', code: '11.6', nameHe: 'אחריות לקבלנים/קב"מ ועובדיהם', nameEn: 'Liability to Contractors/Subcontractors & Workers', description: 'הרחבת הגדרת "עובד" לכלול עובדי קבלנים וקבלני משנה הפועלים באתר, לצורך כיסוי תביעות מעבידים.' },
    { chapterCode: 'C', code: '11.7', nameHe: 'עובדי שטחים מוחזקים', nameEn: 'Workers from Held Territories', description: 'כיסוי לתביעות עובדי בנייה תושבי השטחים המוחזקים, הנדרש בשל מורכבות משפטית מיוחדת.' },
    { chapterCode: 'C', code: '11.8', nameHe: 'אחריות לבעלי שליטה', nameEn: 'Liability to Controlling Persons', description: 'הרחבת הכיסוי לבעלי שליטה ומנהלים בחברת הבנייה המקבלים שכר ופועלים כעובדים באתר.' },
    { chapterCode: 'C', code: '11.9', nameHe: 'צד שלישי שהתחייב לבטח', nameEn: 'Third Party Insured Obligated', description: 'הרחבת רשימת המבוטחים לכלול צדדים שהקבלן התחייב חוזית לכלול בביטוח מעבידים, כגון מזמין העבודה.' },
  ],
};

// ============================================================
// EXCLUSIONS PER PRODUCT
// ============================================================

const exclusionsByProduct: Record<string, ExclusionSeed[]> = {
  FIRE_CONSEQUENTIAL_LOSS: [
    { nameEn: 'Consequential loss (Part A)', nameHe: 'אבדן תוצאתי (חלק א)', isGeneral: true, description: 'חלק א (רכוש) אינו מכסה אבדן רווחים או נזק תוצאתי. כיסוי זה ניתן רק בחלק ב של הפוליסה.' },
    { nameEn: 'Electrical installation damage', nameHe: 'נזק למתקן חשמלי', isGeneral: true, description: 'נזק למתקנים חשמליים הנגרם מקצר חשמלי פנימי מוחרג, אלא אם הנזק גרם לשריפה בפועל.' },
    { nameEn: 'Marine-insured property', nameHe: 'רכוש מבוטח ימי', isGeneral: true, description: 'רכוש המכוסה תחת פוליסת ביטוח ימי מוחרג כדי למנוע כפל ביטוח.' },
    { nameEn: 'Government-ordered damage', nameHe: 'נזק בהוראת ממשלה', isGeneral: true, description: 'נזק שנגרם בהוראת רשות ממשלתית, כגון הריסה בצו עירייה, אינו מכוסה.' },
    { nameEn: 'Nuclear risks', nameHe: 'סיכונים גרעיניים', isGeneral: true, description: 'חריג סטנדרטי לנזק שנגרם מקרינה גרעינית, זיהום רדיואקטיבי או תאונה גרעינית.' },
    { nameEn: 'War/terrorism', nameHe: 'מלחמה/טרור', isGeneral: true, description: 'נזקי מלחמה, פעולות איבה וטרור מוחרגים. כיסוי טרור ניתן בפוליסה נפרדת או כהרחבה בתשלום נוסף.' },
    { nameEn: 'Earthquake (unless purchased)', nameHe: 'רעידת אדמה (אלא אם נרכש)', isGeneral: true, description: 'נזקי רעידת אדמה מוחרגים כברירת מחדל. ניתן לרכוש כיסוי בתוספת פרמיה, בכפוף להשתתפות עצמית גבוהה.' },
    { nameEn: 'Pollution (unless from insured peril)', nameHe: 'זיהום (אלא אם מסיכון מבוטח)', isGeneral: true, description: 'זיהום סביבתי מוחרג, אלא אם הזיהום נגרם ישירות מסיכון מבוטח (למשל דליפה כתוצאה משריפה).' },
    { nameEn: 'Gross negligence', nameHe: 'רשלנות חמורה', isGeneral: true, description: 'נזק שנגרם כתוצאה מרשלנות חמורה מצד המבוטח, כגון אי-תחזוקה מכוונת או התעלמות מסיכונים ידועים.' },
    { nameEn: 'Intangible property/data', nameHe: 'רכוש לא מוחשי/מידע', isGeneral: true, description: 'הפוליסה מכסה רכוש פיזי בלבד. רכוש לא מוחשי כגון נתונים דיגיטליים, תוכנות, מוניטין וקניין רוחני מוחרגים.' },
  ],

  MECHANICAL_BREAKDOWN: [
    { nameEn: 'Fire policy perils (complementary)', nameHe: 'סיכוני פוליסת אש (משלים)', isGeneral: true, description: 'סיכונים המכוסים בפוליסת אש (שריפה, ברק, התפוצצות) מוחרגים כדי למנוע כפל ביטוח. הפוליסות משלימות זו את זו.' },
    { nameEn: 'Consequential loss', nameHe: 'אבדן תוצאתי', isGeneral: true, description: 'הפוליסה מכסה נזק פיזי למכונות בלבד. אבדן רווחים, עיכובים בייצור ונזק תוצאתי אינם מכוסים.' },
    { nameEn: 'Overload/experimental use', nameHe: 'עומס יתר/שימוש ניסיוני', isGeneral: true, description: 'נזק שנגרם מהפעלת ציוד מעבר לקיבולת המתוכננת או משימוש ניסיוני שלא אושר על ידי היצרן.' },
    { nameEn: 'Manufacturer/supplier warranty', nameHe: 'אחריות יצרן/ספק', isGeneral: true, description: 'נזק המכוסה באחריות יצרן או ספק מוחרג. על המבוטח לפנות תחילה ליצרן/ספק למימוש האחריות.' },
    { nameEn: 'Pre-existing defects', nameHe: 'פגמים קיימים', isGeneral: true, description: 'פגמים שהיו קיימים במכונה לפני תחילת הביטוח מוחרגים, כולל פגמי ייצור שלא התגלו.' },
    { nameEn: 'Consumables/spare parts', nameHe: 'מתכלים/חלפים', isGeneral: true, description: 'חלקים מתכלים הדורשים החלפה תקופתית (סרטים, פילטרים, שמנים, רצועות) אינם מכוסים – אלה הוצאות תחזוקה שוטפות.' },
    { nameEn: 'Wear/corrosion/deterioration', nameHe: 'בלאי/קורוזיה/התדרדרות', isGeneral: true, description: 'בלאי טבעי, קורוזיה הדרגתית והתדרדרות מצב הציוד עם הזמן אינם אירוע ביטוחי אלא תהליך צפוי.' },
    { nameEn: 'War/terrorism', nameHe: 'מלחמה/טרור', isGeneral: true, description: 'נזקי מלחמה, פעולות איבה וטרור מוחרגים. כיסוי טרור ניתן בפוליסה נפרדת.' },
    { nameEn: 'Theft', nameHe: 'גניבה', isGeneral: true, description: 'גניבת מכונות או חלקים מהן מוחרגת מפוליסת שבר מכני. כיסוי גניבה ניתן בפוליסת רכוש/אש.' },
    { nameEn: 'Gross negligence', nameHe: 'רשלנות חמורה', isGeneral: true, description: 'נזק שנגרם מרשלנות חמורה, כגון הפעלת ציוד ללא תחזוקה נדרשת או בניגוד להוראות היצרן.' },
  ],

  THIRD_PARTY_LIABILITY: [
    { nameEn: 'Employee injury', nameHe: 'פגיעת עובד', isGeneral: true, description: 'פגיעת עובד מכוסה בפוליסת אחריות מעבידים (EL) נפרדת ומוחרגת מפוליסת צד שלישי כדי למנוע כפל.' },
    { nameEn: 'Motor vehicle liability', nameHe: 'אחריות כלי רכב', isGeneral: true, description: 'אחריות בגין שימוש בכלי רכב בכביש ציבורי מכוסה בביטוח חובה ומקיף, ומוחרגת מפוליסת צד שלישי.' },
    { nameEn: 'Product liability', nameHe: 'אחריות מוצר', isGeneral: true, description: 'תביעות בגין מוצרים פגומים דורשות פוליסת אחריות מוצר נפרדת, ומוחרגות מפוליסת צד שלישי כללית.' },
    { nameEn: 'Professional liability', nameHe: 'אחריות מקצועית', isGeneral: true, description: 'תביעות בגין רשלנות מקצועית (ייעוץ, תכנון, טיפול) דורשות פוליסת אחריות מקצועית ומוחרגות מכאן.' },
    { nameEn: 'D&O liability', nameHe: 'אחריות נושאי משרה', isGeneral: true, description: 'אחריות דירקטורים ונושאי משרה בגין החלטות ניהוליות מכוסה בפוליסת D&O נפרדת.' },
    { nameEn: 'Pollution (unless sudden/accidental)', nameHe: 'זיהום (אלא אם פתאומי)', isGeneral: true, description: 'זיהום סביבתי הדרגתי מוחרג. רק זיהום פתאומי ובלתי צפוי שנגרם מאירוע תאונתי מכוסה.' },
    { nameEn: 'Property in custody', nameHe: 'רכוש בהחזקה', isGeneral: true, description: 'נזק לרכוש של צד שלישי הנמצא בהחזקת, בשליטת או בפיקוח המבוטח מוחרג (נחשב כרכוש "שבידיים").' },
    { nameEn: 'Contractual liability', nameHe: 'אחריות חוזית', isGeneral: true, description: 'אחריות שהמבוטח קיבל על עצמו בחוזה מעבר לאחריותו על פי דין, מוחרגת אלא אם הורחבה במפורש.' },
    { nameEn: 'Nuclear/Radiation/EMF', nameHe: 'גרעיני/קרינה', isGeneral: true, description: 'חריג סטנדרטי לנזק שנגרם מקרינה גרעינית, רדיואקטיבית או שדות אלקטרומגנטיים.' },
    { nameEn: 'War/terrorism', nameHe: 'מלחמה/טרור', isGeneral: true, description: 'נזקי מלחמה, פעולות איבה וטרור מוחרגים מכל פוליסות האחריות.' },
    { nameEn: 'Punitive damages', nameHe: 'פיצויים עונשיים', isGeneral: true, description: 'פיצויים עונשיים או דוגמתיים שנפסקו על ידי בית משפט אינם מכוסים – רק פיצויים ממשיים (compensatory).' },
    { nameEn: 'Asbestos', nameHe: 'אסבסט', isGeneral: true, description: 'תביעות הקשורות לחשיפה לאסבסט מוחרגות בשל אופיין ארוך הטווח והעלויות הגבוהות הכרוכות בהן.' },
    { nameEn: 'Gross negligence', nameHe: 'רשלנות חמורה', isGeneral: true, description: 'נזק שנגרם כתוצאה מרשלנות חמורה או מעשה מכוון של המבוטח אינו מכוסה.' },
    { nameEn: 'Pure financial loss', nameHe: 'נזק כספי טהור', isGeneral: true, description: 'הפסד כספי שאינו נובע מנזק גוף או רכוש פיזי מוחרג. נדרשת פוליסת אחריות מקצועית לכיסוי זה.' },
  ],

  EMPLOYERS_LIABILITY: [
    { nameEn: 'Contractual liability', nameHe: 'אחריות חוזית', isGeneral: true, description: 'אחריות חוזית שהמעסיק קיבל על עצמו מעבר לחובתו על פי דין כלפי עובדיו, מוחרגת.' },
    { nameEn: 'National Insurance default claims', nameHe: 'תביעות ביטוח לאומי', isGeneral: true, description: 'תביעות שיבוב של ביטוח לאומי כנגד המעסיק בגין גמלאות ששולמו לעובד מוחרגות בחלק מהמקרים.' },
    { nameEn: 'Asbestos/Silicone/Silicosis', nameHe: 'אסבסט/סיליקון/סיליקוזיס', isGeneral: true, description: 'תביעות בגין מחלות מקצוע הקשורות לחשיפה ממושכת לאסבסט, סיליקון וסיליקוזיס מוחרגות.' },
    { nameEn: 'War/terrorism', nameHe: 'מלחמה/טרור', isGeneral: true, description: 'פגיעת עובד כתוצאה ממלחמה או פעולות איבה מוחרגת. עובדים שנפגעו בפיגוע זכאים לפיצוי מקרנות ממשלתיות.' },
    { nameEn: 'Nuclear/Radiation/EMF', nameHe: 'גרעיני/קרינה', isGeneral: true, description: 'פגיעת עובד כתוצאה מחשיפה לקרינה גרעינית או רדיואקטיבית מוחרגת.' },
    { nameEn: 'Motor vehicle road accidents', nameHe: 'תאונות דרכים', isGeneral: true, description: 'תאונות דרכים מכוסות בחוק הפיצויים לנפגעי תאונות דרכים וביטוח חובה, ומוחרגות מפוליסת מעבידים.' },
    { nameEn: 'Punitive damages', nameHe: 'פיצויים עונשיים', isGeneral: true, description: 'פיצויים עונשיים שנפסקו כנגד המעסיק אינם מכוסים – רק פיצויים ממשיים בגין הנזק.' },
    { nameEn: 'Gross negligence', nameHe: 'רשלנות חמורה', isGeneral: true, description: 'נזק שנגרם לעובד כתוצאה מרשלנות חמורה של המעסיק, כגון אי-סיפוק ציוד בטיחות חיוני ביודעין.' },
  ],

  PRODUCT_LIABILITY: [
    { nameEn: 'Employee injury', nameHe: 'פגיעת עובד', isGeneral: true, description: 'פגיעת עובד של המבוטח ממוצר שייצר/סיפק מכוסה בפוליסת מעבידים, לא באחריות מוצר.' },
    { nameEn: 'Contractual liability', nameHe: 'אחריות חוזית', isGeneral: true, description: 'אחריות חוזית מוגברת שהמבוטח קיבל על עצמו מעבר לאחריותו על פי דין כיצרן/ספק, מוחרגת.' },
    { nameEn: 'Manufacture contrary to law', nameHe: 'ייצור בניגוד לחוק', isGeneral: true, description: 'נזק ממוצר שיוצר בניגוד לחוק, תקנות או תקנים מחייבים, אינו מכוסה.' },
    { nameEn: 'Knowingly defective product', nameHe: 'מוצר פגום ביודעין', isGeneral: true, description: 'נזק ממוצר שהמבוטח ידע שהוא פגום ובכל זאת שיווק אותו, אינו מכוסה (חוסר תום לב).' },
    { nameEn: 'Product recall costs', nameHe: 'עלויות ריקול', isGeneral: true, description: 'עלויות ריקול מוצרים (איסוף, החלפה, השמדה) מוחרגות. דורש כיסוי נפרד לריקול מוצרים.' },
    { nameEn: 'Damage to product itself', nameHe: 'נזק למוצר עצמו', isGeneral: true, description: 'נזק למוצר הפגום עצמו מוחרג. הפוליסה מכסה רק נזק שהמוצר הפגום גרם לצד שלישי או לרכושו.' },
    { nameEn: 'Nuclear/Radiation/EMF', nameHe: 'גרעיני/קרינה', isGeneral: true, description: 'חריג סטנדרטי לנזק מקרינה גרעינית ורדיואקטיבית.' },
    { nameEn: 'War/terrorism', nameHe: 'מלחמה/טרור', isGeneral: true, description: 'נזקי מלחמה ופעולות איבה מוחרגים מכל פוליסות האחריות.' },
    { nameEn: 'Pre-retroactive date events', nameHe: 'אירועים לפני תאריך רטרואקטיבי', isGeneral: true, description: 'אירועים שקרו לפני התאריך הרטרואקטיבי המוגדר בפוליסה מוחרגים. רלוונטי בפוליסות על בסיס claims-made.' },
    { nameEn: 'Punitive damages', nameHe: 'פיצויים עונשיים', isGeneral: true, description: 'פיצויים עונשיים שנפסקו כנגד היצרן/ספק אינם מכוסים.' },
    { nameEn: 'Asbestos', nameHe: 'אסבסט', isGeneral: true, description: 'תביעות בגין מוצרים המכילים אסבסט מוחרגות בשל היקף התביעות והעלויות הגבוהות.' },
    { nameEn: 'Gross negligence', nameHe: 'רשלנות חמורה', isGeneral: true, description: 'נזק שנגרם מרשלנות חמורה בייצור, אחסון או הפצת המוצר אינו מכוסה.' },
  ],

  CASH_MONEY: [
    { nameEn: 'Unexplained shortage', nameHe: 'חוסר בלתי מוסבר', isGeneral: true, description: 'חוסר בכספים שלא ניתן לייחס לאירוע ספציפי (פריצה, שוד) מוחרג. נדרשת הוכחת אירוע ביטוחי מוגדר.' },
    { nameEn: 'Money in unsupervised vehicles', nameHe: 'כספים ברכב ללא השגחה', isGeneral: true, description: 'אובדן כספים שנותרו ברכב ללא השגחה מוחרג. נדרש שהכספים יהיו תחת השגחת אדם מורשה בכל עת.' },
    { nameEn: 'Consequential loss', nameHe: 'אבדן תוצאתי', isGeneral: true, description: 'הפוליסה מכסה אובדן כספים בלבד. נזק תוצאתי כגון אובדן רווחים או עיכובים בתשלומים מוחרג.' },
    { nameEn: 'Employee fraud (except messenger)', nameHe: 'הונאת עובד (חוץ משליח)', isGeneral: true, description: 'הונאה או מעילה של עובדים מוחרגת (מכוסה בפוליסת נאמנות עובדים). חריג: גניבת כספים על ידי שליח במהלך העברה.' },
    { nameEn: 'Non-break-in/robbery theft', nameHe: 'גניבה שאינה פריצה/שוד', isGeneral: true, description: 'גניבה שאינה כרוכה בפריצה (סימני פריצה) או שוד (אלימות/איום) מוחרגת. הפוליסה דורשת אירוע פלילי מוגדר.' },
    { nameEn: 'Electronic payment instruments', nameHe: 'אמצעי תשלום אלקטרוניים', isGeneral: true, description: 'אובדן כספים דרך אמצעי תשלום אלקטרוניים (העברות בנקאיות, כרטיסי אשראי) מוחרג. דורש כיסוי סייבר נפרד.' },
    { nameEn: 'War/terrorism', nameHe: 'מלחמה/טרור', isGeneral: true, description: 'אובדן כספים כתוצאה ממלחמה או פעולות איבה מוחרג.' },
    { nameEn: 'Gross negligence', nameHe: 'רשלנות חמורה', isGeneral: true, description: 'אובדן כספים כתוצאה מרשלנות חמורה, כגון השארת כספת פתוחה או אי-שימוש באמצעי מיגון נדרשים.' },
  ],

  FIDELITY_CRIME: [
    { nameEn: 'Pre-inception discovered damage', nameHe: 'נזק שהתגלה לפני תחילת הפוליסה', isGeneral: true, description: 'מעילה שהתגלתה לפני תחילת תקופת הביטוח אינה מכוסה, גם אם בוצעה במהלכה.' },
    { nameEn: 'Post-discovery damage (same employee)', nameHe: 'נזק לאחר גילוי (אותו עובד)', isGeneral: true, description: 'נזק נוסף שנגרם על ידי אותו עובד לאחר שהמעילה שלו כבר התגלתה מוחרג – על המעסיק לפעול מיידית.' },
    { nameEn: 'Pre-retroactive date damage', nameHe: 'נזק לפני תאריך רטרואקטיבי', isGeneral: true, description: 'מעילות שבוצעו לפני התאריך הרטרואקטיבי המוגדר בפוליסה מוחרגות.' },
    { nameEn: 'Consequential/indirect loss', nameHe: 'אבדן תוצאתי/עקיף', isGeneral: true, description: 'הפוליסה מכסה את ההפסד הישיר מהמעילה בלבד. נזקים עקיפים כגון אובדן לקוחות או פגיעה במוניטין מוחרגים.' },
    { nameEn: 'Nuclear', nameHe: 'גרעיני', isGeneral: true, description: 'חריג סטנדרטי לנזק מקרינה גרעינית.' },
    { nameEn: 'War/terrorism', nameHe: 'מלחמה/טרור', isGeneral: true, description: 'מעילות שנעשו תחת כפייה כתוצאה ממלחמה או פעולות איבה מוחרגות.' },
  ],

  CARGO_IN_TRANSIT: [
    { nameEn: 'Inherent defect/wear', nameHe: 'פגם טבוע/בלאי', isGeneral: true, description: 'נזק שנגרם מפגם טבוע בסחורה, בלאי טבעי, התכווצות, התאדות או אובדן משקל טבעי – אלה אינם אירועים ביטוחיים.' },
    { nameEn: 'Porcelain/glass breakage', nameHe: 'שבירת חרסינה/זכוכית', isGeneral: true, description: 'שבירת פריטי חרסינה, זכוכית ופריטים שבירים מוחרגת אלא אם הנזק נגרם מתאונת דרכים או אירוע חריג אחר.' },
    { nameEn: 'Container leakage', nameHe: 'דליפת מכולה', isGeneral: true, description: 'דליפה הדרגתית ממכולות או אריזות מוחרגת. הפוליסה דורשת אריזה נאותה ותקינה כתנאי לכיסוי.' },
    { nameEn: 'Consequential loss', nameHe: 'אבדן תוצאתי', isGeneral: true, description: 'הפוליסה מכסה נזק פיזי לסחורה בלבד. אבדן רווחים, עיכובי אספקה וקנסות חוזיים מוחרגים.' },
    { nameEn: 'Non-break-in/robbery theft', nameHe: 'גניבה שאינה פריצה/שוד', isGeneral: true, description: 'גניבה שאינה כרוכה בפריצה לרכב (סימני פריצה) או שוד (אלימות) מוחרגת. נדרש אירוע פלילי מוגדר.' },
    { nameEn: 'Unroadworthy vehicle', nameHe: 'רכב לא כשיר לדרך', isGeneral: true, description: 'נזק לסחורה שהובלה ברכב שאינו כשיר לדרך, ללא רישיון תקף או עם ליקויים ידועים, מוחרג.' },
    { nameEn: 'Employee fraud', nameHe: 'הונאת עובד', isGeneral: true, description: 'גניבה או הונאה של עובדי המבוטח מוחרגת. כיסוי זה ניתן בפוליסת נאמנות עובדים.' },
    { nameEn: 'War/terrorism', nameHe: 'מלחמה/טרור', isGeneral: true, description: 'נזק לסחורה בהעברה כתוצאה ממלחמה או פעולות איבה מוחרג.' },
    { nameEn: 'Marine insurance overlap', nameHe: 'חפיפת ביטוח ימי', isGeneral: true, description: 'סחורה המכוסה בפוליסת ביטוח ימי מוחרגת מפוליסה זו כדי למנוע כפל ביטוח.' },
    { nameEn: 'Gross negligence', nameHe: 'רשלנות חמורה', isGeneral: true, description: 'נזק שנגרם מרשלנות חמורה בטיפול בסחורה, כגון אחסון לא נאות או אריזה לקויה ביודעין.' },
    { nameEn: 'Overnight unattended parking', nameHe: 'חניה ללא השגחה ללילה', isGeneral: true, description: 'נזק לסחורה ברכב שחנה ללא השגחה בשעות הלילה מוחרג, אלא אם הרכב חנה בחניון מאובטח ונעול.' },
  ],

  TERRORISM: [
    { nameEn: 'War/civil war', nameHe: 'מלחמה/מלחמת אזרחים', isGeneral: true, description: 'נזקי מלחמה ומלחמת אזרחים מוחרגים מפוליסת טרור. הפוליסה מכסה רק פעולות טרור מוגדרות.' },
    { nameEn: 'Biological/chemical weapons', nameHe: 'נשק ביולוגי/כימי', isGeneral: true, description: 'נזק מנשק ביולוגי, כימי או רדיולוגי מוחרג בשל הקושי בהערכת הנזק והיקפו.' },
    { nameEn: 'Break-in/theft (non-immediate)', nameHe: 'פריצה/גניבה (לא מיידית)', isGeneral: true, description: 'גניבה ופריצה שאינן קשורות ישירות ובאופן מיידי לאירוע טרור מוחרגות (למשל ביזה לאחר הפיגוע).' },
    { nameEn: 'Military installations', nameHe: 'מתקנים צבאיים/ביטחוניים', isGeneral: true, description: 'נזק למתקנים צבאיים וביטחוניים מוחרג – אלה בסמכות המדינה ומכוסים בהסדרים ממשלתיים.' },
    { nameEn: 'Nuclear', nameHe: 'גרעיני', isGeneral: true, description: 'נזק מפיגוע גרעיני או "פצצה מלוכלכת" מוחרג בשל היקף הנזק הבלתי ניתן לביטוח.' },
    { nameEn: 'Events outside geographic limits', nameHe: 'אירועים מחוץ לגבולות', isGeneral: true, description: 'אירועי טרור מחוץ לגבולות הטריטוריאליים המוגדרים בפוליסה (בדרך כלל ישראל) מוחרגים.' },
  ],

  ELECTRONIC_EQUIPMENT: [
    { nameEn: 'Residual policy exclusion (Fire overlap)', nameHe: 'חריג שיורי (חפיפת אש)', chapterCode: '1', isGeneral: false, description: 'כאשר הפוליסה נרכשת כשיורית (residual) לפוליסת אש, סיכונים המכוסים באש מוחרגים כדי למנוע כפל.' },
    { nameEn: 'Pre-existing defects', nameHe: 'פגמים קיימים', chapterCode: '1', isGeneral: false, description: 'פגמים שהיו קיימים בציוד האלקטרוני לפני תחילת הביטוח מוחרגים.' },
    { nameEn: 'Wear/tear/corrosion', nameHe: 'בלאי/קורוזיה', chapterCode: '1', isGeneral: false, description: 'בלאי טבעי, קורוזיה והתיישנות של ציוד אלקטרוני אינם אירוע ביטוחי אלא תהליך צפוי.' },
    { nameEn: 'Repair of operational defects', nameHe: 'תיקון פגמים תפעוליים', chapterCode: '1', isGeneral: false, description: 'תיקוני תחזוקה שוטפת ותקלות תפעוליות שאינן נובעות מאירוע פתאומי מוחרגים.' },
    { nameEn: 'Manufacturer warranty liability', nameHe: 'אחריות יצרן', chapterCode: '1', isGeneral: false, description: 'נזק שמכוסה באחריות היצרן מוחרג. על המבוטח לפנות תחילה ליצרן למימוש האחריות.' },
    { nameEn: 'Simple theft (not burglary)', nameHe: 'גניבה פשוטה (לא פריצה)', chapterCode: '1', isGeneral: false, description: 'גניבה שאינה כרוכה בפריצה (סימני פריצה) מוחרגת. הפוליסה מכסה רק גניבה בליווי פריצה.' },
    { nameEn: 'Consumables/replaceable materials', nameHe: 'מתכלים/חומרים מתחלפים', chapterCode: '1', isGeneral: false, description: 'חומרים מתכלים (דיו, טונר, מדיה מגנטית ריקה) שנדרשת החלפתם באופן שוטף מוחרגים.' },
    { nameEn: 'Unlicensed software', nameHe: 'תוכנה ללא רישיון', chapterCode: '2', isGeneral: false, description: 'נזק או אובדן תוכנות שאינן מורשות (פיראטיות) מוחרג. הכיסוי חל רק על תוכנה ברישיון תקף.' },
    { nameEn: 'No backup regime', nameHe: 'ללא משטר גיבוי', chapterCode: '2', isGeneral: false, description: 'אובדן נתונים מוחרג אם המבוטח לא קיים משטר גיבוי סדיר כנדרש בתנאי הפוליסה.' },
    { nameEn: 'Nuclear', nameHe: 'גרעיני', isGeneral: true, description: 'חריג סטנדרטי לנזק מקרינה גרעינית ורדיואקטיבית.' },
    { nameEn: 'War/terrorism', nameHe: 'מלחמה/טרור', isGeneral: true, description: 'נזקי מלחמה ופעולות איבה מוחרגים.' },
    { nameEn: 'Gross negligence', nameHe: 'רשלנות חמורה', isGeneral: true, description: 'נזק שנגרם מרשלנות חמורה כגון אי-תחזוקה או שימוש בניגוד להוראות היצרן.' },
  ],

  HEAVY_ENGINEERING_EQUIPMENT: [
    { nameEn: 'Consequential/indirect loss', nameHe: 'אבדן תוצאתי/עקיף', isGeneral: true, description: 'הפוליסה מכסה נזק פיזי לציוד בלבד. אבדן רווחים, עיכובי פרויקט וקנסות חוזיים מוחרגים.' },
    { nameEn: 'War/terrorism', nameHe: 'מלחמה/טרור', isGeneral: true, description: 'נזק לציוד הנדסי כתוצאה ממלחמה או פעולות איבה מוחרג.' },
    { nameEn: 'Overload/experimental use', nameHe: 'עומס יתר/שימוש ניסיוני', isGeneral: true, description: 'נזק שנגרם מהפעלת ציוד מעבר ליכולתו המתוכננת או משימוש ניסיוני/לא מאושר.' },
    { nameEn: 'Theft/burglary (unless ext 3.1)', nameHe: 'גניבה/פריצה (אלא אם הרחבה 3.1)', isGeneral: true, description: 'גניבה ופריצה מוחרגות כברירת מחדל. ניתן לרכוש כיסוי באמצעות הרחבה 3.1, בכפוף לאמצעי מיגון.' },
    { nameEn: 'Normal wear/corrosion', nameHe: 'בלאי רגיל/קורוזיה', isGeneral: true, description: 'בלאי רגיל, קורוזיה וחלודה של ציוד הנדסי כבד אינם אירוע ביטוחי.' },
    { nameEn: 'Tire damage (tread <60%)', nameHe: 'נזק צמיגים (סוליה <60%)', isGeneral: true, description: 'נזק לצמיגים שבהם עומק הסוליה פחות מ-60% מהמקורי מוחרג – נחשב לבלאי טבעי.' },
    { nameEn: 'Water source damage', nameHe: 'נזק ממקור מים', isGeneral: true, description: 'נזק לציוד שנגרם מהצפה, שיטפון או ממקורות מים טבעיים מוחרג מכיסוי ציוד הנדסי כבד.' },
    { nameEn: 'Overseas damage', nameHe: 'נזק בחו"ל', isGeneral: true, description: 'נזק לציוד הנמצא מחוץ לגבולות הטריטוריאליים (בדרך כלל ישראל) מוחרג.' },
    { nameEn: 'Unauthorized operator', nameHe: 'מפעיל ללא רישיון', isGeneral: true, description: 'נזק שנגרם כאשר הציוד הופעל על ידי אדם ללא רישיון הפעלה מתאים או הכשרה נדרשת.' },
    { nameEn: 'Gross negligence', nameHe: 'רשלנות חמורה', isGeneral: true, description: 'נזק שנגרם מרשלנות חמורה כגון אי-תחזוקה סדירה או הפעלה בניגוד להוראות היצרן.' },
  ],

  CONTRACTOR_WORKS_CAR: [
    { nameEn: 'Faulty design/materials/workmanship', nameHe: 'תכנון/חומרים/עבודה פגומים', chapterCode: 'A', isGeneral: false, description: 'עלות תיקון או החלפה של עבודה פגומה עצמה מוחרגת (DE3). הנזק התוצאתי לחלקים תקינים אחרים כן מכוסה.' },
    { nameEn: 'Wear/tear', nameHe: 'בלאי', chapterCode: 'A', isGeneral: false, description: 'בלאי טבעי של חומרי בנייה וציוד באתר מוחרג – אלה הוצאות שוטפות של הפרויקט.' },
    { nameEn: 'Unexplained shortage', nameHe: 'חוסר בלתי מוסבר', chapterCode: 'A', isGeneral: false, description: 'חוסר בחומרי בנייה שלא ניתן לייחס לאירוע ספציפי (גניבה, נזק) מוחרג. נדרשת הוכחת אירוע.' },
    { nameEn: 'Motor vehicle liability', nameHe: 'אחריות כלי רכב', chapterCode: 'B', isGeneral: false, description: 'אחריות בגין כלי רכב בכביש ציבורי מוחרגת – מכוסה בביטוח חובה/מקיף. שימוש באתר יכול להיות מכוסה בהרחבה.' },
    { nameEn: 'Underground items', nameHe: 'פריטים תת-קרקעיים', chapterCode: 'B', isGeneral: false, description: 'נזק לתשתיות תת-קרקעיות (צנרת, כבלים) מוחרג כברירת מחדל. ניתן להרחיב בתשלום נוסף (הרחבה 7.2).' },
    { nameEn: 'Vibration/support weakening', nameHe: 'רעידות/החלשת תמיכה', chapterCode: 'B', isGeneral: false, description: 'נזק למבנים סמוכים מרעידות וחפירות מוחרג כברירת מחדל. ניתן להרחיב (הרחבה 7.3) בגבול נפרד.' },
    { nameEn: 'War/terrorism', nameHe: 'מלחמה/טרור', isGeneral: true, description: 'נזק לפרויקט בנייה כתוצאה ממלחמה או פעולות איבה מוחרג.' },
    { nameEn: 'Nuclear', nameHe: 'גרעיני', isGeneral: true, description: 'חריג סטנדרטי לנזק מקרינה גרעינית ורדיואקטיבית.' },
    { nameEn: 'Work stoppage > 90 days', nameHe: 'הפסקת עבודה > 90 יום', isGeneral: true, description: 'אם העבודות באתר הופסקו ליותר מ-90 יום רצופים, הכיסוי פוקע אלא אם ניתנה הסכמת המבטח מראש.' },
    { nameEn: 'Unlicensed crane operators', nameHe: 'מפעילי מנוף ללא רישיון', isGeneral: true, description: 'נזק שנגרם כאשר מנוף הופעל על ידי מפעיל ללא רישיון תקף כנדרש בחוק מוחרג.' },
    { nameEn: 'Gross negligence', nameHe: 'רשלנות חמורה', isGeneral: true, description: 'נזק שנגרם מרשלנות חמורה של הקבלן, כגון אי-ביצוע תמיכה נדרשת או התעלמות מהוראות בטיחות.' },
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
