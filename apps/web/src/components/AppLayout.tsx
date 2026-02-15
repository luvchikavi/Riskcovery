'use client';

import {
  Menu as MenuIcon,
  Home as HomeIcon,
  AccountCircle as AccountCircleIcon,
  Logout as LogoutIcon,
  PersonSearch as PersonSearchIcon,
  Inventory as CatalogIcon,
  Settings as SettingsIcon,
  FactCheck as FactCheckIcon,
  Policy as PolicyIcon,
  Compare as CompareIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import {
  AppBar,
  Avatar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  alpha,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { colors } from '@/theme';

const DRAWER_WIDTH = 260;

interface NavItem {
  label: string;
  labelHe: string;
  href: string;
  icon: ReactNode;
}

interface NavSection {
  title: string;
  titleHe: string;
  accentColor: string;
  basePath: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Risk Management',
    titleHe: 'ניהול סיכונים',
    accentColor: colors.blue,
    basePath: '/rfq',
    items: [
      { label: 'Clients', labelHe: 'לקוחות', href: '/rfq/clients', icon: <PersonSearchIcon sx={{ fontSize: 20 }} /> },
      { label: 'Insurance Products', labelHe: 'מוצרי ביטוח', href: '/rfq/knowledge', icon: <CatalogIcon sx={{ fontSize: 20 }} /> },
      { label: 'RFQ Templates', labelHe: 'תבניות RFQ', href: '/rfq/admin/templates', icon: <SettingsIcon sx={{ fontSize: 20 }} /> },
    ],
  },
  {
    title: 'Compliance Check',
    titleHe: 'בדיקת תאימות',
    accentColor: colors.emerald,
    basePath: '/comparison',
    items: [
      { label: 'New Check', labelHe: 'בדיקה חדשה', href: '/comparison/analyze', icon: <FactCheckIcon sx={{ fontSize: 20 }} /> },
      { label: 'Requirement Templates', labelHe: 'תבניות דרישות', href: '/comparison/templates', icon: <PolicyIcon sx={{ fontSize: 20 }} /> },
    ],
  },
  {
    title: 'Insurers & Policies',
    titleHe: 'מבטחים ופוליסות',
    accentColor: colors.violet,
    basePath: '/insurers',
    items: [
      { label: 'Insurance Companies', labelHe: 'חברות ביטוח', href: '/insurers/browse', icon: <BusinessIcon sx={{ fontSize: 20 }} /> },
      { label: 'Compare Policies', labelHe: 'השוואת פוליסות', href: '/insurers/compare', icon: <CompareIcon sx={{ fontSize: 20 }} /> },
    ],
  },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  const getActiveSection = (): NavSection | undefined => {
    return NAV_SECTIONS.find((section) => pathname.startsWith(section.basePath));
  };

  const isActive = (item: NavItem) => {
    return pathname === item.href || pathname.startsWith(item.href + '/');
  };

  const isSectionActive = (section: NavSection) => {
    return pathname.startsWith(section.basePath);
  };

  const activeSection = getActiveSection();

  const drawer = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: `linear-gradient(180deg, ${colors.navy} 0%, ${colors.navyLight} 100%)`,
        color: '#FFFFFF',
      }}
    >
      {/* Logo area */}
      <Box sx={{ px: 2.5, pt: 3, pb: 2.5 }}>
        <Typography
          sx={{
            fontFamily: 'var(--font-inter), "Inter", sans-serif',
            fontWeight: 700,
            fontSize: '1.25rem',
            color: '#FFFFFF',
            letterSpacing: '-0.02em',
            mb: 0.25,
          }}
        >
          Riscovery
        </Typography>
        <Typography sx={{ color: alpha('#ffffff', 0.5), fontSize: '0.75rem', fontWeight: 500 }}>
          Insurance Advisory Platform
        </Typography>
      </Box>

      {/* Divider */}
      <Box sx={{ mx: 2.5, borderBottom: `1px solid ${alpha('#ffffff', 0.08)}` }} />

      {/* Navigation */}
      <List sx={{ flex: 1, pt: 1.5, px: 1, overflow: 'auto' }}>
        {NAV_SECTIONS.map((section, sectionIdx) => {
          const sectionIsActive = isSectionActive(section);
          return (
            <Box key={section.basePath}>
              {/* Divider between modules */}
              {sectionIdx > 0 && (
                <Box sx={{ mx: 1.5, my: 1, borderBottom: `1px solid ${alpha('#ffffff', 0.08)}` }} />
              )}

              {/* Section container with tinted background when active */}
              <Box
                sx={{
                  borderRadius: '10px',
                  bgcolor: sectionIsActive ? alpha(section.accentColor, 0.04) : 'transparent',
                  py: 0.5,
                  transition: 'background-color 0.2s ease',
                }}
              >
                {/* Section header — clickable, with colored left border + tinted bg */}
                <ListItemButton
                  component={Link}
                  href={section.basePath}
                  onClick={() => isMobile && setMobileOpen(false)}
                  sx={{
                    borderRadius: '8px',
                    mx: 0,
                    py: 0.75,
                    px: 1.5,
                    borderLeft: `3px solid ${section.accentColor}`,
                    bgcolor: alpha(section.accentColor, 0.08),
                    '&:hover': {
                      bgcolor: alpha(section.accentColor, 0.14),
                    },
                    mb: 0.5,
                  }}
                >
                  <Typography
                    sx={{
                      color: section.accentColor,
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {section.titleHe}
                  </Typography>
                </ListItemButton>

                {/* Section items */}
                {section.items.map((item) => {
                  const active = isActive(item);
                  return (
                    <ListItem key={item.href} disablePadding sx={{ mb: 0.25 }}>
                      <ListItemButton
                        component={Link}
                        href={item.href}
                        onClick={() => isMobile && setMobileOpen(false)}
                        sx={{
                          borderRadius: '8px',
                          mx: 0,
                          py: 1,
                          px: 1.5,
                          borderLeft: active
                            ? `3px solid ${section.accentColor}`
                            : '3px solid transparent',
                          bgcolor: active ? alpha('#ffffff', 0.12) : 'transparent',
                          '&:hover': {
                            bgcolor: alpha('#ffffff', 0.06),
                          },
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: 34,
                            color: active ? '#FFFFFF' : alpha('#ffffff', 0.45),
                          }}
                        >
                          {item.icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={item.labelHe}
                          secondary={item.label}
                          primaryTypographyProps={{
                            fontSize: '0.875rem',
                            fontWeight: active ? 600 : 400,
                            color: active ? '#FFFFFF' : alpha('#ffffff', 0.75),
                          }}
                          secondaryTypographyProps={{
                            fontSize: '0.6875rem',
                            color: alpha('#ffffff', 0.35),
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </Box>
            </Box>
          );
        })}
      </List>

      {/* Bottom section */}
      <Box sx={{ borderTop: `1px solid ${alpha('#ffffff', 0.08)}`, px: 1, pt: 1, pb: 0.5 }}>
        <List disablePadding>
          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              href="/"
              sx={{
                borderRadius: '8px',
                py: 1,
                px: 1.5,
                '&:hover': { bgcolor: alpha('#ffffff', 0.06) },
              }}
            >
              <ListItemIcon sx={{ minWidth: 34, color: alpha('#ffffff', 0.45) }}>
                <HomeIcon sx={{ fontSize: 20 }} />
              </ListItemIcon>
              <ListItemText
                primary="דף הבית"
                primaryTypographyProps={{ fontSize: '0.8125rem', color: alpha('#ffffff', 0.65) }}
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>

      {/* User section */}
      <Box
        sx={{
          mx: 1.5,
          mb: 1.5,
          p: 1.5,
          borderRadius: '10px',
          bgcolor: alpha('#ffffff', 0.05),
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <Avatar
          src={session?.user?.image || undefined}
          sx={{
            width: 32,
            height: 32,
            bgcolor: alpha('#ffffff', 0.15),
            color: '#FFFFFF',
            fontSize: '0.75rem',
          }}
        >
          {session?.user?.name?.charAt(0) || <AccountCircleIcon sx={{ fontSize: 18 }} />}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography noWrap sx={{ fontWeight: 500, fontSize: '0.8125rem', color: '#FFFFFF' }}>
            {session?.user?.name || 'Dev Mode'}
          </Typography>
          <Typography noWrap sx={{ color: alpha('#ffffff', 0.4), fontSize: '0.6875rem' }}>
            {session?.user?.email || 'מצב פיתוח'}
          </Typography>
        </Box>
        {session && (
          <IconButton
            size="small"
            onClick={() => signOut({ callbackUrl: '/' })}
            title="התנתק"
            sx={{ color: alpha('#ffffff', 0.4), '&:hover': { color: '#FFFFFF', bgcolor: alpha('#ffffff', 0.1) } }}
          >
            <LogoutIcon sx={{ fontSize: 16 }} />
          </IconButton>
        )}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {isMobile && (
        <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <IconButton aria-label="open drawer" edge="start" onClick={() => setMobileOpen(!mobileOpen)} sx={{ mr: 2 }}>
              <MenuIcon />
            </IconButton>
            <Typography
              variant="h6"
              noWrap
              sx={{ fontFamily: 'var(--font-inter), "Inter", sans-serif', fontWeight: 700 }}
            >
              Riscovery
            </Typography>
            {activeSection && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: activeSection.accentColor,
                  }}
                />
                <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>
                  {activeSection.titleHe}
                </Typography>
              </Box>
            )}
          </Toolbar>
        </AppBar>
      )}

      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            ModalProps={{ keepMounted: true }}
            sx={{ '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH, border: 'none' } }}
          >
            {drawer}
          </Drawer>
        ) : (
          <Drawer
            variant="permanent"
            sx={{ '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH, border: 'none' } }}
            open
          >
            {drawer}
          </Drawer>
        )}
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: { xs: 8, md: 0 },
          bgcolor: colors.slate50,
          minHeight: '100vh',
        }}
      >
        <Box sx={{ flex: 1, p: { xs: 2, md: 3.5 } }}>
          {children}
        </Box>

        {/* Footer — Drishti Consulting */}
        <Box
          component="footer"
          sx={{
            borderTop: `1px solid ${colors.slate200}`,
            bgcolor: '#FFFFFF',
            py: 2.5,
            px: { xs: 2, md: 3.5 },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 1.5,
            }}
          >
            {/* Left: Drishti branding */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/drishti-logo.svg"
                alt="Drishti Consulting"
                width={28}
                height={28}
              />
              <Box>
                <Typography
                  sx={{
                    fontFamily: 'var(--font-inter), "Inter", sans-serif',
                    fontWeight: 600,
                    fontSize: '0.8125rem',
                    color: colors.slate700,
                    letterSpacing: '-0.01em',
                    lineHeight: 1.2,
                  }}
                >
                  Drishti Consulting
                </Typography>
                <Typography
                  sx={{
                    fontSize: '0.6875rem',
                    color: colors.slate400,
                    fontStyle: 'italic',
                    lineHeight: 1.2,
                  }}
                >
                  Focused Vision. Precise Execution.
                </Typography>
              </Box>
            </Box>

            {/* Right: links & copyright */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography
                component="a"
                href="https://drishticonsulting.com"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  fontSize: '0.75rem',
                  color: colors.slate400,
                  textDecoration: 'none',
                  '&:hover': { color: '#6366f1' },
                  transition: 'color 0.15s',
                }}
              >
                drishticonsulting.com
              </Typography>
              <Typography
                sx={{ fontSize: '0.75rem', color: colors.slate300 }}
              >
                |
              </Typography>
              <Typography
                sx={{ fontSize: '0.75rem', color: colors.slate400 }}
              >
                &copy; {new Date().getFullYear()} Drishti Consulting
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
