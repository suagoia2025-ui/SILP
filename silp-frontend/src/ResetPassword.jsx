// src/ResetPassword.jsx
import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Box, Button, TextField, Typography, Container, Alert } from '@mui/material';
import { getApiUrl } from './config';

function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (!token) {
      setError('El token de restablecimiento no se encontró.');
      return;
    }
    setError('');
    setMessage('');
    try {
      const response = await axios.post(getApiUrl('/reset-password'), {
        token: token,
        new_password: password
      });
      setMessage(response.data.message + ' Serás redirigido al login.');
      setTimeout(() => navigate('/login'), 3000); // Redirige al login después de 3 segundos
    } catch (err) {
      setError(err.response?.data?.detail || 'El token es inválido o ha expirado.');
    }
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        margin: 0,
        padding: 2
      }}
    >
      <Container maxWidth="sm" sx={{ width: '100%' }}>
        <Box
          sx={{
            backgroundColor: 'white',
            padding: { xs: 3, sm: 4 },
            borderRadius: 2,
            boxShadow: 3,
            width: '100%'
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Establecer Nueva Contraseña
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }} align="center">
            Ingresa tu nueva contraseña y confírmala para completar el restablecimiento.
          </Typography>

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField 
              margin="normal" 
              required 
              fullWidth 
              name="password" 
              label="Nueva Contraseña" 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
            <TextField 
              margin="normal" 
              required 
              fullWidth 
              name="confirmPassword" 
              label="Confirmar Nueva Contraseña" 
              type="password" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
            <Button 
              type="submit" 
              fullWidth 
              variant="contained" 
              sx={{ mt: 3, mb: 2 }}
            >
              Actualizar Contraseña
            </Button>
            {message && <Alert severity="success" sx={{ mt: 2 }}>{message}</Alert>}
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
export default ResetPassword;
