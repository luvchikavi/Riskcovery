'use client';

import {
  Dashboard as DashboardIcon,
  Business as BusinessIcon,
  Compare as CompareIcon,
} from '@mui/icons-material';
import { ModuleLayout, type NavItem } from '@/components/ModuleLayout';
import { colors } from '@/theme';

const navItems: NavItem[] = [
  { label: 'Dashboard', labelHe: 'לוח בקרה', href: '/insurers', icon: <DashboardIcon sx={{ fontSize: 20 }} /> },
  { label: 'Browse Insurers', labelHe: 'חברות ביטוח', href: '/insurers/browse', icon: <BusinessIcon sx={{ fontSize: 20 }} /> },
  { label: 'Compare Policies', labelHe: 'השוואת פוליסות', href: '/insurers/compare', icon: <CompareIcon sx={{ fontSize: 20 }} /> },
];

export default function InsurersLayout({ children }: { children: React.ReactNode }) {
  return (
    <ModuleLayout
      moduleTitle="Insurer Comparison"
      moduleTitleHe="השוואת מבטחים"
      navItems={navItems}
      accentColor={colors.violet}
    >
      {children}
    </ModuleLayout>
  );
}
