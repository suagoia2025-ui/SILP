import { useState, useRef } from 'react';
import axios from 'axios';
import { Box, Button, TextField, Typography, Container, Alert } from '@mui/material';
import { getApiUrl } from './config';
import { useIsMobile } from './hooks/useIsMobile';

function RequestPasswordReset() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);
  const isMobile = useIsMobile();
  const emailRef = useRef(null);

  const handleFocus = () => {
    if (isMobile && emailRef.current) {
      setTimeout(() => {
        emailRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }, 300);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setTouched(true);
    setMessage('');
    setError('');
    
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Por favor ingresa un correo electrónico válido.');
      return;
    }

    try {
      const response = await axios.post(getApiUrl('/password-recovery'), { email });
      setMessage(response.data.message);
      if (isMobile && navigator.vibrate) {
        navigator.vibrate(50);
      }
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
        padding: { xs: 2, sm: 2 }
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
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom 
            align="center"
            sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}
          >
            Recuperar Contraseña
          </Typography>
          
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ mb: 3, fontSize: { xs: 14, sm: 16 } }} 
            align="center"
          >
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
              onFocus={handleFocus}
              onBlur={() => setTouched(true)}
              autoComplete="email"
              error={touched && !!error && !message}
              helperText={touched && error && !message ? error : ''}
              inputRef={emailRef}
              inputProps={{ 
                inputMode: 'email',
                style: { fontSize: isMobile ? 16 : 14 },
                autoCapitalize: 'off',
                autoCorrect: 'off',
              }}
              sx={{
                '& .MuiInputBase-root': {
                  minHeight: isMobile ? 56 : 40,
                },
                '& .MuiInputBase-input': {
                  padding: isMobile ? '16px 14px' : '8px 14px',
                  fontSize: isMobile ? 16 : 14,
                },
              }}
            />
            <Button 
              type="submit" 
              fullWidth 
              variant="contained" 
              size="large"
              sx={{ 
                mt: 3, 
                mb: 2,
                height: isMobile ? 56 : 48,
                fontSize: 16
              }}
            >
              Enviar Enlace
            </Button>
            {message && <Alert severity="success" sx={{ mt: 2 }}>{message}</Alert>}
            {error && !touched && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
export default RequestPasswordReset;
