// src/ResetPassword.jsx
import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Box, Button, TextField, Typography, Container, Alert } from '@mui/material';

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
      const response = await axios.post('http://127.0.0.1:8000/api/v1/reset-password', {
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
    <Container component="main" maxWidth="xs">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">Establecer Nueva Contraseña</Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField margin="normal" required fullWidth name="password" label="Nueva Contraseña" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <TextField margin="normal" required fullWidth name="confirmPassword" label="Confirmar Nueva Contraseña" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>Actualizar Contraseña</Button>
          {message && <Alert severity="success">{message}</Alert>}
          {error && <Alert severity="error">{error}</Alert>}
        </Box>
      </Box>
    </Container>
  );
}
export default ResetPassword;
