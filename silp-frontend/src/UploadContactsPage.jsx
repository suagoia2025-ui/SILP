import { useState } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  Box,
  Button,
  Alert,
  CircularProgress,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

function UploadContactsPage({ token }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      const fileExtension = selectedFile.name.split('.').pop().toLowerCase();
      if (!['csv', 'xlsx', 'xls'].includes(fileExtension)) {
        setError('El archivo debe ser CSV o Excel (.csv, .xlsx, .xls)');
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError(null);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Por favor, selecciona un archivo');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(
        'http://127.0.0.1:8000/api/v1/admin/upload-contacts',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setResult(response.data);
      setFile(null);
      // Limpiar el input file
      const fileInput = document.getElementById('file-upload');
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (err) {
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Error al cargar el archivo. Por favor, intenta nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" sx={{ mb: 3, mt: 2 }}>
        Carga Masiva de Contactos
      </Typography>

      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Instrucciones
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          El archivo debe contener las siguientes columnas:
        </Typography>
        
        <List dense>
          <ListItem>
            <ListItemText 
              primary="first_name" 
              secondary="Nombre del contacto (requerido)"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="last_name" 
              secondary="Apellido del contacto (requerido)"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="email" 
              secondary="Correo electrónico (requerido)"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="phone" 
              secondary="Teléfono (requerido)"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="municipality_id" 
              secondary="ID del municipio (INTEGER, requerido)"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="address" 
              secondary="Dirección (opcional)"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="occupation_id" 
              secondary="ID de la ocupación (INTEGER, opcional)"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="mdv" 
              secondary="Referencia MDV (opcional)"
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="is_active" 
              secondary="Estado activo (BOOLEAN: true/false, opcional, por defecto true)"
            />
          </ListItem>
        </List>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ mb: 3 }}>
          <input
            accept=".csv,.xlsx,.xls"
            style={{ display: 'none' }}
            id="file-upload"
            type="file"
            onChange={handleFileChange}
          />
          <label htmlFor="file-upload">
            <Button
              variant="outlined"
              component="span"
              startIcon={<CloudUploadIcon />}
              sx={{ mr: 2 }}
            >
              Seleccionar Archivo
            </Button>
          </label>
          {file && (
            <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
              Archivo seleccionado: <strong>{file.name}</strong>
            </Typography>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {result && (
          <Alert 
            severity={result.errors && result.errors.length > 0 ? "warning" : "success"} 
            sx={{ mb: 2 }}
            icon={result.errors && result.errors.length > 0 ? <ErrorIcon /> : <CheckCircleIcon />}
          >
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              {result.message}
            </Typography>
            <Typography variant="body2">
              <strong>Contactos creados:</strong> {result.created}
            </Typography>
            <Typography variant="body2">
              <strong>Contactos omitidos:</strong> {result.skipped}
            </Typography>
            <Typography variant="body2">
              <strong>Total de filas:</strong> {result.total_rows}
            </Typography>
            {result.errors && result.errors.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Errores encontrados:
                </Typography>
                <List dense sx={{ maxHeight: 200, overflow: 'auto', bgcolor: 'background.paper' }}>
                  {result.errors.map((error, index) => (
                    <ListItem key={index}>
                      <ListItemText 
                        primary={error}
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  ))}
                </List>
                {result.errors_message && (
                  <Typography variant="caption" color="text.secondary">
                    {result.errors_message}
                  </Typography>
                )}
              </Box>
            )}
          </Alert>
        )}

        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={!file || loading}
          fullWidth
          sx={{ mt: 2 }}
        >
          {loading ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              Cargando...
            </>
          ) : (
            'Cargar Contactos'
          )}
        </Button>
      </Paper>
    </Container>
  );
}

export default UploadContactsPage;

