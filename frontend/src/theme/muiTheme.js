import { createTheme } from '@mui/material';

export const muiTheme = createTheme({
  palette: {
    mode: 'dark',
    primary:    { main: '#8B1A2E', light: '#B02740', dark: '#5A1020' },
    secondary:  { main: '#C9952A', light: '#E8B84B', dark: '#8B6518' },
    background: { default: '#0D0B0E', paper: '#141118' },
    text:       { primary: '#E8E0D5', secondary: '#8C8070' },
    error:      { main: '#E57373' },
    success:    { main: '#4CAF7D' },
    divider:    '#3A2D20',
  },
  typography: {
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  shape: { borderRadius: 3 },
  components: {
    MuiButton: { 
      styleOverrides: { 
        root: { 
          textTransform: 'uppercase', 
          letterSpacing: '0.05em', 
          fontSize: '12px', 
          fontWeight: 500 
        } 
      } 
    },
    MuiTableCell: { 
      styleOverrides: { 
        head: { 
          backgroundColor: '#141118', 
          color: '#8C8070', 
          fontSize: '9px', 
          textTransform: 'uppercase', 
          letterSpacing: '0.1em', 
          fontWeight: 500,
          borderBottom: '2px solid #3A2D20'
        },
        root: {
          borderColor: '#3A2D20',
          color: '#E8E0D5',
        }
      } 
    },
    MuiChip: { 
      styleOverrides: { 
        root: { 
          borderRadius: '2px', 
          fontSize: '10px', 
          fontWeight: 500, 
          textTransform: 'uppercase' 
        } 
      } 
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none', // Remove elevation gradients in dark mode
          backgroundColor: '#141118',
          border: '1px solid #2A2433',
        }
      }
    },
    MuiSelect: {
      styleOverrides: {
        icon: { color: '#8C8070' }
      }
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          '&.MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#2A2433',
            },
            '&:hover fieldset': {
              borderColor: '#3A2D20',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#8B1A2E',
            },
          },
        }
      }
    }
  },
});
