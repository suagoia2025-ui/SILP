import { useState, useEffect } from 'react';
import axios from 'axios';
import AddContactForm from './AddContactForm';
import EditContactForm from './EditContactForm';
import ConfirmationDialog from './ConfirmationDialog';

import {
  Container, Box, Typography, Button, List, ListItem,
  ListItemText, IconButton, CircularProgress, Alert, Snackbar, TextField
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

function Dashboard({ token, onLogout }) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [contactToDelete, setContactToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [searchTerm, setSearchTerm] = useState("");

  const fetchContacts = async () => {
    // No ponemos setLoading(true) aquí para que no parpadee al buscar
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/v1/contacts/`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { search: searchTerm }
      });
      setContacts(response.data);
    } catch (err) {
      setError('No se pudieron cargar los contactos.');
    } finally {
      if (loading) setLoading(false);
    }
  };
  
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchContacts();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [token, searchTerm]);

  const handleContactCreated = async (newContactData) => {
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/v1/contacts/', newContactData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setContacts(prevContacts => [...prevContacts, response.data]);
      setSnackbar({ open: true, message: '¡Contacto creado exitosamente!', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Error al crear el contacto.', severity: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!contactToDelete) return;
    try {
      await axios.delete(`http://127.0.0.1:8000/api/v1/contacts/${contactToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setContacts(prevContacts => prevContacts.filter(contact => contact.id !== contactToDelete.id));
      setSnackbar({ open: true, message: 'Contacto eliminado.', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Error al eliminar el contacto.', severity: 'error' });
    } finally {
      setContactToDelete(null);
    }
  };

  const handleUpdate = async (contactId, updatedData) => {
    try {
      const response = await axios.put(`http://127.0.0.1:8000/api/v1/contacts/${contactId}`, {
        ...updatedData,
        municipality_id: 3,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setContacts(prevContacts => prevContacts.map(c => (c.id === contactId ? response.data : c)));
      setEditingContact(null);
      setSnackbar({ open: true, message: 'Contacto actualizado.', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Error al actualizar el contacto.', severity: 'error' });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (loading) return ( <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><CircularProgress /></Box> );
  if (error) return <Container><Alert severity="error" sx={{ mt: 4 }}>{error}</Alert></Container>;

  return (
    <Container maxWidth="md">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', my: 4 }}>
        <Typography variant="h4" component="h1">Dashboard de Contactos</Typography>
        <Button variant="contained" color="secondary" onClick={onLogout}>Cerrar Sesión</Button>
      </Box>

      <Button variant="contained" sx={{ mb: 2 }} onClick={() => setIsCreating(true)}>
        + Crear Nuevo Contacto
      </Button>

      <AddContactForm open={isCreating} onClose={() => setIsCreating(false)} onContactCreated={handleContactCreated} />
      <EditContactForm open={!!editingContact} onClose={() => setEditingContact(null)} onContactUpdated={handleUpdate} contact={editingContact} />
      <ConfirmationDialog open={!!contactToDelete} onClose={() => setContactToDelete(null)} onConfirm={handleDelete} title="Confirmar Eliminación" message={`¿Seguro que quieres eliminar a ${contactToDelete?.first_name}?`} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', my: 2 }}>
        <Typography variant="h5" component="h2">Tu Lista de Contactos</Typography>
        <TextField label="Buscar..." variant="outlined" size="small" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </Box>

      <List>
        {contacts.map(contact => (
          <ListItem
            key={contact.id}
            secondaryAction={
              <>
                <IconButton edge="end" aria-label="edit" onClick={() => setEditingContact(contact)}><EditIcon /></IconButton>
                <IconButton edge="end" aria-label="delete" onClick={() => setContactToDelete(contact)}><DeleteIcon /></IconButton>
              </>
            }
            divider
          >
            <ListItemText
              primary={`${contact.first_name} ${contact.last_name}`}
              secondary={`Email: ${contact.email} | Teléfono: ${contact.phone}`}
            />
          </ListItem>
        ))}
      </List>
      
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default Dashboard;