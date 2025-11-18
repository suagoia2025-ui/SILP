import { useMediaQuery, useTheme } from '@mui/material';

/**
 * Hook para detectar si el dispositivo es móvil/tablet
 * Usa breakpoint de 960px (md) como principal
 * También detecta touch points y user agent como respaldo
 * @returns {boolean} true si es móvil/tablet, false si es escritorio
 */
export function useIsMobile() {
  const theme = useTheme();
  const isMobileBreakpoint = useMediaQuery(theme.breakpoints.down('md')); // md = 960px
  
  // Detección adicional en cliente (sincrónica para evitar problemas de hidratación)
  if (typeof window !== 'undefined') {
    const width = window.innerWidth;
    const hasTouchPoints = navigator.maxTouchPoints > 0;
    
    // Detectar móvil por:
    // 1. Ancho < 960px (principal - más confiable)
    // 2. Ancho < 768px (móviles pequeños)
    // 3. Tiene touch points Y ancho < 1024px (tablets)
    // 4. User agent móvil Y ancho < 1200px (respaldo)
    const userAgent = navigator.userAgent || '';
    const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    
    const isMobileClient = 
      width < 960 ||  // Principal: cualquier ancho menor a 960px
      width < 768 || 
      (hasTouchPoints && width < 1024) ||
      (isMobileUA && width < 1200);
    
    // Debug temporal (remover en producción)
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 useIsMobile:', {
        width,
        isMobileBreakpoint,
        isMobileClient,
        hasTouchPoints,
        isMobileUA,
        result: isMobileBreakpoint || isMobileClient
      });
    }
    
    // Es móvil si cumple breakpoint O detección del cliente
    return isMobileBreakpoint || isMobileClient;
  }
  
  // Fallback: solo usar breakpoint en SSR
  return isMobileBreakpoint;
}

