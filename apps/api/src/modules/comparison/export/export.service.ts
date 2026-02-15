// @ts-nocheck
import ExcelJS from 'exceljs';
import { prisma } from '../../../lib/prisma.js';
import type {
  PolicyComparisonResult,
  ComparisonRow,
  ComplianceGap,
} from '../comparison.types.js';

const STATUS_FILLS: Record<string, string> = {
  PASS: 'E8F5E9',
  FAIL: 'FFEBEE',
  PARTIAL: 'FFF3E0',
  MISSING: 'F5F5F5',
};

const SEVERITY_FILLS: Record<string, string> = {
  critical: 'FFCDD2',
  major: 'FFE0B2',
  minor: 'E3F2FD',
};

const STATUS_LABEL: Record<string, string> = {
  PASS: 'תואם',
  FAIL: 'לא תואם',
  PARTIAL: 'חלקי',
  MISSING: 'חסר',
};

const OVERALL_STATUS_LABEL: Record<string, string> = {
  compliant: 'תואם',
  partial: 'תואם חלקית',
  non_compliant: 'לא תואם',
  missing: 'חסר',
  expired: 'פג תוקף',
};

const SEVERITY_LABEL: Record<string, string> = {
  critical: 'קריטי',
  major: 'משמעותי',
  minor: 'קל',
};

function formatValue(v: string | number | null | undefined): string {
  if (v == null) return '—';
  if (typeof v === 'number') return v.toLocaleString();
  return String(v);
}

export class ExportService {
  async generateExcel(analysisId: string): Promise<Buffer> {
    const analysis = await prisma.comparisonAnalysis.findUnique({
      where: { id: analysisId },
      include: {
        template: { include: { requirements: true } },
      },
    });

    if (!analysis) {
      throw new Error('Analysis not found');
    }

    const policyResults = (analysis.results as unknown as PolicyComparisonResult[]) || [];
    const template = analysis.template;

    const workbook = new ExcelJS.Workbook();
    workbook.views = [{ rightToLeft: true }];

    // ========== Sheet 1: Summary ==========
    const summarySheet = workbook.addWorksheet('סיכום', {
      views: [{ rightToLeft: true }],
    });

    // Title
    summarySheet.mergeCells('A1:E1');
    const titleCell = summarySheet.getCell('A1');
    titleCell.value = 'דוח בדיקת תאימות ביטוחית';
    titleCell.font = { size: 18, bold: true };
    titleCell.alignment = { horizontal: 'center' };

    // Date
    summarySheet.mergeCells('A2:E2');
    const dateCell = summarySheet.getCell('A2');
    dateCell.value = `תאריך: ${new Date(analysis.analyzedAt).toLocaleDateString('he-IL')}`;
    dateCell.font = { size: 12, color: { argb: '666666' } };
    dateCell.alignment = { horizontal: 'center' };

    // Template info
    if (template) {
      summarySheet.mergeCells('A3:E3');
      const tplCell = summarySheet.getCell('A3');
      tplCell.value = `תבנית: ${template.nameHe}${template.sector ? ` | ענף: ${template.sector}` : ''}`;
      tplCell.font = { size: 12 };
      tplCell.alignment = { horizontal: 'center' };
    }

    // Compliance score
    const scoreRow = 5;
    summarySheet.mergeCells(`A${scoreRow}:E${scoreRow}`);
    const scoreCell = summarySheet.getCell(`A${scoreRow}`);
    scoreCell.value = `ציון התאמה כולל: ${analysis.complianceScore}%`;
    scoreCell.font = { size: 16, bold: true };
    scoreCell.alignment = { horizontal: 'center' };

    // Overall status
    summarySheet.mergeCells(`A${scoreRow + 1}:E${scoreRow + 1}`);
    const statusCell = summarySheet.getCell(`A${scoreRow + 1}`);
    statusCell.value = `סטטוס: ${OVERALL_STATUS_LABEL[analysis.overallStatus] || analysis.overallStatus}`;
    statusCell.font = { size: 14, bold: true };
    statusCell.alignment = { horizontal: 'center' };

    // Counts table
    const countsHeaderRow = scoreRow + 3;
    const countsHeaders = ['קטגוריה', 'כמות'];
    const countsHeaderExcel = summarySheet.getRow(countsHeaderRow);
    countsHeaders.forEach((h, i) => {
      const cell = countsHeaderExcel.getCell(i + 1);
      cell.value = h;
      cell.font = { bold: true, color: { argb: 'FFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1976D2' } };
      cell.alignment = { horizontal: 'center' };
    });

    // Compute counts from policyResults
    let compliantCount = 0;
    let partialCount = 0;
    let nonCompliantCount = 0;
    let missingCount = 0;
    for (const pr of policyResults) {
      switch (pr.status) {
        case 'compliant': compliantCount++; break;
        case 'partial': partialCount++; break;
        case 'non_compliant': case 'expired': nonCompliantCount++; break;
        case 'missing': missingCount++; break;
      }
    }

    const countsData = [
      ['תואם', compliantCount],
      ['תואם חלקית', partialCount],
      ['לא תואם', nonCompliantCount],
      ['חסר', missingCount],
    ];
    countsData.forEach((row, i) => {
      const excelRow = summarySheet.getRow(countsHeaderRow + 1 + i);
      excelRow.getCell(1).value = row[0] as string;
      excelRow.getCell(2).value = row[1] as number;
      excelRow.getCell(2).alignment = { horizontal: 'center' };
    });

    // Set column widths
    summarySheet.columns = [
      { width: 20 }, { width: 15 }, { width: 20 }, { width: 20 }, { width: 20 },
    ];

    // ========== Sheet 2: Detailed Comparison ==========
    const detailSheet = workbook.addWorksheet('השוואה מפורטת', {
      views: [{ rightToLeft: true }],
    });

    const detailHeaders = ['סוג ביטוח', 'שדה', 'נדרש', 'הוצג', 'סטטוס'];
    const detailHeaderRow = detailSheet.getRow(1);
    detailHeaders.forEach((h, i) => {
      const cell = detailHeaderRow.getCell(i + 1);
      cell.value = h;
      cell.font = { bold: true, color: { argb: 'FFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1976D2' } };
      cell.alignment = { horizontal: 'center' };
    });

    let detailRowIdx = 2;
    for (const pr of policyResults) {
      const rows: ComparisonRow[] = pr.rows || [];
      for (const row of rows) {
        const excelRow = detailSheet.getRow(detailRowIdx);
        excelRow.getCell(1).value = row.policyTypeHe || '—';
        excelRow.getCell(2).value = row.fieldNameHe;

        // Format required/submitted — numbers get ₪ format
        const reqCell = excelRow.getCell(3);
        const subCell = excelRow.getCell(4);
        if (typeof row.required === 'number') {
          reqCell.value = row.required;
          reqCell.numFmt = '₪#,##0';
        } else {
          reqCell.value = formatValue(row.required);
        }
        if (typeof row.submitted === 'number') {
          subCell.value = row.submitted;
          subCell.numFmt = '₪#,##0';
        } else {
          subCell.value = formatValue(row.submitted);
        }

        const statusCell = excelRow.getCell(5);
        statusCell.value = STATUS_LABEL[row.status] || row.status;
        statusCell.alignment = { horizontal: 'center' };

        // Row fill
        const fillColor = STATUS_FILLS[row.status];
        if (fillColor) {
          for (let c = 1; c <= 5; c++) {
            excelRow.getCell(c).fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: fillColor },
            };
          }
        }

        detailRowIdx++;
      }
    }

    detailSheet.columns = [
      { width: 22 }, { width: 28 }, { width: 20 }, { width: 20 }, { width: 14 },
    ];

    // ========== Sheet 3: Gaps ==========
    const gapsSheet = workbook.addWorksheet('פערים', {
      views: [{ rightToLeft: true }],
    });

    const gapHeaders = ['סוג ביטוח', 'תיאור', 'חומרה', 'נדרש', 'נמצא', 'המלצה'];
    const gapHeaderRow = gapsSheet.getRow(1);
    gapHeaders.forEach((h, i) => {
      const cell = gapHeaderRow.getCell(i + 1);
      cell.value = h;
      cell.font = { bold: true, color: { argb: 'FFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D32F2F' } };
      cell.alignment = { horizontal: 'center' };
    });

    // Collect all gaps and sort by severity
    const allGaps: Array<{ policyTypeHe: string; gap: ComplianceGap }> = [];
    for (const pr of policyResults) {
      for (const gap of pr.gaps || []) {
        allGaps.push({ policyTypeHe: pr.policyTypeHe, gap });
      }
    }
    const severityOrder: Record<string, number> = { critical: 0, major: 1, minor: 2 };
    allGaps.sort((a, b) => (severityOrder[a.gap.severity] ?? 3) - (severityOrder[b.gap.severity] ?? 3));

    let gapRowIdx = 2;
    for (const { policyTypeHe, gap } of allGaps) {
      const excelRow = gapsSheet.getRow(gapRowIdx);
      excelRow.getCell(1).value = policyTypeHe;
      excelRow.getCell(2).value = gap.descriptionHe;

      const severityCell = excelRow.getCell(3);
      severityCell.value = SEVERITY_LABEL[gap.severity] || gap.severity;
      severityCell.alignment = { horizontal: 'center' };

      const reqCell = excelRow.getCell(4);
      if (typeof gap.required === 'number') {
        reqCell.value = gap.required;
        reqCell.numFmt = '₪#,##0';
      } else {
        reqCell.value = formatValue(gap.required);
      }

      const foundCell = excelRow.getCell(5);
      if (typeof gap.found === 'number') {
        foundCell.value = gap.found;
        foundCell.numFmt = '₪#,##0';
      } else {
        foundCell.value = formatValue(gap.found);
      }

      excelRow.getCell(6).value = gap.recommendationHe || gap.recommendation || '';

      // Severity fill
      const fillColor = SEVERITY_FILLS[gap.severity];
      if (fillColor) {
        for (let c = 1; c <= 6; c++) {
          excelRow.getCell(c).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: fillColor },
          };
        }
      }

      gapRowIdx++;
    }

    gapsSheet.columns = [
      { width: 22 }, { width: 35 }, { width: 12 }, { width: 18 }, { width: 18 }, { width: 40 },
    ];

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}

export const exportService = new ExportService();
