// src/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#3498db', // Un azul cielo agradable
      contrastText: '#ffffff', // Texto blanco para los botones primarios
    },
    secondary: {
      main: '#2980b9', // Un azul un poco más oscuro
    },
    background: {
      default: '#f4f6f8', // Un fondo gris muy claro para que no sea blanco puro
      paper: '#ffffff', // El fondo de los componentes como las tarjetas
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h4: {
      fontWeight: 600,
    },
  },
});

export default theme;