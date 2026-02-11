'use client';

import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Inventory as CatalogIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { ModuleLayout, type NavItem } from '@/components/ModuleLayout';
import { colors } from '@/theme';

const navItems: NavItem[] = [
  { label: 'Dashboard', labelHe: 'לוח בקרה', href: '/rfq', icon: <DashboardIcon sx={{ fontSize: 20 }} /> },
  { label: 'Clients', labelHe: 'לקוחות', href: '/rfq/clients', icon: <PeopleIcon sx={{ fontSize: 20 }} /> },
  { label: 'Product Catalog', labelHe: 'קטלוג מוצרים', href: '/rfq/knowledge', icon: <CatalogIcon sx={{ fontSize: 20 }} /> },
  { label: 'Templates', labelHe: 'ניהול תבניות', href: '/rfq/admin/templates', icon: <SettingsIcon sx={{ fontSize: 20 }} /> },
];

export default function RfqLayout({ children }: { children: React.ReactNode }) {
  return (
    <ModuleLayout
      moduleTitle="RFQ Module"
      moduleTitleHe="מודול RFQ"
      navItems={navItems}
      accentColor={colors.blue}
    >
      {children}
    </ModuleLayout>
  );
}
