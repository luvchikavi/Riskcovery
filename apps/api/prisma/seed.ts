import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Israeli Insurance Knowledge Base Seed Data
const insuranceKnowledgeBase = [
  // CONSTRUCTION Sector
  {
    sector: 'CONSTRUCTION',
    policyType: 'GENERAL_LIABILITY',
    policyTypeHe: 'ביטוח צד ג׳',
    recommendedLimit: 10000000,
    isMandatory: true,
    commonEndorsements: ['תאונות אישיות', 'רכוש סמוך', 'חבות מעבידים'],
    riskFactors: ['גודל הפרויקט', 'גובה עבודה', 'עבודות תת-קרקעיות'],
    description: 'Third party liability coverage for construction activities',
    descriptionHe: 'כיסוי אחריות כלפי צד שלישי לפעילויות בנייה',
  },
  {
    sector: 'CONSTRUCTION',
    policyType: 'EMPLOYER_LIABILITY',
    policyTypeHe: 'ביטוח חבות מעבידים',
    recommendedLimit: 25000000,
    isMandatory: true,
    commonEndorsements: ['תאונות עבודה', 'מחלות מקצוע'],
    riskFactors: ['מספר עובדים', 'סוג עבודה', 'שעות עבודה'],
    description: 'Employer liability for workplace injuries',
    descriptionHe: 'אחריות מעביד לפציעות במקום העבודה',
  },
  {
    sector: 'CONSTRUCTION',
    policyType: 'CAR_INSURANCE',
    policyTypeHe: 'ביטוח עבודות קבלניות (CAR)',
    recommendedLimit: 50000000,
    isMandatory: true,
    commonEndorsements: ['תקופת תחזוקה', 'ציוד קבלני', 'פינוי הריסות'],
    riskFactors: ['שווי הפרויקט', 'משך הפרויקט', 'מורכבות'],
    description: 'Contractors All Risk insurance for construction projects',
    descriptionHe: 'ביטוח כל הסיכונים לקבלנים בפרויקטי בנייה',
  },
  {
    sector: 'CONSTRUCTION',
    policyType: 'PROFESSIONAL_INDEMNITY',
    policyTypeHe: 'ביטוח אחריות מקצועית',
    recommendedLimit: 5000000,
    isMandatory: false,
    commonEndorsements: ['תכנון', 'פיקוח', 'ייעוץ'],
    riskFactors: ['סוג שירותים', 'גודל פרויקטים'],
    description: 'Professional liability for design and consulting services',
    descriptionHe: 'אחריות מקצועית לשירותי תכנון וייעוץ',
  },

  // TECHNOLOGY Sector
  {
    sector: 'TECHNOLOGY',
    policyType: 'PROFESSIONAL_INDEMNITY',
    policyTypeHe: 'ביטוח אחריות מקצועית',
    recommendedLimit: 5000000,
    isMandatory: true,
    commonEndorsements: ['אי-התאמה', 'עיכובים', 'הפרת חוזה'],
    riskFactors: ['סוג מוצרים', 'לקוחות', 'שווי חוזים'],
    description: 'Professional liability for tech services and products',
    descriptionHe: 'אחריות מקצועית לשירותים ומוצרי טכנולוגיה',
  },
  {
    sector: 'TECHNOLOGY',
    policyType: 'CYBER_LIABILITY',
    policyTypeHe: 'ביטוח סייבר',
    recommendedLimit: 10000000,
    isMandatory: true,
    commonEndorsements: ['פריצת מידע', 'סחיטת סייבר', 'הפסקת שירות'],
    riskFactors: ['כמות נתונים', 'סוג מידע', 'תשתית IT'],
    description: 'Cyber liability and data breach coverage',
    descriptionHe: 'כיסוי אחריות סייבר ופריצות מידע',
  },
  {
    sector: 'TECHNOLOGY',
    policyType: 'GENERAL_LIABILITY',
    policyTypeHe: 'ביטוח צד ג׳',
    recommendedLimit: 5000000,
    isMandatory: true,
    commonEndorsements: ['מבקרים', 'נזק תוצאתי'],
    riskFactors: ['מיקום משרדים', 'מספר עובדים'],
    description: 'General third party liability',
    descriptionHe: 'אחריות כללית כלפי צד שלישי',
  },
  {
    sector: 'TECHNOLOGY',
    policyType: 'D_AND_O',
    policyTypeHe: 'ביטוח דירקטורים ונושאי משרה',
    recommendedLimit: 5000000,
    isMandatory: false,
    commonEndorsements: ['תביעות משקיעים', 'הליכים רגולטוריים'],
    riskFactors: ['גודל חברה', 'סבבי גיוס', 'ציבוריות'],
    description: 'Directors and Officers liability',
    descriptionHe: 'אחריות דירקטורים ונושאי משרה',
  },

  // MANUFACTURING Sector
  {
    sector: 'MANUFACTURING',
    policyType: 'GENERAL_LIABILITY',
    policyTypeHe: 'ביטוח צד ג׳',
    recommendedLimit: 10000000,
    isMandatory: true,
    commonEndorsements: ['אחריות מוצר', 'מזון', 'הרחבת טריטוריה'],
    riskFactors: ['סוג מוצרים', 'שווקי יעד', 'היקף ייצור'],
    description: 'Third party liability including product liability',
    descriptionHe: 'אחריות צד שלישי כולל אחריות מוצר',
  },
  {
    sector: 'MANUFACTURING',
    policyType: 'PRODUCT_LIABILITY',
    policyTypeHe: 'ביטוח אחריות המוצר',
    recommendedLimit: 15000000,
    isMandatory: true,
    commonEndorsements: ['החזרת מוצרים', 'ליקויי ייצור'],
    riskFactors: ['סוג מוצר', 'שווקים', 'רגולציה'],
    description: 'Product liability coverage',
    descriptionHe: 'כיסוי אחריות מוצר',
  },
  {
    sector: 'MANUFACTURING',
    policyType: 'EMPLOYER_LIABILITY',
    policyTypeHe: 'ביטוח חבות מעבידים',
    recommendedLimit: 20000000,
    isMandatory: true,
    commonEndorsements: ['מכונות כבדות', 'חומרים מסוכנים'],
    riskFactors: ['מספר עובדים', 'סוג ייצור', 'סיכוני בטיחות'],
    description: 'Employer liability for manufacturing workers',
    descriptionHe: 'אחריות מעביד לעובדי ייצור',
  },
  {
    sector: 'MANUFACTURING',
    policyType: 'PROPERTY',
    policyTypeHe: 'ביטוח רכוש',
    recommendedLimit: 50000000,
    isMandatory: false,
    commonEndorsements: ['אש', 'פריצה', 'אסונות טבע', 'אובדן רווחים'],
    riskFactors: ['שווי נכסים', 'מיקום', 'סוג ייצור'],
    description: 'Property insurance for facilities and equipment',
    descriptionHe: 'ביטוח רכוש למתקנים וציוד',
  },

  // RETAIL Sector
  {
    sector: 'RETAIL',
    policyType: 'GENERAL_LIABILITY',
    policyTypeHe: 'ביטוח צד ג׳',
    recommendedLimit: 5000000,
    isMandatory: true,
    commonEndorsements: ['מבקרים', 'החלקה ונפילה'],
    riskFactors: ['מספר חנויות', 'תנועת לקוחות', 'גודל שטח'],
    description: 'General liability for retail operations',
    descriptionHe: 'אחריות כללית לפעילות קמעונאית',
  },
  {
    sector: 'RETAIL',
    policyType: 'EMPLOYER_LIABILITY',
    policyTypeHe: 'ביטוח חבות מעבידים',
    recommendedLimit: 10000000,
    isMandatory: true,
    commonEndorsements: ['הרמת משאות', 'עבודה בגובה'],
    riskFactors: ['מספר עובדים', 'סוג חנויות'],
    description: 'Employer liability for retail workers',
    descriptionHe: 'אחריות מעביד לעובדי קמעונאות',
  },
  {
    sector: 'RETAIL',
    policyType: 'PROPERTY',
    policyTypeHe: 'ביטוח רכוש',
    recommendedLimit: 10000000,
    isMandatory: false,
    commonEndorsements: ['מלאי', 'ציוד', 'שלטים'],
    riskFactors: ['שווי מלאי', 'מיקום', 'סוג מוצרים'],
    description: 'Property insurance for retail locations',
    descriptionHe: 'ביטוח רכוש לחנויות',
  },

  // HEALTHCARE Sector
  {
    sector: 'HEALTHCARE',
    policyType: 'PROFESSIONAL_INDEMNITY',
    policyTypeHe: 'ביטוח אחריות מקצועית רפואית',
    recommendedLimit: 20000000,
    isMandatory: true,
    commonEndorsements: ['טיפולים ניסיוניים', 'תיעוד רפואי'],
    riskFactors: ['סוג טיפולים', 'מספר מטופלים', 'התמחויות'],
    description: 'Medical malpractice insurance',
    descriptionHe: 'ביטוח רשלנות רפואית',
  },
  {
    sector: 'HEALTHCARE',
    policyType: 'GENERAL_LIABILITY',
    policyTypeHe: 'ביטוח צד ג׳',
    recommendedLimit: 10000000,
    isMandatory: true,
    commonEndorsements: ['מבקרים', 'ציוד רפואי'],
    riskFactors: ['גודל מתקן', 'מספר מטופלים'],
    description: 'General liability for healthcare facilities',
    descriptionHe: 'אחריות כללית למתקני בריאות',
  },
  {
    sector: 'HEALTHCARE',
    policyType: 'CYBER_LIABILITY',
    policyTypeHe: 'ביטוח סייבר',
    recommendedLimit: 5000000,
    isMandatory: true,
    commonEndorsements: ['מידע רפואי', 'HIPAA'],
    riskFactors: ['כמות רשומות', 'מערכות IT'],
    description: 'Cyber liability for patient data protection',
    descriptionHe: 'אחריות סייבר להגנת מידע מטופלים',
  },

  // LOGISTICS Sector
  {
    sector: 'LOGISTICS',
    policyType: 'GENERAL_LIABILITY',
    policyTypeHe: 'ביטוח צד ג׳',
    recommendedLimit: 10000000,
    isMandatory: true,
    commonEndorsements: ['מחסנים', 'מלגזות', 'שערי כניסה'],
    riskFactors: ['גודל מחסנים', 'תנועת משאיות'],
    description: 'General liability for logistics operations',
    descriptionHe: 'אחריות כללית לפעילויות לוגיסטיקה',
  },
  {
    sector: 'LOGISTICS',
    policyType: 'CARGO_LIABILITY',
    policyTypeHe: 'ביטוח אחריות מוביל',
    recommendedLimit: 5000000,
    isMandatory: true,
    commonEndorsements: ['CMR', 'הובלה בינלאומית'],
    riskFactors: ['סוג מטענים', 'יעדים', 'ערך משלוחים'],
    description: 'Cargo liability for transported goods',
    descriptionHe: 'אחריות מוביל לסחורות מובלות',
  },
  {
    sector: 'LOGISTICS',
    policyType: 'EMPLOYER_LIABILITY',
    policyTypeHe: 'ביטוח חבות מעבידים',
    recommendedLimit: 15000000,
    isMandatory: true,
    commonEndorsements: ['נהגים', 'עובדי מחסן', 'משמרות לילה'],
    riskFactors: ['מספר עובדים', 'סוגי עבודה'],
    description: 'Employer liability for logistics workers',
    descriptionHe: 'אחריות מעביד לעובדי לוגיסטיקה',
  },

  // CONSULTING Sector
  {
    sector: 'CONSULTING',
    policyType: 'PROFESSIONAL_INDEMNITY',
    policyTypeHe: 'ביטוח אחריות מקצועית',
    recommendedLimit: 10000000,
    isMandatory: true,
    commonEndorsements: ['ייעוץ שגוי', 'הפרת סודיות', 'אובדן מסמכים'],
    riskFactors: ['סוג ייעוץ', 'גודל לקוחות', 'שווי פרויקטים'],
    description: 'Professional liability for consulting services',
    descriptionHe: 'אחריות מקצועית לשירותי ייעוץ',
  },
  {
    sector: 'CONSULTING',
    policyType: 'GENERAL_LIABILITY',
    policyTypeHe: 'ביטוח צד ג׳',
    recommendedLimit: 2000000,
    isMandatory: true,
    commonEndorsements: ['משרדים', 'מבקרים'],
    riskFactors: ['מיקום', 'מספר עובדים'],
    description: 'General liability for consulting offices',
    descriptionHe: 'אחריות כללית למשרדי ייעוץ',
  },
];

async function main() {
  console.log('Seeding Insurance Knowledge Base...');

  for (const entry of insuranceKnowledgeBase) {
    await prisma.insuranceKnowledgeBase.upsert({
      where: {
        sector_policyType: {
          sector: entry.sector,
          policyType: entry.policyType,
        },
      },
      create: entry,
      update: entry,
    });
    console.log(`  - ${entry.sector}/${entry.policyType}`);
  }

  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
