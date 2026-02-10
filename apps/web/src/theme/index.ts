import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  direction: 'rtl',
  palette: {
    mode: 'light',
    primary: {
      main: '#4F46E5',
      light: '#E0E7FF',
      dark: '#3730A3',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#0D9488',
      light: '#CCFBF1',
      dark: '#0F766E',
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#059669',
      light: '#D1FAE5',
      dark: '#047857',
    },
    warning: {
      main: '#D97706',
      light: '#FEF3C7',
      dark: '#B45309',
    },
    error: {
      main: '#DC2626',
      light: '#FEE2E2',
      dark: '#B91C1C',
    },
    info: {
      main: '#0284C7',
      light: '#E0F2FE',
      dark: '#075985',
    },
    background: {
      default: '#FAFAF9',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#18181B',
      secondary: '#71717A',
    },
    divider: 'rgba(0, 0, 0, 0.08)',
  },
  typography: {
    fontFamily: 'var(--font-heebo), "Heebo", "Plus Jakarta Sans", sans-serif',
    h1: {
      fontWeight: 700,
      letterSpacing: 'normal',
      lineHeight: 1.3,
    },
    h2: {
      fontWeight: 700,
      letterSpacing: 'normal',
      lineHeight: 1.35,
    },
    h3: {
      fontWeight: 600,
      letterSpacing: 'normal',
      lineHeight: 1.4,
    },
    h4: {
      fontWeight: 600,
      letterSpacing: 'normal',
      lineHeight: 1.4,
    },
    h5: {
      fontWeight: 500,
      letterSpacing: 'normal',
      lineHeight: 1.5,
    },
    h6: {
      fontWeight: 500,
      letterSpacing: 'normal',
      lineHeight: 1.5,
    },
    body1: {
      lineHeight: 1.7,
      letterSpacing: 'normal',
    },
    body2: {
      lineHeight: 1.7,
      letterSpacing: 'normal',
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
      letterSpacing: 'normal',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '10px 24px',
          fontWeight: 600,
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)',
          boxShadow: '0 1px 3px rgba(79, 70, 229, 0.3)',
          '&:hover': {
            background: 'linear-gradient(135deg, #4338CA 0%, #4F46E5 100%)',
            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.4)',
          },
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #0D9488 0%, #14B8A6 100%)',
          boxShadow: '0 1px 3px rgba(13, 148, 136, 0.3)',
          '&:hover': {
            background: 'linear-gradient(135deg, #0F766E 0%, #0D9488 100%)',
            boxShadow: '0 4px 12px rgba(13, 148, 136, 0.4)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          '&:hover': {
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08), 0 4px 10px rgba(0, 0, 0, 0.04)',
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'medium',
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
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderInlineEnd: '1px solid rgba(0, 0, 0, 0.08)',
          borderLeft: 'none',
          borderRight: 'none',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          margin: '4px 12px',
          position: 'relative',
          transition: 'all 0.2s ease',
          '&.Mui-selected': {
            backgroundColor: '#E0E7FF',
            color: '#4F46E5',
            '&:hover': {
              backgroundColor: '#E0E7FF',
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              insetInlineEnd: 0,
              top: '20%',
              height: '60%',
              width: 4,
              borderRadius: 4,
              backgroundColor: '#4F46E5',
            },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #4F46E5 0%, #0D9488 100%)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: '#FAFAF9',
            fontWeight: 600,
          },
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          borderRadius: '12px !important',
          border: '1px solid rgba(0, 0, 0, 0.08)',
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
  },
});
