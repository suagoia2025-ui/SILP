import { useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Box, Button, TextField, Typography, Container, Alert } from '@mui/material';
import { getApiUrl } from './config';
import { useIsMobile } from './hooks/useIsMobile';

function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [touched, setTouched] = useState({});
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const isMobile = useIsMobile();
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

  const handleFocus = (ref) => {
    if (isMobile && ref.current) {
      setTimeout(() => {
        ref.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }, 300);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setTouched({ password: true, confirmPassword: true });
    
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (!token) {
      setError('El token de restablecimiento no se encontró.');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
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
      if (isMobile && navigator.vibrate) {
        navigator.vibrate(50);
      }
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'El token es inválido o ha expirado.');
    }
  };

  const textFieldSx = {
    '& .MuiInputBase-root': {
      minHeight: isMobile ? 56 : 40,
    },
    '& .MuiInputBase-input': {
      padding: isMobile ? '16px 14px' : '8px 14px',
      fontSize: isMobile ? 16 : 14,
    },
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
            Establecer Nueva Contraseña
          </Typography>
          
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ mb: 3, fontSize: { xs: 14, sm: 16 } }} 
            align="center"
          >
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
              onFocus={() => handleFocus(passwordRef)}
              onBlur={() => setTouched(prev => ({ ...prev, password: true }))}
              autoComplete="new-password"
              error={touched.password && (!!error || (password.length > 0 && password.length < 6))}
              helperText={
                touched.password 
                  ? (error && error.includes('contraseña') ? error : (password.length > 0 && password.length < 6 ? 'Mínimo 6 caracteres' : ''))
                  : ''
              }
              inputRef={passwordRef}
              inputProps={{ 
                style: { fontSize: isMobile ? 16 : 14 },
                autoCapitalize: 'off',
                autoCorrect: 'off',
              }}
              sx={textFieldSx}
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
              onFocus={() => handleFocus(confirmPasswordRef)}
              onBlur={() => setTouched(prev => ({ ...prev, confirmPassword: true }))}
              autoComplete="new-password"
              error={touched.confirmPassword && (!!error || (confirmPassword.length > 0 && password !== confirmPassword))}
              helperText={
                touched.confirmPassword 
                  ? (error && error.includes('coinciden') ? error : (confirmPassword.length > 0 && password !== confirmPassword ? 'Las contraseñas no coinciden' : ''))
                  : ''
              }
              inputRef={confirmPasswordRef}
              inputProps={{ 
                style: { fontSize: isMobile ? 16 : 14 },
                autoCapitalize: 'off',
                autoCorrect: 'off',
                enterKeyHint: 'done',
              }}
              sx={textFieldSx}
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
              Actualizar Contraseña
            </Button>
            {message && <Alert severity="success" sx={{ mt: 2 }}>{message}</Alert>}
            {error && !touched.password && !touched.confirmPassword && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
export default ResetPassword;
