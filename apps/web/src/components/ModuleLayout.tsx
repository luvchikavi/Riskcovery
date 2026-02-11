'use client';

import {
  Menu as MenuIcon,
  Home as HomeIcon,
  AccountCircle as AccountCircleIcon,
  Logout as LogoutIcon,
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

export interface NavItem {
  label: string;
  labelHe: string;
  href: string;
  icon: ReactNode;
}

interface ModuleLayoutProps {
  children: ReactNode;
  moduleTitle: string;
  moduleTitleHe: string;
  navItems: NavItem[];
  accentColor?: string;
}

export function ModuleLayout({ children, moduleTitle, moduleTitleHe, navItems, accentColor = colors.blue }: ModuleLayoutProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  const basePath = navItems[0]?.href.split('/').slice(0, 2).join('/') || '/';

  const isActive = (href: string) => {
    if (href === basePath) return pathname === basePath;
    return pathname.startsWith(href);
  };

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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: accentColor }} />
          <Typography sx={{ color: alpha('#ffffff', 0.5), fontSize: '0.75rem', fontWeight: 500 }}>
            {moduleTitle}
          </Typography>
        </Box>
      </Box>

      {/* Divider */}
      <Box sx={{ mx: 2.5, borderBottom: `1px solid ${alpha('#ffffff', 0.08)}` }} />

      {/* Navigation */}
      <List sx={{ flex: 1, pt: 1.5, px: 1 }}>
        {navItems.map((item) => {
          const active = isActive(item.href);
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
                  bgcolor: active ? alpha('#ffffff', 0.1) : 'transparent',
                  borderRight: active ? `2px solid ${accentColor}` : '2px solid transparent',
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
          p: { xs: 2, md: 3.5 },
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: { xs: 8, md: 0 },
          bgcolor: colors.slate50,
          minHeight: '100vh',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
