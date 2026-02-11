import { createTheme, alpha } from '@mui/material/styles';

// ─── Riscovery Design System ────────────────────────────────────
// Premium insurance advisory platform — Professional, trustworthy, modern
// ─────────────────────────────────────────────────────────────────

// Color tokens
const colors = {
  // Brand
  navy: '#0f172a',
  navyLight: '#1e293b',
  blue: '#3b82f6',
  blueDark: '#2563eb',
  blueLight: '#dbeafe',

  // Semantic
  emerald: '#10b981',
  emeraldLight: '#d1fae5',
  amber: '#f59e0b',
  amberLight: '#fef3c7',
  rose: '#ef4444',
  roseLight: '#fee2e2',
  violet: '#8b5cf6',
  violetLight: '#ede9fe',

  // Neutrals
  slate50: '#f8fafc',
  slate100: '#f1f5f9',
  slate200: '#e2e8f0',
  slate300: '#cbd5e1',
  slate400: '#94a3b8',
  slate500: '#64748b',
  slate600: '#475569',
  slate700: '#334155',
  slate800: '#1e293b',
  slate900: '#0f172a',
};

export const theme = createTheme({
  direction: 'rtl',
  palette: {
    mode: 'light',
    primary: {
      main: colors.blue,
      light: colors.blueLight,
      dark: colors.blueDark,
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: colors.navy,
      light: colors.navyLight,
      dark: '#020617',
      contrastText: '#FFFFFF',
    },
    success: {
      main: colors.emerald,
      light: colors.emeraldLight,
      dark: '#059669',
    },
    warning: {
      main: colors.amber,
      light: colors.amberLight,
      dark: '#d97706',
    },
    error: {
      main: colors.rose,
      light: colors.roseLight,
      dark: '#dc2626',
    },
    info: {
      main: colors.violet,
      light: colors.violetLight,
      dark: '#7c3aed',
    },
    background: {
      default: colors.slate50,
      paper: '#FFFFFF',
    },
    text: {
      primary: colors.slate900,
      secondary: colors.slate500,
    },
    divider: colors.slate200,
  },
  typography: {
    fontFamily: 'var(--font-rubik), "Rubik", var(--font-inter), "Inter", -apple-system, BlinkMacSystemFont, sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      letterSpacing: '-0.025em',
      lineHeight: 1.2,
      color: colors.slate900,
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
      letterSpacing: '-0.02em',
      lineHeight: 1.25,
      color: colors.slate900,
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.5rem',
      letterSpacing: '-0.015em',
      lineHeight: 1.3,
      color: colors.slate900,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.25rem',
      letterSpacing: '-0.01em',
      lineHeight: 1.35,
      color: colors.slate900,
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.125rem',
      letterSpacing: '-0.005em',
      lineHeight: 1.4,
      color: colors.slate900,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
      letterSpacing: 'normal',
      lineHeight: 1.5,
      color: colors.slate900,
    },
    body1: {
      fontSize: '0.9375rem',
      lineHeight: 1.65,
      color: colors.slate700,
    },
    body2: {
      fontSize: '0.8125rem',
      lineHeight: 1.6,
      color: colors.slate500,
    },
    caption: {
      fontSize: '0.75rem',
      letterSpacing: '0.01em',
      color: colors.slate400,
    },
    button: {
      fontWeight: 500,
      textTransform: 'none' as const,
      letterSpacing: '0.01em',
      fontSize: '0.875rem',
    },
    overline: {
      fontWeight: 600,
      fontSize: '0.6875rem',
      letterSpacing: '0.08em',
      textTransform: 'uppercase' as const,
      color: colors.slate400,
    },
  },
  shape: {
    borderRadius: 10,
  },
  shadows: [
    'none',
    '0 1px 2px 0 rgba(0,0,0,0.05)',
    '0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1)',
    '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',
    '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)',
    '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
    '0 25px 50px -12px rgba(0,0,0,0.25)',
    // Keep rest as MUI defaults
    '0 25px 50px -12px rgba(0,0,0,0.25)',
    '0 25px 50px -12px rgba(0,0,0,0.25)',
    '0 25px 50px -12px rgba(0,0,0,0.25)',
    '0 25px 50px -12px rgba(0,0,0,0.25)',
    '0 25px 50px -12px rgba(0,0,0,0.25)',
    '0 25px 50px -12px rgba(0,0,0,0.25)',
    '0 25px 50px -12px rgba(0,0,0,0.25)',
    '0 25px 50px -12px rgba(0,0,0,0.25)',
    '0 25px 50px -12px rgba(0,0,0,0.25)',
    '0 25px 50px -12px rgba(0,0,0,0.25)',
    '0 25px 50px -12px rgba(0,0,0,0.25)',
    '0 25px 50px -12px rgba(0,0,0,0.25)',
    '0 25px 50px -12px rgba(0,0,0,0.25)',
    '0 25px 50px -12px rgba(0,0,0,0.25)',
    '0 25px 50px -12px rgba(0,0,0,0.25)',
    '0 25px 50px -12px rgba(0,0,0,0.25)',
    '0 25px 50px -12px rgba(0,0,0,0.25)',
    '0 25px 50px -12px rgba(0,0,0,0.25)',
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        },
        '::-webkit-scrollbar': {
          width: '6px',
          height: '6px',
        },
        '::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '::-webkit-scrollbar-thumb': {
          background: colors.slate300,
          borderRadius: '3px',
        },
        '::-webkit-scrollbar-thumb:hover': {
          background: colors.slate400,
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 20px',
          fontWeight: 500,
          fontSize: '0.875rem',
          transition: 'all 0.15s ease',
        },
        sizeLarge: {
          padding: '10px 24px',
          fontSize: '0.9375rem',
        },
        sizeSmall: {
          padding: '5px 14px',
          fontSize: '0.8125rem',
        },
        containedPrimary: {
          background: `linear-gradient(135deg, ${colors.blue} 0%, ${colors.blueDark} 100%)`,
          '&:hover': {
            background: `linear-gradient(135deg, ${colors.blueDark} 0%, #1d4ed8 100%)`,
            transform: 'translateY(-1px)',
            boxShadow: `0 4px 12px ${alpha(colors.blue, 0.35)}`,
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        containedSecondary: {
          background: `linear-gradient(135deg, ${colors.navy} 0%, ${colors.navyLight} 100%)`,
          '&:hover': {
            background: `linear-gradient(135deg, #020617 0%, ${colors.navy} 100%)`,
            transform: 'translateY(-1px)',
            boxShadow: `0 4px 12px ${alpha(colors.navy, 0.35)}`,
          },
        },
        outlined: {
          borderColor: colors.slate200,
          color: colors.slate700,
          '&:hover': {
            backgroundColor: colors.slate50,
            borderColor: colors.slate300,
          },
        },
        text: {
          color: colors.slate600,
          '&:hover': {
            backgroundColor: alpha(colors.blue, 0.06),
            color: colors.blue,
          },
        },
      },
    },
    MuiCard: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          borderRadius: 14,
          border: `1px solid ${colors.slate200}`,
          transition: 'all 0.2s ease',
          '&:hover': {
            borderColor: colors.slate300,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'medium',
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: '#FFFFFF',
            '& fieldset': {
              borderColor: colors.slate200,
            },
            '&:hover fieldset': {
              borderColor: colors.slate300,
            },
            '&.Mui-focused fieldset': {
              borderColor: colors.blue,
              borderWidth: '1.5px',
            },
          },
          '& .MuiInputLabel-root': {
            color: colors.slate400,
            '&.Mui-focused': {
              color: colors.blue,
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          border: 'none',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '2px 8px',
          padding: '8px 12px',
          transition: 'all 0.15s ease',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          color: colors.slate900,
          boxShadow: 'none',
          borderBottom: `1px solid ${colors.slate200}`,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
          fontSize: '0.75rem',
        },
        colorPrimary: {
          backgroundColor: alpha(colors.blue, 0.1),
          color: colors.blue,
          border: 'none',
        },
        colorSuccess: {
          backgroundColor: alpha(colors.emerald, 0.1),
          color: colors.emerald,
          border: 'none',
        },
        colorWarning: {
          backgroundColor: alpha(colors.amber, 0.12),
          color: '#b45309',
          border: 'none',
        },
        colorError: {
          backgroundColor: alpha(colors.roseLight, 1),
          color: colors.rose,
          border: 'none',
        },
        colorInfo: {
          backgroundColor: alpha(colors.violet, 0.1),
          color: colors.violet,
          border: 'none',
        },
        outlined: {
          borderColor: colors.slate200,
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: colors.slate50,
            fontWeight: 600,
            fontSize: '0.75rem',
            color: colors.slate500,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            borderBottom: `1px solid ${colors.slate200}`,
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${colors.slate100}`,
          padding: '12px 16px',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: `${colors.slate50} !important`,
          },
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          borderRadius: '12px !important',
          border: `1px solid ${colors.slate200}`,
          boxShadow: 'none',
          '&:before': {
            display: 'none',
          },
          '&.Mui-expanded': {
            margin: '8px 0',
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          fontWeight: 500,
        },
        standardSuccess: {
          backgroundColor: colors.emeraldLight,
          color: '#065f46',
        },
        standardError: {
          backgroundColor: colors.roseLight,
          color: '#991b1b',
        },
        standardWarning: {
          backgroundColor: colors.amberLight,
          color: '#92400e',
        },
        standardInfo: {
          backgroundColor: colors.blueLight,
          color: '#1e40af',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: colors.slate200,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: colors.slate800,
          fontSize: '0.75rem',
          borderRadius: 6,
          padding: '6px 12px',
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem',
          fontWeight: 600,
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 10,
          border: `1px solid ${colors.slate200}`,
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          height: 6,
          backgroundColor: colors.slate100,
        },
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        root: {
          backgroundColor: colors.slate100,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          textTransform: 'none',
        },
      },
    },
  },
});

// Export color tokens for use in sx props
export { colors };
