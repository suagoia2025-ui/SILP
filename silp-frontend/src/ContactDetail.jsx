// src/ContactDetail.jsx
import { Card, CardContent, Typography, Box, IconButton, Divider } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

function ContactDetail({ contact, onClose }) {
  if (!contact) {
    return null; // No muestra nada si no hay un contacto seleccionado
  }

  // Asegurar que tenemos los datos básicos
  const firstName = contact.first_name || '';
  const lastName = contact.last_name || '';
  const email = contact.email || 'No especificado';
  const phone = contact.phone || 'No especificado';
  const address = contact.address || 'No especificada';
  const occupation = contact.occupation?.name || 'Ocupación no especificada';
  const municipality = contact.municipality?.name || 'No especificado';
  const cedula = contact.cedula || 'No especificada';
  const mdv = contact.mdv || 'No especificado';
  const isActive = contact.is_active !== undefined ? contact.is_active : true;

  return (
    <Card variant="outlined">
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="div">
            {firstName} {lastName}
          </Typography>
          <IconButton onClick={onClose} aria-label="close" size="small">
            <CloseIcon />
          </IconButton>
        </Box>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color={isActive ? 'success.main' : 'error.main'} sx={{ mb: 1 }}>
            <strong>Estado:</strong> {isActive ? 'Activo' : 'Inactivo'}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }} color="text.secondary">
            {occupation}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography variant="body2">
            <strong>Email:</strong> {email}
          </Typography>
          <Typography variant="body2">
            <strong>Teléfono:</strong> {phone}
          </Typography>
          <Typography variant="body2">
            <strong>Cédula:</strong> {cedula}
          </Typography>
          <Typography variant="body2">
            <strong>Municipio:</strong> {municipality}
          </Typography>
          <Typography variant="body2">
            <strong>Dirección:</strong> {address}
          </Typography>
          {mdv && mdv !== 'No especificado' && (
            <Typography variant="body2">
              <strong>MDV:</strong> {mdv}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

export default ContactDetail;