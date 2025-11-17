// src/RequestPasswordReset.jsx
import { useState } from 'react';
import axios from 'axios';
import { Box, Button, TextField, Typography, Container, Alert } from '@mui/material';

function RequestPasswordReset() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/v1/password-recovery', { email });
      setMessage(response.data.message);
    } catch (err) {
      setError('Ocurrió un error al intentar enviar el correo.');
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">Recuperar Contraseña</Typography>
        <Typography sx={{ mt: 2 }}>Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.</Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField margin="normal" required fullWidth id="email" label="Correo Electrónico" name="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>Enviar Enlace</Button>
          {message && <Alert severity="success">{message}</Alert>}
          {error && <Alert severity="error">{error}</Alert>}
        </Box>
      </Box>
    </Container>
  );
}
export default RequestPasswordReset;