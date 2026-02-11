import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

interface MockClient {
  name: string;
  sector: string;
  employeeCount: number;
  annualRevenue: number;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  questionnaire: {
    status: string;
    answers: Prisma.InputJsonValue;
  };
}

const mockClients: MockClient[] = [
  {
    name: 'אלדד בנייה בע"מ',
    sector: 'CONSTRUCTION',
    employeeCount: 120,
    annualRevenue: 45000000,
    contactName: 'רונן אלדד',
    contactEmail: 'ronen@eldad-build.co.il',
    contactPhone: '03-5551234',
    questionnaire: {
      status: 'completed',
      answers: {
        companyAge: 15,
        employeeCount: 120,
        annualRevenue: 45000000,
        projectTypes: ['residential', 'commercial'],
        maxProjectValue: 20000000,
        heightWork: true,
        usesSubcontractors: true,
        subcontractorPercentage: 40,
        requireSubcontractorInsurance: true,
        undergroundWork: false,
        demolitionWork: true,
        hazardousMaterials: false,
      },
    },
  },
  {
    name: 'טק-נוב פתרונות בע"מ',
    sector: 'TECHNOLOGY',
    employeeCount: 85,
    annualRevenue: 32000000,
    contactName: 'מיכל כהן',
    contactEmail: 'michal@technov.co.il',
    contactPhone: '03-5559876',
    questionnaire: {
      status: 'completed',
      answers: {
        companyAge: 8,
        employeeCount: 85,
        annualRevenue: 32000000,
        productTypes: ['saas', 'mobile_apps'],
        hasIPO: false,
        storesPersonalData: true,
        dataVolume: 'high',
        internationalOperations: true,
      },
    },
  },
  {
    name: 'מפעלי הגליל תעשיות בע"מ',
    sector: 'MANUFACTURING',
    employeeCount: 200,
    annualRevenue: 80000000,
    contactName: 'דוד לוי',
    contactEmail: 'david@galilee-ind.co.il',
    contactPhone: '04-5553456',
    questionnaire: {
      status: 'completed',
      answers: {
        companyAge: 25,
        employeeCount: 200,
        annualRevenue: 80000000,
        productTypes: ['food_processing', 'packaging'],
        exportPercentage: 30,
        hazardousMaterials: true,
        machineryValue: 15000000,
      },
    },
  },
  {
    name: 'רשת שופ-פלוס בע"מ',
    sector: 'RETAIL',
    employeeCount: 350,
    annualRevenue: 120000000,
    contactName: 'שרה מזרחי',
    contactEmail: 'sara@shopplus.co.il',
    contactPhone: '02-5557890',
    questionnaire: {
      status: 'completed',
      answers: {
        companyAge: 12,
        employeeCount: 350,
        annualRevenue: 120000000,
        storeCount: 15,
        storeLocations: ['mall', 'street'],
        hasWarehouse: true,
        warehouseValue: 8000000,
      },
    },
  },
  {
    name: 'קליניקת חיים בריאים בע"מ',
    sector: 'HEALTHCARE',
    employeeCount: 45,
    annualRevenue: 18000000,
    contactName: 'ד"ר יוסי ברק',
    contactEmail: 'yossi@healthy-clinic.co.il',
    contactPhone: '09-5554567',
    questionnaire: {
      status: 'draft',
      answers: {
        companyAge: 5,
        employeeCount: 45,
        treatmentTypes: ['dental', 'physiotherapy'],
      },
    },
  },
  {
    name: 'לוגיסטיקה מהירה בע"מ',
    sector: 'LOGISTICS',
    employeeCount: 180,
    annualRevenue: 55000000,
    contactName: 'אמיר חסון',
    contactEmail: 'amir@fast-log.co.il',
    contactPhone: '08-5552345',
    questionnaire: {
      status: 'completed',
      answers: {
        companyAge: 10,
        employeeCount: 180,
        annualRevenue: 55000000,
        vehicleCount: 45,
        warehouseCount: 3,
        internationalShipping: true,
        cargoTypes: ['general', 'refrigerated', 'hazardous'],
      },
    },
  },
];

export async function seedMockData() {
  console.log('');
  console.log('=== Seeding Mock Customer Data ===');
  console.log('');

  // Step 1: Clear all customer-related data (in order respecting foreign keys)
  console.log('Clearing existing customer data...');

  await prisma.rfqDocument.deleteMany();
  console.log('  - Cleared RfqDocument');

  await prisma.rfqQuestionnaire.deleteMany();
  console.log('  - Cleared RfqQuestionnaire');

  await prisma.rfqClient.deleteMany();
  console.log('  - Cleared RfqClient');

  await prisma.comparisonAnalysis.deleteMany();
  console.log('  - Cleared ComparisonAnalysis');

  await prisma.comparisonTemplate.deleteMany();
  console.log('  - Cleared ComparisonTemplate');

  console.log('All customer data cleared.');
  console.log('');

  // Step 2: Find or create the demo organization
  const orgName = 'Riscovery Demo';
  let organization = await prisma.organization.findFirst({
    where: { name: orgName },
  });

  if (organization) {
    console.log(`Found existing organization: "${orgName}" (${organization.id})`);
  } else {
    organization = await prisma.organization.create({
      data: { name: orgName },
    });
    console.log(`Created organization: "${orgName}" (${organization.id})`);
  }

  console.log('');

  // Step 3: Create RFQ clients with questionnaires
  console.log('Creating mock RFQ clients...');

  for (const clientData of mockClients) {
    const client = await prisma.rfqClient.create({
      data: {
        organizationId: organization.id,
        name: clientData.name,
        sector: clientData.sector,
        employeeCount: clientData.employeeCount,
        annualRevenue: clientData.annualRevenue,
        contactName: clientData.contactName,
        contactEmail: clientData.contactEmail,
        contactPhone: clientData.contactPhone,
      },
    });

    const questionnaire = await prisma.rfqQuestionnaire.create({
      data: {
        clientId: client.id,
        answers: clientData.questionnaire.answers,
        status: clientData.questionnaire.status,
      },
    });

    const statusLabel =
      clientData.questionnaire.status === 'completed' ? 'completed' : 'draft';
    console.log(
      `  - ${clientData.name} (${clientData.sector}) — questionnaire: ${statusLabel}`,
    );
  }

  console.log('');
  console.log('=== Mock Data Seed Complete ===');
  console.log(`  Organization: ${orgName}`);
  console.log(`  Clients created: ${mockClients.length}`);
  console.log(`  Questionnaires created: ${mockClients.length}`);
  console.log('');
}

// Allow running directly: npx tsx prisma/seed-mock-data.ts
const isDirectRun = process.argv[1]?.includes('seed-mock-data');
if (isDirectRun) {
  seedMockData()
    .catch((e) => {
      console.error('Mock data seed failed:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
