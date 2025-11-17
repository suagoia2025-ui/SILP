// src/RequestPasswordReset.jsx
import { useState } from 'react';
import axios from 'axios';
import { Box, Button, TextField, Typography, Container, Alert } from '@mui/material';
import { getApiUrl } from './config';

function RequestPasswordReset() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');
    try {
      const response = await axios.post(getApiUrl('/password-recovery'), { email });
      setMessage(response.data.message);
    } catch (err) {
      setError('Ocurrió un error al intentar enviar el correo.');
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
            Recuperar Contraseña
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }} align="center">
            Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
          </Typography>

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField 
              margin="normal" 
              required 
              fullWidth 
              id="email" 
              label="Correo Electrónico" 
              name="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            <Button 
              type="submit" 
              fullWidth 
              variant="contained" 
              sx={{ mt: 3, mb: 2 }}
            >
              Enviar Enlace
            </Button>
            {message && <Alert severity="success" sx={{ mt: 2 }}>{message}</Alert>}
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
export default RequestPasswordReset;