// ============================================================================
// SILP Frontend - Configuración Centralizada
// ============================================================================
// 
// Centraliza la configuración de URLs y variables de entorno
// ============================================================================

// URL del backend API
// Usa VITE_API_URL si está definida, sino usa localhost:8000 por defecto
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Función helper para construir URLs completas de la API
export const getApiUrl = (endpoint) => {
  // Asegurar que el endpoint empiece con /
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  // Remover /api/v1 si ya está en el endpoint (evitar duplicación)
  if (cleanEndpoint.startsWith('/api/v1')) {
    return `${API_URL}${cleanEndpoint}`;
  }
  return `${API_URL}/api/v1${cleanEndpoint}`;
};

// Exportar configuración completa
export default {
  API_URL,
  getApiUrl,
};

