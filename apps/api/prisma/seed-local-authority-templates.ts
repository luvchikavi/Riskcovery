import { PrismaClient } from '@prisma/client';
import mammoth from 'mammoth';
import { readFile, readdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const prisma = new PrismaClient();

// ─── Policy type mappings (Hebrew → English) ───────────────────────────
const POLICY_TYPE_MAP: Array<{
  en: string;
  he: string;
  aliases: string[];
}> = [
  {
    en: 'GENERAL_LIABILITY',
    he: 'צד שלישי',
    aliases: ['צד ג\'', 'צד ג', 'אחריות כלפי צד שלישי', 'צד שלישי למקרה ולתקופה'],
  },
  {
    en: 'EMPLOYER_LIABILITY',
    he: 'חבות מעבידים',
    aliases: ['אחריות מעבידים', 'חבות מעבידים לעובד', 'ביטוח מעבידים'],
  },
  {
    en: 'PROFESSIONAL_INDEMNITY',
    he: 'אחריות מקצועית',
    aliases: ['ביטוח מקצועי', 'אחריות מקצועית למקרה', 'אחריות מקצועית לתקופה'],
  },
  {
    en: 'CONTRACTOR_ALL_RISKS',
    he: 'כל הסיכונים עבודות קבלניות',
    aliases: ['עבודות קבלניות', 'ביטוח קבלנים', 'כל הסיכונים'],
  },
  {
    en: 'PRODUCT_LIABILITY',
    he: 'חבות מוצר',
    aliases: ['אחריות מוצר', 'ביטוח מוצר'],
  },
  {
    en: 'PROPERTY',
    he: 'ביטוח רכוש',
    aliases: ['רכוש', 'ביטוח מבנה', 'ביטוח תכולה'],
  },
  {
    en: 'CAR_THIRD_PARTY',
    he: 'ביטוח רכב צד ג\'',
    aliases: ['רכב צד שלישי', 'נזק צד שלישי רכב', 'רכב צד ג'],
  },
  {
    en: 'CAR_COMPULSORY',
    he: 'ביטוח חובה',
    aliases: ['חובה רכב', 'ביטוח חובה רכב'],
  },
  {
    en: 'MOTOR_VEHICLE',
    he: 'ביטוח רכב',
    aliases: ['רכב', 'ביטוח רכב מקיף'],
  },
];

// ─── Service type to English name mapping ─────────────────────────────
const SERVICE_TYPE_MAP: Record<string, { en: string; sector: string }> = {
  'גביית חובות': { en: 'Debt Collection', sector: 'SERVICES' },
  'גינון': { en: 'Gardening & Landscaping', sector: 'SERVICES' },
  'הובלה שליחויות': { en: 'Transportation & Delivery', sector: 'LOGISTICS' },
  'הסעות בשכר': { en: 'Paid Transportation', sector: 'LOGISTICS' },
  'הפעלת תנועת נוער': { en: 'Youth Movement Operation', sector: 'EDUCATION' },
  'חוג העשרה': { en: 'Enrichment Classes', sector: 'EDUCATION' },
  'יועצים מתכננים': { en: 'Consultants & Planners', sector: 'CONSULTING' },
  'ליסינג תפעולי': { en: 'Operational Leasing', sector: 'SERVICES' },
  'מחסן נשק': { en: 'Weapons Storage', sector: 'SECURITY' },
  'מחשוב': { en: 'IT & Computing', sector: 'TECHNOLOGY' },
  'מפעיל חוג ספורט': { en: 'Sports Activity Operator', sector: 'EDUCATION' },
  'מפעיל מוסדות חינוך': { en: 'Educational Institutions Operator', sector: 'EDUCATION' },
  'ספק מזון ושתייה': { en: 'Food & Beverage Supplier', sector: 'FOOD' },
  'ספקים ונותני שירות': { en: 'Suppliers & Service Providers', sector: 'SERVICES' },
  'עבודות קבלניות בינוניות': { en: 'Medium Contracting Works', sector: 'CONSTRUCTION' },
  'עבודות קבלניות גדולות': { en: 'Large Contracting Works', sector: 'CONSTRUCTION' },
  'עבודות קבלניות קטנות': { en: 'Small Contracting Works', sector: 'CONSTRUCTION' },
  'פינוי אשפה ופסולת': { en: 'Waste & Garbage Removal', sector: 'SERVICES' },
  'שירותי גרירה': { en: 'Towing Services', sector: 'LOGISTICS' },
  'שכירויות': { en: 'Leasing & Rentals', sector: 'SERVICES' },
  'שמירה ואבטחה': { en: 'Security & Guarding', sector: 'SECURITY' },
};

// ─── Endorsement codes known to the system ────────────────────────────
const ENDORSEMENT_CODES: Record<string, { he: string; en: string }> = {
  '301': { he: 'אובדן מסמכים', en: 'Loss of documents' },
  '302': { he: 'אחריות צולבת', en: 'Cross liability' },
  '303': { he: 'דיבה, השמצה והוצאת לשון הרע', en: 'Defamation and libel' },
  '304': { he: 'הרחב שיפוי', en: 'Extended indemnification' },
  '305': { he: 'הרחבת כלי ירייה המוחזק כדין', en: 'Firearms extension' },
  '306': { he: 'הרחבת צד ג\' - נזק בעת שהות זמנית בחו"ל', en: 'Third party abroad extension' },
  '307': { he: 'הרחבת צד ג\' - קבלנים וקבלני משנה', en: 'Contractors extension' },
  '308': { he: 'ויתור על תחלוף לטובת גורם אחר', en: 'Waiver of subrogation for other party' },
  '309': { he: 'ויתור על תחלוף לטובת מבקש האישור', en: 'Waiver of subrogation for requester' },
  '310': { he: 'כיסוי למשווקים במסגרת חבות מוצר', en: 'Marketers coverage' },
  '311': { he: 'כיסוי אובדן תוצאתי בגין נזק לרכוש', en: 'Consequential loss coverage' },
  '312': { he: 'כיסוי בגין נזק גוף משימוש בצמ"ה', en: 'Heavy equipment bodily injury' },
  '313': { he: 'כיסוי בגין נזקי טבע', en: 'Natural disaster coverage' },
  '314': { he: 'כיסוי גניבה פריצה ושוד', en: 'Theft and robbery' },
  '315': { he: 'כיסוי לתביעות המל"ל', en: 'National Insurance claims' },
  '316': { he: 'כיסוי רעידת אדמה', en: 'Earthquake coverage' },
  '317': { he: 'מבוטח נוסף - אחר', en: 'Additional insured - other' },
  '318': { he: 'מבוטח נוסף - מבקש האישור', en: 'Additional insured - requester' },
  '319': { he: 'מבוטח נוסף - כמעבידם של עובדי המבוטח', en: 'Additional insured - as employer' },
  '320': { he: 'מבוטח נוסף בגין מעשי המבוטח - אחר', en: 'Additional insured for insured acts - other' },
  '321': { he: 'מבוטח נוסף בגין מעשי המבוטח - מבקש האישור', en: 'Additional insured for insured acts - requester' },
  '322': { he: 'מבקש האישור מוגדר כצד ג\'', en: 'Requester as third party' },
  '328': { he: 'ראשוניות', en: 'Primary insurance' },
  '329': { he: 'רכוש מבקש האישור ייחשב כצד ג\'', en: 'Requester property as third party' },
  '334': { he: 'תקופת תחזוקה', en: 'Maintenance period' },
  '336': { he: 'ביטול חריג אחריות מקצועית בצד ג\'', en: 'Cancel PI exclusion in TPL' },
  '337': { he: 'ביטול חריג חבות מוצר בצד ג\'', en: 'Cancel PL exclusion in TPL' },
  '340': { he: 'הרחבת רעידות והחלשת משען', en: 'Vibration and weakening of support' },
  '341': { he: 'הרחבת נזק עקיף למתקנים תת קרקעיים', en: 'Underground facilities damage' },
  '343': { he: 'הרחבת הכיסוי לנזקים בעת פריקה וטעינה', en: 'Loading/unloading coverage' },
  '344': { he: 'הרחבת הכיסוי לעבודות בגובה', en: 'Working at heights coverage' },
  '348': { he: 'ביטול סייג רכוש עליו פעלו במישרין', en: 'Cancel direct work exclusion' },
  '349': { he: 'ביטול סייג רכוש בשליטה בחזקה ופיקוח', en: 'Cancel care custody control exclusion' },
  '350': { he: 'הרחבת חבות כלפי קבלנים בחבות מעבידים', en: 'Contractor liability in employer' },
};

// Additional insured endorsement codes
const ADDITIONAL_INSURED_CODES = ['317', '318', '319', '320', '321'];
// Waiver of subrogation codes
const WAIVER_SUBROGATION_CODES = ['308', '309'];

interface ParsedRequirement {
  policyType: string;
  policyTypeHe: string;
  minimumLimit: number;
  requiredEndorsements: string[];
  requireAdditionalInsured: boolean;
  requireWaiverSubrogation: boolean;
  isMandatory: boolean;
}

// ─── Parse service type from filename ─────────────────────────────────
function extractServiceType(fileName: string): string {
  // Remove extension and suffix like " - מועצות" or " - למועצות" or " - מועצה"
  return fileName
    .replace(/\.docx$/i, '')
    .replace(/\s*-\s*(ל?מועצ(?:ות|ה))$/, '')
    .trim();
}

// ─── Detect policy type from Hebrew text ──────────────────────────────
function detectPolicyType(text: string): string | null {
  for (const pt of POLICY_TYPE_MAP) {
    const allPatterns = [pt.he, ...pt.aliases];
    for (const pattern of allPatterns) {
      const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (new RegExp(escaped, 'i').test(text)) {
        return pt.en;
      }
    }
  }
  return null;
}

function getPolicyTypeHe(en: string): string {
  return POLICY_TYPE_MAP.find((p) => p.en === en)?.he || en;
}

// ─── Parse coverage amount from Hebrew text ───────────────────────────
function parseCoverageAmount(text: string): number {
  // Match patterns like "2,000,000 ₪" or "2,000,000"
  const directAmountMatches = text.match(/[\d,]+(?:\s*₪)?/g);
  const amounts: number[] = [];

  if (directAmountMatches) {
    for (const match of directAmountMatches) {
      const cleaned = match.replace(/[,₪\s]/g, '');
      const num = parseInt(cleaned, 10);
      if (num >= 10000) {
        amounts.push(num);
      }
    }
  }

  // Match patterns like "20 מיליון" or "5 מליון"
  const millionPattern = /(\d+(?:\.\d+)?)\s*מ[יי]?ל[יי]?ון/g;
  let millionMatch;
  while ((millionMatch = millionPattern.exec(text)) !== null) {
    if (millionMatch[1]) {
      amounts.push(parseFloat(millionMatch[1]) * 1_000_000);
    }
  }

  // Return the largest amount found (usually the coverage limit)
  return amounts.length > 0 ? Math.max(...amounts) : 0;
}

// ─── Extract endorsement codes from text ──────────────────────────────
function extractEndorsementCodes(text: string): string[] {
  const codes: string[] = [];
  const codePattern = /\b(3\d{2}|4[0-3]\d|440)\b/g;
  const matches = text.match(codePattern);

  if (matches) {
    for (const match of matches) {
      if (ENDORSEMENT_CODES[match] && !codes.includes(match)) {
        codes.push(match);
      }
    }
  }

  return codes;
}

// ─── Check for additional insured / waiver references ─────────────────
function hasAdditionalInsured(text: string, endorsementCodes: string[]): boolean {
  // Check endorsement codes
  if (endorsementCodes.some((c) => ADDITIONAL_INSURED_CODES.includes(c))) {
    return true;
  }
  // Check text patterns
  return /מבוטח נוסף/i.test(text);
}

function hasWaiverSubrogation(text: string, endorsementCodes: string[]): boolean {
  // Check endorsement codes
  if (endorsementCodes.some((c) => WAIVER_SUBROGATION_CODES.includes(c))) {
    return true;
  }
  // Check text patterns
  return /ויתור\s+(?:על\s+)?(?:זכות\s+)?תחלוף/i.test(text);
}

// ─── Parse a single .docx template ────────────────────────────────────
async function parseDocxTemplate(filePath: string, fileName: string): Promise<{
  serviceType: string;
  serviceTypeEn: string;
  sector: string;
  requirements: ParsedRequirement[];
}> {
  const buffer = await readFile(filePath);
  const result = await mammoth.extractRawText({ buffer });
  const text = result.value;

  const serviceType = extractServiceType(fileName);
  const serviceInfo = SERVICE_TYPE_MAP[serviceType] || { en: serviceType, sector: 'SERVICES' };

  console.log(`\n📄 Parsing: ${fileName}`);
  console.log(`   Service: ${serviceType} → ${serviceInfo.en} (${serviceInfo.sector})`);
  console.log(`   Text length: ${text.length} chars`);

  // Split text into sections by looking for policy type headers
  const requirements: ParsedRequirement[] = [];
  const allEndorsementCodes = extractEndorsementCodes(text);

  console.log(`   Endorsement codes found: ${allEndorsementCodes.join(', ') || 'none'}`);

  // Find all policy types mentioned in the document
  const foundPolicies = new Set<string>();
  for (const pt of POLICY_TYPE_MAP) {
    const allPatterns = [pt.he, ...pt.aliases];
    for (const pattern of allPatterns) {
      const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (new RegExp(escaped, 'i').test(text)) {
        foundPolicies.add(pt.en);
        break;
      }
    }
  }

  console.log(`   Policy types found: ${[...foundPolicies].join(', ')}`);

  // For each found policy type, try to extract coverage amount and endorsements
  for (const policyType of foundPolicies) {
    const policyTypeHe = getPolicyTypeHe(policyType);

    // Try to find the section of text related to this policy
    const escaped = policyTypeHe.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const sectionRegex = new RegExp(`${escaped}[\\s\\S]{0,500}`, 'i');
    const sectionMatch = text.match(sectionRegex);
    const sectionText = sectionMatch ? sectionMatch[0] : text;

    // Parse coverage amount from the section
    let limit = parseCoverageAmount(sectionText);

    // If no limit found in section, try the whole document
    if (limit === 0) {
      limit = parseCoverageAmount(text);
    }

    // Apply default limits based on policy type if still 0
    if (limit === 0) {
      const defaults: Record<string, number> = {
        'GENERAL_LIABILITY': 5_000_000,
        'EMPLOYER_LIABILITY': 10_000_000,
        'PROFESSIONAL_INDEMNITY': 2_000_000,
        'CONTRACTOR_ALL_RISKS': 5_000_000,
        'PRODUCT_LIABILITY': 5_000_000,
        'PROPERTY': 1_000_000,
        'CAR_THIRD_PARTY': 1_000_000,
        'CAR_COMPULSORY': 0,
        'MOTOR_VEHICLE': 1_000_000,
      };
      limit = defaults[policyType] || 1_000_000;
    }

    // Extract endorsement codes relevant to this policy type section
    const sectionEndorsements = extractEndorsementCodes(sectionText);
    // Use section-specific ones if found, otherwise use all document codes
    const relevantEndorsements = sectionEndorsements.length > 0 ? sectionEndorsements : allEndorsementCodes;

    const requirement: ParsedRequirement = {
      policyType,
      policyTypeHe,
      minimumLimit: limit,
      requiredEndorsements: relevantEndorsements,
      requireAdditionalInsured: hasAdditionalInsured(sectionText, relevantEndorsements),
      requireWaiverSubrogation: hasWaiverSubrogation(sectionText, relevantEndorsements),
      isMandatory: true,
    };

    console.log(`   → ${policyTypeHe} (${policyType}): ₪${limit.toLocaleString()}, ${relevantEndorsements.length} endorsements`);

    requirements.push(requirement);
  }

  // If no policies found at all, create a basic general liability requirement
  if (requirements.length === 0) {
    console.log('   ⚠ No policy types detected, adding default GENERAL_LIABILITY');
    requirements.push({
      policyType: 'GENERAL_LIABILITY',
      policyTypeHe: 'צד שלישי',
      minimumLimit: 5_000_000,
      requiredEndorsements: allEndorsementCodes,
      requireAdditionalInsured: hasAdditionalInsured(text, allEndorsementCodes),
      requireWaiverSubrogation: hasWaiverSubrogation(text, allEndorsementCodes),
      isMandatory: true,
    });
  }

  return {
    serviceType,
    serviceTypeEn: serviceInfo.en,
    sector: serviceInfo.sector,
    requirements,
  };
}

// ─── Main seed function ───────────────────────────────────────────────
async function main() {
  const TEMPLATE_DIR = join(__dirname, '../../../Riskcovery_docs/local_authority_master');

  console.log('═══════════════════════════════════════════════════');
  console.log('  Seeding Local Authority Insurance Templates');
  console.log('═══════════════════════════════════════════════════');
  console.log(`Template directory: ${TEMPLATE_DIR}`);

  // Read all .docx files
  const allFiles = await readdir(TEMPLATE_DIR);
  const docxFiles = allFiles.filter(
    (f) => f.endsWith('.docx') && !f.startsWith('~$')
  );

  console.log(`\nFound ${docxFiles.length} .docx template files\n`);

  let created = 0;
  let updated = 0;

  for (const fileName of docxFiles) {
    const filePath = join(TEMPLATE_DIR, fileName);

    try {
      const parsed = await parseDocxTemplate(filePath, fileName);

      // Use the Hebrew service type as the template nameHe
      const templateName = `Local Authority - ${parsed.serviceTypeEn}`;
      const templateNameHe = `רשות מקומית - ${parsed.serviceType}`;

      // Check if template already exists (by Hebrew name)
      const existing = await prisma.comparisonTemplate.findFirst({
        where: { nameHe: templateNameHe },
      });

      if (existing) {
        // Update: delete old requirements and recreate
        await prisma.comparisonRequirement.deleteMany({
          where: { templateId: existing.id },
        });

        await prisma.comparisonTemplate.update({
          where: { id: existing.id },
          data: {
            name: templateName,
            description: `Insurance requirements for ${parsed.serviceTypeEn} services — Local authority standard`,
            descriptionHe: `דרישות ביטוח עבור שירותי ${parsed.serviceType} — תקן רשות מקומית`,
            sector: parsed.sector,
            contractType: 'LOCAL_AUTHORITY',
            requirements: {
              create: parsed.requirements.map((req) => ({
                policyType: req.policyType,
                policyTypeHe: req.policyTypeHe,
                minimumLimit: req.minimumLimit,
                requiredEndorsements: req.requiredEndorsements,
                requireAdditionalInsured: req.requireAdditionalInsured,
                requireWaiverSubrogation: req.requireWaiverSubrogation,
                isMandatory: req.isMandatory,
              })),
            },
          },
        });

        updated++;
        console.log(`   ✅ Updated: ${templateNameHe}`);
      } else {
        // Create new template with requirements
        await prisma.comparisonTemplate.create({
          data: {
            name: templateName,
            nameHe: templateNameHe,
            description: `Insurance requirements for ${parsed.serviceTypeEn} services — Local authority standard`,
            descriptionHe: `דרישות ביטוח עבור שירותי ${parsed.serviceType} — תקן רשות מקומית`,
            sector: parsed.sector,
            contractType: 'LOCAL_AUTHORITY',
            requirements: {
              create: parsed.requirements.map((req) => ({
                policyType: req.policyType,
                policyTypeHe: req.policyTypeHe,
                minimumLimit: req.minimumLimit,
                requiredEndorsements: req.requiredEndorsements,
                requireAdditionalInsured: req.requireAdditionalInsured,
                requireWaiverSubrogation: req.requireWaiverSubrogation,
                isMandatory: req.isMandatory,
              })),
            },
          },
        });

        created++;
        console.log(`   ✅ Created: ${templateNameHe}`);
      }
    } catch (err) {
      console.error(`   ❌ Error processing ${fileName}:`, err);
    }
  }

  console.log('\n═══════════════════════════════════════════════════');
  console.log(`  Done! Created: ${created}, Updated: ${updated}`);
  console.log(`  Total templates: ${created + updated}`);
  console.log('═══════════════════════════════════════════════════\n');

  // Verify by listing all local authority templates
  const templates = await prisma.comparisonTemplate.findMany({
    where: { contractType: 'LOCAL_AUTHORITY' },
    include: { requirements: true },
    orderBy: { nameHe: 'asc' },
  });

  console.log('Verification — Local Authority Templates:');
  for (const t of templates) {
    console.log(`  ${t.nameHe} — ${t.requirements.length} requirements`);
    for (const r of t.requirements) {
      console.log(`    • ${r.policyTypeHe}: ₪${Number(r.minimumLimit).toLocaleString()}, ${(r.requiredEndorsements as string[]).length} endorsements`);
    }
  }
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
