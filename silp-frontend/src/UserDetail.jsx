// src/UserDetail.jsx
import { Card, CardContent, Typography, Box, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

function UserDetail({ user, onClose }) {
  if (!user) return null;

  return (
    <Card variant="outlined">
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" component="div">
            {user.first_name} {user.last_name}
          </Typography>
          <IconButton onClick={onClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </Box>
        <Typography sx={{ mb: 1.5 }} color="text.secondary">
          Rol: {user.role}
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>Email:</strong> {user.email}
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>Teléfono:</strong> {user.phone}
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>Dirección:</strong> {user.address || 'No especificada'}
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>Municipio:</strong> {user.municipality?.name || 'No especificado'}
        </Typography>
        <Typography variant="body2">
          <strong>Ocupación:</strong> {user.occupation?.name || 'No especificada'}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default UserDetail;