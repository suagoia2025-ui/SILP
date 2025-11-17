import { useState } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  Box,
  Button,
  Alert,
  CircularProgress,
  Paper
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

function DownloadContactsPage({ token }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await axios.get(
        'http://127.0.0.1:8000/api/v1/contacts/download-csv',
        {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          responseType: 'blob' // Importante para descargar archivos binarios
        }
      );

      // Crear un enlace temporal para descargar el archivo
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      
      // Obtener el nombre del archivo del header Content-Disposition
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'contactos.csv';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setSuccess(true);
    } catch (err) {
      if (err.response?.data) {
        // Si el error es un blob (CSV), intentar leerlo como texto
        if (err.response.data instanceof Blob) {
          const text = await err.response.data.text();
          try {
            const errorData = JSON.parse(text);
            setError(errorData.detail || 'Error al descargar los contactos');
          } catch {
            setError('Error al descargar los contactos');
          }
        } else {
          setError(err.response.data.detail || 'Error al descargar los contactos');
        }
      } else {
        setError('Error al descargar los contactos. Por favor, intenta nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" sx={{ mb: 3, mt: 2 }}>
        Descarga Masiva de Contactos
      </Typography>

      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Exportar Contactos a CSV
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Descarga todos tus contactos en formato CSV. El archivo incluirá la siguiente información:
        </Typography>
        
        <Box component="ul" sx={{ mb: 3, pl: 3 }}>
          <Typography component="li" variant="body2" sx={{ mb: 1 }}>
            Información personal: nombre, apellido, cédula, email, teléfono, dirección
          </Typography>
          <Typography component="li" variant="body2" sx={{ mb: 1 }}>
            Información de ubicación: municipio (ID y nombre)
          </Typography>
          <Typography component="li" variant="body2" sx={{ mb: 1 }}>
            Información de ocupación: ocupación (ID y nombre)
          </Typography>
          <Typography component="li" variant="body2" sx={{ mb: 1 }}>
            Información adicional: referencia MDV, estado activo/inactivo
          </Typography>
          <Typography component="li" variant="body2">
            Fecha de creación del contacto
          </Typography>
        </Box>

        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 2 }} 
            onClose={() => setError(null)}
            icon={<ErrorIcon />}
          >
            {error}
          </Alert>
        )}

        {success && (
          <Alert 
            severity="success" 
            sx={{ mb: 2 }} 
            onClose={() => setSuccess(false)}
            icon={<CheckCircleIcon />}
          >
            Descarga iniciada exitosamente. El archivo se guardará en tu carpeta de descargas.
          </Alert>
        )}

        <Button
          variant="contained"
          onClick={handleDownload}
          disabled={loading}
          fullWidth
          startIcon={loading ? <CircularProgress size={20} /> : <DownloadIcon />}
          sx={{ mt: 2 }}
        >
          {loading ? 'Descargando...' : 'Descargar Contactos (CSV)'}
        </Button>
      </Paper>
    </Container>
  );
}

export default DownloadContactsPage;

