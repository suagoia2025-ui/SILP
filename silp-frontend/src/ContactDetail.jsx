// src/ContactDetail.jsx
import { Card, CardContent, Typography, Box, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

function ContactDetail({ contact, onClose }) {
  if (!contact) {
    return null; // No muestra nada si no hay un contacto seleccionado
  }

  return (
    <Card variant="outlined">
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" component="div">
            {contact.first_name} {contact.last_name}
          </Typography>
          <IconButton onClick={onClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </Box>
        <Typography sx={{ mb: 1.5 }} color="text.secondary">
          {contact.occupation?.name || 'Ocupación no especificada'}
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>Email:</strong> {contact.email}
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>Teléfono:</strong> {contact.phone}
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>Municipio:</strong> {contact.municipality?.name || 'No especificado'}
        </Typography>
        <Typography variant="body2">
          <strong>Dirección:</strong> {contact.address || 'No especificada'}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default ContactDetail;