'use client';

import {
  Dashboard as DashboardIcon,
  Description as DocumentIcon,
  ListAlt as TemplateIcon,
  Compare as CompareIcon,
} from '@mui/icons-material';
import { ModuleLayout, type NavItem } from '@/components/ModuleLayout';
import { colors } from '@/theme';

const navItems: NavItem[] = [
  { label: 'Dashboard', labelHe: 'לוח בקרה', href: '/comparison', icon: <DashboardIcon sx={{ fontSize: 20 }} /> },
  { label: 'Documents', labelHe: 'מסמכים', href: '/comparison/documents', icon: <DocumentIcon sx={{ fontSize: 20 }} /> },
  { label: 'Templates', labelHe: 'תבניות', href: '/comparison/templates', icon: <TemplateIcon sx={{ fontSize: 20 }} /> },
  { label: 'Analyze', labelHe: 'ניתוח', href: '/comparison/analyze', icon: <CompareIcon sx={{ fontSize: 20 }} /> },
];

export default function ComparisonLayout({ children }: { children: React.ReactNode }) {
  return (
    <ModuleLayout
      moduleTitle="Certificate Comparison"
      moduleTitleHe="השוואת אישורים"
      navItems={navItems}
      accentColor={colors.emerald}
    >
      {children}
    </ModuleLayout>
  );
}
