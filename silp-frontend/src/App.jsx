import { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { Box, CircularProgress } from '@mui/material';

// Importa todos tus componentes de página
import Login from './Login';
import Layout from './Layout';
import ContactsPage from './ContactsPage';
import UsersPage from './UsersPage';
import UploadContactsPage from './UploadContactsPage';
import DownloadContactsPage from './DownloadContactsPage';
import RequestPasswordReset from './RequestPasswordReset';
import ResetPassword from './ResetPassword';
import SessionWarningDialog from './SessionWarningDialog';

function App() {
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [sessionWarning, setSessionWarning] = useState(false);

  // Tiempo de advertencia antes de que expire el token (en minutos)
  // Se mostrará la advertencia 5 minutos antes de que expire
  const WARNING_TIME_BEFORE_EXPIRY = 5; // minutos

  const handleLogout = useCallback(() => {
    localStorage.removeItem('authToken');
    setToken(null);
    setCurrentUser(null);
    setSessionWarning(false);
  }, []);

  // FUNCIÓN handleLoginSuccess ACTUALIZADA
  const handleLoginSuccess = useCallback(async (newToken) => {
    setAuthLoading(true);
    localStorage.setItem('authToken', newToken);
    setToken(newToken);
    try {
      // Inmediatamente después de obtener el token, pedimos los datos del usuario
      const response = await axios.get('http://127.0.0.1:8000/api/v1/users/me', {
        headers: { Authorization: `Bearer ${newToken}` }
      });
      setCurrentUser(response.data);
    } catch (error) {
      // Si falla la obtención del usuario, cerramos la sesión
      handleLogout();
    } finally {
      setAuthLoading(false);
    }
  }, [handleLogout]);

  // useEffect MODIFICADO para que solo se ejecute una vez al cargar la app
  useEffect(() => {
    const activeToken = localStorage.getItem('authToken');
    if (!activeToken) {
      setAuthLoading(false);
      return;
    }

    axios.get('http://127.0.0.1:8000/api/v1/users/me', { headers: { Authorization: `Bearer ${activeToken}` } })
      .then(response => {
        setCurrentUser(response.data);
        setToken(activeToken);
      })
      .catch(() => handleLogout())
      .finally(() => setAuthLoading(false));
  }, [handleLogout]); // Depende de handleLogout para evitar warnings

  // Función para verificar el tiempo de expiración del token y mostrar advertencia
  const checkTokenExpiration = useCallback(() => {
    const activeToken = localStorage.getItem('authToken');
    if (!activeToken) {
      return;
    }

    try {
      const decoded = jwtDecode(activeToken);
      const expirationTime = decoded.exp * 1000; // Convertir a milisegundos
      const currentTime = Date.now();
      const timeUntilExpiry = expirationTime - currentTime;
      const warningTime = WARNING_TIME_BEFORE_EXPIRY * 60 * 1000; // Convertir minutos a milisegundos

      // Si el token ya expiró, cerrar sesión
      if (timeUntilExpiry <= 0) {
        handleLogout();
        return;
      }

      // Si falta menos tiempo que el tiempo de advertencia, mostrar el diálogo
      if (timeUntilExpiry <= warningTime && !sessionWarning) {
        setSessionWarning(true);
      }
    } catch (error) {
      // Si hay error decodificando el token, cerrar sesión
      handleLogout();
    }
  }, [sessionWarning, handleLogout]);

  // Verificar expiración del token cada minuto
  useEffect(() => {
    if (!token) return;

    // Verificar inmediatamente
    checkTokenExpiration();

    // Verificar cada minuto
    const interval = setInterval(checkTokenExpiration, 60000); // 60000 ms = 1 minuto

    return () => clearInterval(interval);
  }, [token, checkTokenExpiration]);

  // Función para extender la sesión (renovar el token)
  const handleExtendSession = useCallback(async () => {
    try {
      const activeToken = localStorage.getItem('authToken');
      if (!activeToken) {
        handleLogout();
        return;
      }

      // Llamar al endpoint de renovación de token
      const response = await axios.post(
        'http://127.0.0.1:8000/api/v1/refresh-token',
        {},
        {
          headers: { Authorization: `Bearer ${activeToken}` }
        }
      );

      // Actualizar el token en localStorage y en el estado
      const newToken = response.data.access_token;
      localStorage.setItem('authToken', newToken);
      setToken(newToken);
      
      // Ocultar la advertencia
      setSessionWarning(false);
      
      // El nuevo token tiene 30 minutos más de validez
      // La advertencia se volverá a mostrar cuando falten 5 minutos del nuevo token
    } catch (error) {
      // Si hay un error (token expirado o inválido), cerrar sesión
      console.error('Error al renovar el token:', error);
      handleLogout();
    }
  }, [handleLogout]);

  if (authLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Routes>
        <Route path="/login" element={!token ? <Login onLoginSuccess={handleLoginSuccess} /> : <Navigate to="/" />} />
        <Route path="/request-password-reset" element={<RequestPasswordReset />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        <Route path="/*" element={token && currentUser ? <Layout currentUser={currentUser} onLogout={handleLogout} /> : <Navigate to="/login" />}>
          <Route index element={<Navigate to="/contacts" />} /> 
          <Route path="contacts" element={<ContactsPage token={token} currentUser={currentUser} />} />
          <Route path="users" element={currentUser?.role === 'superadmin' ? <UsersPage token={token} /> : <Navigate to="/contacts" />} />
          <Route 
            path="admin/carga-contactos" 
            element={
              ['superadmin', 'admin', 'lider'].includes(currentUser?.role) 
                ? <UploadContactsPage token={token} /> 
                : <Navigate to="/contacts" />
            } 
          />
          <Route 
            path="admin/descarga-contactos" 
            element={
              ['superadmin', 'admin'].includes(currentUser?.role) 
                ? <DownloadContactsPage token={token} /> 
                : <Navigate to="/contacts" />
            } 
          />
        </Route>
      </Routes>
      <SessionWarningDialog open={sessionWarning} onLogout={handleLogout} onExtendSession={handleExtendSession} />
    </>
  );
}

export default App;