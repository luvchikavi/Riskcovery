'use client';

import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Description as DocumentIcon,
  ListAlt as TemplateIcon,
  Compare as CompareIcon,
  Home as HomeIcon,
  AccountCircle as AccountCircleIcon,
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

const DRAWER_WIDTH = 272;

interface NavItem {
  label: string;
  labelHe: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', labelHe: 'לוח בקרה', href: '/comparison', icon: <DashboardIcon /> },
  { label: 'Documents', labelHe: 'מסמכים', href: '/comparison/documents', icon: <DocumentIcon /> },
  { label: 'Templates', labelHe: 'תבניות', href: '/comparison/templates', icon: <TemplateIcon /> },
  { label: 'Analyze', labelHe: 'ניתוח', href: '/comparison/analyze', icon: <CompareIcon /> },
];

export default function ComparisonLayout({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const isActive = (href: string) => {
    if (href === '/comparison') return pathname === '/comparison';
    return pathname.startsWith(href);
  };

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Gradient logo area */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #4F46E5 0%, #0D9488 100%)',
          p: 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 64,
        }}
      >
        <Typography
          variant="h6"
          fontWeight="bold"
          sx={{
            color: '#FFFFFF',
            fontFamily: 'var(--font-plus-jakarta), "Plus Jakarta Sans", sans-serif',
            letterSpacing: '0.02em',
          }}
        >
          השוואת אישורים
        </Typography>
      </Box>

      {/* Navigation */}
      <List sx={{ flex: 1, pt: 2 }}>
        {navItems.map((item) => (
          <ListItem key={item.href} disablePadding>
            <ListItemButton
              component={Link}
              href={item.href}
              selected={isActive(item.href)}
              onClick={() => isMobile && setMobileOpen(false)}
            >
              <ListItemIcon sx={{ color: isActive(item.href) ? 'primary.main' : 'text.secondary' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.labelHe} secondary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* Bottom section — back to home + user avatar */}
      <Box sx={{ mt: 'auto', borderTop: '1px solid', borderColor: 'divider', pt: 1, pb: 1 }}>
        <List disablePadding>
          <ListItem disablePadding>
            <ListItemButton component={Link} href="/">
              <ListItemIcon>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary="חזרה לדף הבית" secondary="Back to Home" />
            </ListItemButton>
          </ListItem>
        </List>
        <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.light', color: 'primary.main' }}>
            <AccountCircleIcon fontSize="small" />
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={600}>יועץ ביטוח</Typography>
            <Typography variant="caption" color="text.secondary">Insurance Advisor</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* AppBar for mobile */}
      {isMobile && (
        <AppBar
          position="fixed"
          sx={{
            width: '100%',
            zIndex: theme.zIndex.drawer + 1,
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ fontFamily: 'var(--font-plus-jakarta), "Plus Jakarta Sans", sans-serif' }}
            >
              השוואת אישורים
            </Typography>
          </Toolbar>
        </AppBar>
      )}

      {/* Drawer - permanent on desktop, temporary on mobile */}
      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: DRAWER_WIDTH,
              },
            }}
          >
            {drawer}
          </Drawer>
        ) : (
          <Drawer
            variant="permanent"
            sx={{
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: DRAWER_WIDTH,
              },
            }}
            open
          >
            {drawer}
          </Drawer>
        )}
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: { xs: 8, md: 0 },
          backgroundColor: 'background.default',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
