import { useState, useRef } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import {
  Box, Button, TextField, Typography, Alert, Grid, Link,
  InputAdornment, IconButton 
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { getApiUrl } from './config';
import { useIsMobile } from './hooks/useIsMobile';

function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({});
  const isMobile = useIsMobile();
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

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
    setTouched({ email: true, password: true });
    setError('');
    
    if (!email.trim() || !password.trim()) {
      setError('Por favor completa todos los campos.');
      return;
    }

    try {
      const response = await axios.post(getApiUrl('/login'), {
        email: email,
        password: password,
      });
      if (isMobile && navigator.vibrate) {
        navigator.vibrate(50);
      }
      onLoginSuccess(response.data.access_token);
    } catch (err) {
      setError(err.response?.data?.detail || 'Ocurrió un error.');
    }
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
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
      component="main"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        width: '100vw',
        margin: 0,
        padding: { xs: 2, sm: 2 },
        boxSizing: 'border-box'
      }}
    >
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          width: '100%',
          maxWidth: { xs: '100%', sm: 400 },
          padding: { xs: 3, sm: 4 },
          boxShadow: 3,
          borderRadius: 2,
          backgroundColor: 'background.paper'
        }}
      >
        <Typography 
          component="h1" 
          variant="h5" 
          sx={{ 
            mb: 3, 
            fontWeight: 'bold',
            fontSize: { xs: '1.25rem', sm: '1.5rem' }
          }}
        >
          Iniciar Sesión en SILP
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%', mt: 1 }}>
          <TextField
            margin="normal" 
            required 
            fullWidth 
            id="email" 
            label="Correo Electrónico"
            name="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            onFocus={() => handleFocus(emailRef)}
            onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
            autoComplete="email"
            error={touched.email && !email.trim() && !!error}
            inputRef={emailRef}
            inputProps={{ 
              inputMode: 'email',
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
            name="password" 
            label="Contraseña"
            type={showPassword ? 'text' : 'password'}
            id="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => handleFocus(passwordRef)}
            onBlur={() => setTouched(prev => ({ ...prev, password: true }))}
            autoComplete="current-password"
            error={touched.password && !password.trim() && !!error}
            inputRef={passwordRef}
            inputProps={{ 
              style: { fontSize: isMobile ? 16 : 14 },
              autoCapitalize: 'off',
              autoCorrect: 'off',
            }}
            sx={textFieldSx}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                    sx={{ 
                      minWidth: isMobile ? 48 : 40,
                      minHeight: isMobile ? 48 : 40,
                    }}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
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
            Ingresar
          </Button>
          <Grid container justifyContent="center" sx={{ mt: 2 }}>
            <Grid item>
              <Link 
                component={RouterLink} 
                to="/request-password-reset" 
                variant="body2"
                sx={{ fontSize: { xs: 14, sm: 16 } }}
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </Grid>
          </Grid>
          {error && <Alert severity="error" sx={{ mt: 2, fontSize: { xs: 14, sm: 16 } }}>{error}</Alert>}
        </Box>
      </Box>
    </Box>
  );
}

export default Login;
