import { createTheme } from '@mui/material/styles';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#9c27b0',
      light: '#ba68c8',
      dark: '#7b1fa2',
    },
    secondary: {
      main: '#673ab7',
      light: '#9575cd',
      dark: '#512da8',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
      background: 'linear-gradient(45deg, #9c27b0 30%, #673ab7 90%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(145deg, #1e1e1e, #2a2a2a)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          borderRadius: '12px',
          border: '1px solid rgba(156, 39, 176, 0.1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(45deg, #9c27b0 30%, #673ab7 90%)',
          border: 0,
          borderRadius: 8,
          color: 'white',
          height: 48,
          padding: '0 30px',
          boxShadow: '0 3px 5px 2px rgba(156, 39, 176, .3)',
          '&:hover': {
            background: 'linear-gradient(45deg, #ba68c8 30%, #9575cd 90%)',
          },
        },
      },
    },
  },
});

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#9c27b0',
      light: '#ba68c8',
      dark: '#7b1fa2',
    },
    secondary: {
      main: '#673ab7',
      light: '#9575cd',
      dark: '#512da8',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
      background: 'linear-gradient(45deg, #9c27b0 30%, #673ab7 90%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(145deg, #ffffff, #f5f5f5)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          borderRadius: '12px',
          border: '1px solid rgba(156, 39, 176, 0.1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(45deg, #9c27b0 30%, #673ab7 90%)',
          border: 0,
          borderRadius: 8,
          color: 'white',
          height: 48,
          padding: '0 30px',
          boxShadow: '0 3px 5px 2px rgba(156, 39, 176, .3)',
          '&:hover': {
            background: 'linear-gradient(45deg, #ba68c8 30%, #9575cd 90%)',
          },
        },
      },
    },
  },
});

export { darkTheme, lightTheme }; 