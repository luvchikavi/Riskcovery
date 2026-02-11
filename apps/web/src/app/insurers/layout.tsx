'use client';

import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Business as BusinessIcon,
  Compare as CompareIcon,
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
  useMediaQuery,
  useTheme,
} from '@mui/material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';

const DRAWER_WIDTH = 264;

interface NavItem {
  label: string;
  labelHe: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', labelHe: 'לוח בקרה', href: '/insurers', icon: <DashboardIcon /> },
  { label: 'Browse Insurers', labelHe: 'חברות ביטוח', href: '/insurers/browse', icon: <BusinessIcon /> },
  { label: 'Compare Policies', labelHe: 'השוואת פוליסות', href: '/insurers/compare', icon: <CompareIcon /> },
];

export default function InsurersLayout({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const isActive = (href: string) => {
    if (href === '/insurers') return pathname === '/insurers';
    return pathname.startsWith(href);
  };

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ px: 2.5, pt: 3, pb: 2 }}>
        <Typography
          variant="h6"
          sx={{
            fontFamily: 'var(--font-plus-jakarta), "Plus Jakarta Sans", sans-serif',
            fontWeight: 700,
            fontSize: '1.25rem',
            color: '#1D1D1F',
            letterSpacing: '-0.01em',
          }}
        >
          Riscovery
        </Typography>
        <Typography variant="caption" sx={{ color: '#86868B', fontSize: '0.75rem' }}>
          השוואת מבטחים
        </Typography>
      </Box>

      <List sx={{ flex: 1, pt: 1, px: 0.5 }}>
        {navItems.map((item) => (
          <ListItem key={item.href} disablePadding>
            <ListItemButton
              component={Link}
              href={item.href}
              selected={isActive(item.href)}
              onClick={() => isMobile && setMobileOpen(false)}
            >
              <ListItemIcon
                sx={{
                  minWidth: 36,
                  color: isActive(item.href) ? '#1D1D1F' : '#86868B',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.labelHe}
                secondary={item.label}
                primaryTypographyProps={{
                  fontSize: '0.9375rem',
                  fontWeight: isActive(item.href) ? 600 : 400,
                }}
                secondaryTypographyProps={{ fontSize: '0.75rem' }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Box sx={{ borderTop: '1px solid rgba(0,0,0,0.06)', pt: 1, pb: 1, px: 0.5 }}>
        <List disablePadding>
          <ListItem disablePadding>
            <ListItemButton component={Link} href="/">
              <ListItemIcon sx={{ minWidth: 36, color: '#86868B' }}>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText
                primary="חזרה לדף הבית"
                secondary="Back to Home"
                primaryTypographyProps={{ fontSize: '0.9375rem' }}
                secondaryTypographyProps={{ fontSize: '0.75rem' }}
              />
            </ListItemButton>
          </ListItem>
        </List>
        <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar
            src={session?.user?.image || undefined}
            sx={{ width: 32, height: 32, bgcolor: '#F5F5F7', color: '#86868B' }}
          >
            {!session?.user?.image && <AccountCircleIcon sx={{ fontSize: 20 }} />}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8125rem', color: '#1D1D1F' }} noWrap>
              {session?.user?.name || 'Dev Mode'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#86868B', fontSize: '0.6875rem' }} noWrap>
              {session?.user?.email || 'מצב פיתוח'}
            </Typography>
          </Box>
          {session && (
            <IconButton size="small" onClick={() => signOut({ callbackUrl: '/' })} title="התנתק">
              <LogoutIcon sx={{ fontSize: 16, color: '#86868B' }} />
            </IconButton>
          )}
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {isMobile && (
        <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <IconButton
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, color: '#1D1D1F' }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              variant="h6"
              noWrap
              sx={{
                fontFamily: 'var(--font-plus-jakarta), "Plus Jakarta Sans", sans-serif',
                fontWeight: 700,
                color: '#1D1D1F',
              }}
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
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{ '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH } }}
          >
            {drawer}
          </Drawer>
        ) : (
          <Drawer
            variant="permanent"
            sx={{ '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH } }}
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
          p: { xs: 2, md: 4 },
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: { xs: 8, md: 0 },
          backgroundColor: '#F5F5F7',
          minHeight: '100vh',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
