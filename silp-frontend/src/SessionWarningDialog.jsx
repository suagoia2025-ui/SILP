// src/SessionWarningDialog.jsx
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';

function SessionWarningDialog({ open, onLogout, onExtendSession }) {
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    if (!open) return;

    const updateTimeRemaining = () => {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      try {
        const decoded = jwtDecode(token);
        const expirationTime = decoded.exp * 1000;
        const currentTime = Date.now();
        const remaining = Math.max(0, expirationTime - currentTime);
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        
        if (remaining <= 0) {
          setTimeRemaining('La sesión ha expirado');
          onLogout();
        } else {
          setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        }
      } catch (error) {
        setTimeRemaining('Error al calcular tiempo');
      }
    };

    // Actualizar inmediatamente
    updateTimeRemaining();

    // Actualizar cada segundo
    const interval = setInterval(updateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [open, onLogout]);

  return (
    <Dialog open={open} onClose={() => {}} disableEscapeKeyDown>
      <DialogTitle>Tu sesión está a punto de expirar</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Tu sesión se cerrará automáticamente en {timeRemaining} por inactividad. 
          ¿Deseas permanecer conectado?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onLogout} color="secondary">Cerrar Sesión</Button>
        <Button onClick={onExtendSession} color="primary" autoFocus>
          Permanecer Conectado
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default SessionWarningDialog;
