import { useMediaQuery, useTheme } from '@mui/material';

/**
 * Hook para detectar si el dispositivo es móvil/tablet
 * Usa breakpoint de 960px y detección de touch points
 * @returns {boolean} true si es móvil/tablet, false si es escritorio
 */
export function useIsMobile() {
  const theme = useTheme();
  const isMobileBreakpoint = useMediaQuery(theme.breakpoints.down('md')); // md = 960px
  const hasTouchPoints = typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0;
  const isSmallScreen = typeof window !== 'undefined' && window.innerWidth < 768;
  
  // Es móvil si cumple breakpoint Y tiene touch points (o es muy pequeño)
  return isMobileBreakpoint && (hasTouchPoints || isSmallScreen);
}

