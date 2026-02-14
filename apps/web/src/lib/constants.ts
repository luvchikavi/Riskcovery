export const SECTORS = [
  { value: 'CONSTRUCTION', label: 'בנייה', labelEn: 'Construction' },
  { value: 'TECHNOLOGY', label: 'טכנולוגיה', labelEn: 'Technology' },
  { value: 'MANUFACTURING', label: 'ייצור', labelEn: 'Manufacturing' },
  { value: 'RETAIL', label: 'קמעונאות', labelEn: 'Retail' },
  { value: 'HEALTHCARE', label: 'בריאות', labelEn: 'Healthcare' },
  { value: 'LOGISTICS', label: 'לוגיסטיקה', labelEn: 'Logistics' },
  { value: 'CONSULTING', label: 'ייעוץ', labelEn: 'Consulting' },
] as const;

export const SECTORS_WITH_ALL = [
  { value: '', label: 'הכל', labelEn: 'All' },
  ...SECTORS,
] as const;

export const SECTORS_MAP: Record<string, { label: string; labelEn: string }> = Object.fromEntries(
  SECTORS.map((s) => [s.value, { label: s.label, labelEn: s.labelEn }])
);
