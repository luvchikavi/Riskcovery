import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  direction: 'rtl',
  palette: {
    mode: 'light',
    primary: {
      main: '#1D1D1F',
      light: '#F5F5F7',
      dark: '#000000',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#0071E3',
      light: '#E8F2FE',
      dark: '#0058B0',
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#34C759',
      light: '#E8FAE8',
      dark: '#248A3D',
    },
    warning: {
      main: '#FF9500',
      light: '#FFF4E5',
      dark: '#C93400',
    },
    error: {
      main: '#FF3B30',
      light: '#FFE5E5',
      dark: '#D70015',
    },
    info: {
      main: '#5856D6',
      light: '#EEECFB',
      dark: '#3634A3',
    },
    background: {
      default: '#F5F5F7',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1D1D1F',
      secondary: '#86868B',
    },
    divider: 'rgba(0, 0, 0, 0.06)',
  },
  typography: {
    fontFamily: 'var(--font-heebo), "Heebo", var(--font-plus-jakarta), "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.75rem',
      letterSpacing: 'normal',
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 700,
      fontSize: '2.25rem',
      letterSpacing: 'normal',
      lineHeight: 1.25,
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
      letterSpacing: 'normal',
      lineHeight: 1.3,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      letterSpacing: 'normal',
      lineHeight: 1.35,
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      letterSpacing: 'normal',
      lineHeight: 1.4,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.0625rem',
      letterSpacing: 'normal',
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.7,
      letterSpacing: 'normal',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.65,
      letterSpacing: 'normal',
    },
    caption: {
      fontSize: '0.75rem',
      letterSpacing: 'normal',
      color: '#86868B',
    },
    button: {
      fontWeight: 500,
      textTransform: 'none',
      letterSpacing: 'normal',
      fontSize: '0.9375rem',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '10px 24px',
          fontWeight: 500,
          fontSize: '0.9375rem',
        },
        containedPrimary: {
          backgroundColor: '#1D1D1F',
          boxShadow: 'none',
          '&:hover': {
            backgroundColor: '#424245',
            boxShadow: 'none',
          },
        },
        containedSecondary: {
          backgroundColor: '#0071E3',
          boxShadow: 'none',
          '&:hover': {
            backgroundColor: '#0058B0',
            boxShadow: 'none',
          },
        },
        outlined: {
          borderColor: 'rgba(0, 0, 0, 0.12)',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.03)',
            borderColor: 'rgba(0, 0, 0, 0.2)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          border: '1px solid rgba(0, 0, 0, 0.06)',
          boxShadow: 'none',
          transition: 'box-shadow 0.2s ease',
          '&:hover': {
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
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
            borderRadius: 12,
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
          backgroundColor: '#FFFFFF',
          borderInlineEnd: '1px solid rgba(0, 0, 0, 0.06)',
          borderLeft: 'none',
          borderRight: 'none',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          margin: '2px 8px',
          padding: '8px 12px',
          transition: 'all 0.15s ease',
          '&.Mui-selected': {
            backgroundColor: '#F5F5F7',
            color: '#1D1D1F',
            fontWeight: 600,
            '&:hover': {
              backgroundColor: '#F0F0F2',
            },
          },
          '&:hover': {
            backgroundColor: '#F5F5F7',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.72)',
          backdropFilter: 'saturate(180%) blur(20px)',
          WebkitBackdropFilter: 'saturate(180%) blur(20px)',
          color: '#1D1D1F',
          boxShadow: 'none',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: '#F5F5F7',
            fontWeight: 600,
            fontSize: '0.8125rem',
            color: '#86868B',
            textTransform: 'uppercase',
            letterSpacing: '0.02em',
          },
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          borderRadius: '16px !important',
          border: '1px solid rgba(0, 0, 0, 0.06)',
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
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(0, 0, 0, 0.06)',
        },
      },
    },
  },
});
