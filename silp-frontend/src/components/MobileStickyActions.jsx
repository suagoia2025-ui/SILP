import { Box, Button } from '@mui/material';
import { useIsMobile } from '../hooks/useIsMobile';

/**
 * Barra de acciones fija en la parte inferior para formularios largos en móvil
 * @param {Object} props
 * @param {Function} props.onCancel - Función al hacer clic en Cancelar
 * @param {Function} props.onSubmit - Función al hacer clic en Guardar
 * @param {string} props.submitLabel - Texto del botón de envío
 * @param {boolean} props.disabled - Si el botón de envío está deshabilitado
 * @param {boolean} props.loading - Si está cargando
 */
export function MobileStickyActions({ onCancel, onSubmit, submitLabel = 'Guardar', disabled = false, loading = false }) {
  const isMobile = useIsMobile();

  if (!isMobile) {
    return null; // No mostrar en escritorio
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        p: 2,
        bgcolor: 'background.paper',
        borderTop: 1,
        borderColor: 'divider',
        boxShadow: '0 -2px 8px rgba(0,0,0,0.1)',
        zIndex: 1300,
        display: 'flex',
        gap: 2,
      }}
    >
      <Button
        variant="outlined"
        onClick={onCancel}
        fullWidth
        size="large"
        sx={{ height: 56, fontSize: 16 }}
      >
        Cancelar
      </Button>
      <Button
        variant="contained"
        onClick={onSubmit}
        fullWidth
        size="large"
        disabled={disabled || loading}
        sx={{ height: 56, fontSize: 16 }}
      >
        {loading ? 'Guardando...' : submitLabel}
      </Button>
    </Box>
  );
}

