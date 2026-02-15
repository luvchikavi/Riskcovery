'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import {
  comparisonApi,
  type ComparisonAnalysis,
  type ComparisonTemplate,
  type ComparisonRow,
  type ComparisonFieldStatus,
} from '@/lib/api';

const STATUS_LABEL: Record<string, string> = {
  compliant: 'תואם',
  partial: 'תואם חלקית',
  non_compliant: 'לא תואם',
  missing: 'חסר',
  expired: 'פג תוקף',
};

const FIELD_STATUS_LABEL: Record<ComparisonFieldStatus, string> = {
  PASS: 'תואם',
  FAIL: 'לא תואם',
  PARTIAL: 'חלקי',
  MISSING: 'חסר',
};

const SEVERITY_LABEL: Record<string, string> = {
  critical: 'קריטי',
  major: 'משמעותי',
  minor: 'קל',
};

function formatValue(v: string | number | null | undefined): string {
  if (v == null) return '—';
  if (typeof v === 'number') return `₪${v.toLocaleString()}`;
  return String(v);
}

export default function PrintPage() {
  const params = useParams();
  const analysisId = params.id as string;

  const [analysis, setAnalysis] = useState<ComparisonAnalysis | null>(null);
  const [template, setTemplate] = useState<ComparisonTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const response = await comparisonApi.analysis.get(analysisId);
        if (response.success && response.data) {
          setAnalysis(response.data);
          if (response.data.template) {
            setTemplate(response.data.template);
          } else if (response.data.requirementTemplateId) {
            try {
              const tplResponse = await comparisonApi.templates.get(response.data.requirementTemplateId);
              if (tplResponse.success && tplResponse.data) {
                setTemplate(tplResponse.data);
              }
            } catch {
              // Template fetch is non-critical
            }
          }
        } else {
          setError('ניתוח לא נמצא');
        }
      } catch {
        setError('שגיאה בטעינת הניתוח');
      } finally {
        setLoading(false);
      }
    })();
  }, [analysisId]);

  // Auto-trigger print once data is loaded
  useEffect(() => {
    if (!loading && analysis && !error) {
      const timer = setTimeout(() => window.print(), 500);
      return () => clearTimeout(timer);
    }
  }, [loading, analysis, error]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px', fontFamily: 'sans-serif' }}>
        <p>טוען...</p>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px', fontFamily: 'sans-serif' }}>
        <p>{error || 'ניתוח לא נמצא'}</p>
        <Link href={`/comparison/${analysisId}`}>חזרה לניתוח</Link>
      </div>
    );
  }

  const allRows: ComparisonRow[] = analysis.policyResults.flatMap((pr) => pr.rows || []);

  const scoreColor =
    analysis.complianceScore >= 80
      ? '#2E7D32'
      : analysis.complianceScore >= 50
      ? '#ED6C02'
      : '#D32F2F';

  return (
    <>
      <style>{`
        @media print {
          body { margin: 0; padding: 0; }
          .no-print { display: none !important; }
          @page { size: A4; margin: 15mm; }
          table { page-break-inside: auto; }
          tr { page-break-inside: avoid; page-break-after: auto; }
          .page-break { page-break-before: always; }
        }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          color: #1D1D1F;
          background: white;
          direction: rtl;
        }
        .print-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        h1 { font-size: 24px; margin: 0 0 4px; }
        h2 { font-size: 18px; margin: 24px 0 12px; border-bottom: 2px solid #1976D2; padding-bottom: 6px; }
        h3 { font-size: 15px; margin: 16px 0 8px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 13px; }
        th { background: #1976D2; color: white; padding: 8px 10px; text-align: right; font-weight: 600; }
        td { padding: 6px 10px; border-bottom: 1px solid #E0E0E0; }
        .score-circle {
          display: inline-flex; align-items: center; justify-content: center;
          width: 80px; height: 80px; border-radius: 50%;
          border: 4px solid; font-size: 28px; font-weight: 700;
        }
        .stats-grid { display: flex; gap: 16px; margin: 16px 0; }
        .stat-box { flex: 1; text-align: center; padding: 12px; border-radius: 8px; }
        .stat-value { font-size: 28px; font-weight: 700; }
        .stat-label { font-size: 12px; font-weight: 600; color: #666; }
        .status-pass { background: #E8F5E9; }
        .status-fail { background: #FFEBEE; }
        .status-partial { background: #FFF3E0; }
        .status-missing { background: #F5F5F5; }
        .severity-critical { background: #FFCDD2; }
        .severity-major { background: #FFE0B2; }
        .severity-minor { background: #E3F2FD; }
        .gap-card { border: 1px solid #E0E0E0; border-radius: 6px; padding: 10px 14px; margin-bottom: 8px; }
        .gap-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
        .gap-severity { padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; color: white; }
        .severity-critical-badge { background: #D32F2F; }
        .severity-major-badge { background: #ED6C02; }
        .severity-minor-badge { background: #1976D2; }
        .template-card { background: #E3F2FD; border-radius: 8px; padding: 12px 16px; margin: 12px 0; }
        .back-link { display: inline-block; margin: 16px 0; color: #1976D2; text-decoration: none; }
        .footer { margin-top: 32px; padding-top: 12px; border-top: 1px solid #E0E0E0; font-size: 11px; color: #999; text-align: center; }
      `}</style>

      <div className="print-container">
        {/* Back link (hidden on print) */}
        <div className="no-print" style={{ marginBottom: 16 }}>
          <Link href={`/comparison/${analysisId}`} className="back-link">
            &larr; חזרה לניתוח
          </Link>
        </div>

        {/* Header */}
        <h1>דוח בדיקת תאימות ביטוחית</h1>
        <p style={{ color: '#666', margin: '0 0 16px', fontSize: 14 }}>
          {new Date(analysis.analyzedAt).toLocaleDateString('he-IL', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
          {template && ` | תבנית: ${template.nameHe}`}
        </p>

        {/* Score + Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 16 }}>
          <div className="score-circle" style={{ borderColor: scoreColor, color: scoreColor }}>
            {analysis.complianceScore}
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 600 }}>
              {STATUS_LABEL[analysis.overallStatus] || analysis.overallStatus}
            </div>
            <div style={{ fontSize: 13, color: '#666' }}>
              {analysis.totalRequirements} דרישות נבדקו
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-box" style={{ background: '#E8F5E9' }}>
            <div className="stat-value" style={{ color: '#2E7D32' }}>{analysis.compliantCount}</div>
            <div className="stat-label">תואם</div>
          </div>
          <div className="stat-box" style={{ background: '#FFF3E0' }}>
            <div className="stat-value" style={{ color: '#ED6C02' }}>{analysis.partialCount}</div>
            <div className="stat-label">תואם חלקית</div>
          </div>
          <div className="stat-box" style={{ background: '#FFEBEE' }}>
            <div className="stat-value" style={{ color: '#D32F2F' }}>{analysis.nonCompliantCount}</div>
            <div className="stat-label">לא תואם</div>
          </div>
          <div className="stat-box" style={{ background: '#F5F5F5' }}>
            <div className="stat-value" style={{ color: '#757575' }}>{analysis.missingCount}</div>
            <div className="stat-label">חסר</div>
          </div>
        </div>

        {/* Template Info */}
        {template && (
          <div className="template-card">
            <strong>תבנית: {template.nameHe}</strong>
            <div style={{ fontSize: 12, color: '#555', marginTop: 2 }}>
              {template.descriptionHe || template.description || ''}
              {template.requirements?.length ? ` | ${template.requirements.length} סוגי פוליסות` : ''}
              {template.sector ? ` | ענף: ${template.sector}` : ''}
            </div>
          </div>
        )}

        {/* Comparison Table */}
        {allRows.length > 0 && (
          <>
            <h2>טבלת השוואה מפורטת</h2>
            <table>
              <thead>
                <tr>
                  <th>סוג ביטוח</th>
                  <th>שדה</th>
                  <th>נדרש</th>
                  <th>הוצג</th>
                  <th style={{ textAlign: 'center' }}>סטטוס</th>
                </tr>
              </thead>
              <tbody>
                {allRows.map((row, idx) => (
                  <tr
                    key={idx}
                    className={
                      row.status === 'PASS'
                        ? 'status-pass'
                        : row.status === 'FAIL'
                        ? 'status-fail'
                        : row.status === 'PARTIAL'
                        ? 'status-partial'
                        : 'status-missing'
                    }
                  >
                    <td style={{ fontWeight: 500 }}>{row.policyTypeHe || '—'}</td>
                    <td>{row.fieldNameHe}</td>
                    <td>{formatValue(row.required)}</td>
                    <td>{formatValue(row.submitted)}</td>
                    <td style={{ textAlign: 'center', fontWeight: 600 }}>
                      {FIELD_STATUS_LABEL[row.status] || row.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* Gaps per policy */}
        {analysis.policyResults.some((pr) => pr.gaps?.length > 0) && (
          <>
            <h2 className="page-break">פערים והמלצות</h2>
            {analysis.policyResults
              .filter((pr) => pr.gaps?.length > 0)
              .map((pr) => (
                <div key={pr.requirementId} style={{ marginBottom: 16 }}>
                  <h3>{pr.policyTypeHe} — {STATUS_LABEL[pr.status] || pr.status}</h3>
                  {pr.gaps
                    .sort((a, b) => {
                      const order: Record<string, number> = { critical: 0, major: 1, minor: 2 };
                      return (order[a.severity] ?? 3) - (order[b.severity] ?? 3);
                    })
                    .map((gap, gIdx) => (
                      <div
                        key={gIdx}
                        className={`gap-card ${
                          gap.severity === 'critical'
                            ? 'severity-critical'
                            : gap.severity === 'major'
                            ? 'severity-major'
                            : 'severity-minor'
                        }`}
                      >
                        <div className="gap-header">
                          <strong style={{ fontSize: 13 }}>{gap.descriptionHe}</strong>
                          <span
                            className={`gap-severity ${
                              gap.severity === 'critical'
                                ? 'severity-critical-badge'
                                : gap.severity === 'major'
                                ? 'severity-major-badge'
                                : 'severity-minor-badge'
                            }`}
                          >
                            {SEVERITY_LABEL[gap.severity] || gap.severity}
                          </span>
                        </div>
                        {(gap.required != null || gap.found != null) && (
                          <div style={{ fontSize: 12, color: '#555', marginBottom: 2 }}>
                            נדרש: {formatValue(gap.required)} | נמצא: {formatValue(gap.found)}
                          </div>
                        )}
                        {gap.recommendationHe && (
                          <div style={{ fontSize: 12, color: '#1976D2', fontWeight: 500 }}>
                            המלצה: {gap.recommendationHe}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              ))}
          </>
        )}

        {/* Footer */}
        <div className="footer">
          נוצר על ידי Riscovery | {new Date().toLocaleString('he-IL')}
        </div>
      </div>
    </>
  );
}
