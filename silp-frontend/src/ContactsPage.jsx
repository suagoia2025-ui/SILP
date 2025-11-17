import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ContactForm from './ContactForm';
import ConfirmationDialog from './ConfirmationDialog';
import ContactDetail from './ContactDetail';
import { getApiUrl } from './config';
import {
  Container, Grid, Box, Typography, Button, List, ListItem, ListItemButton,
  ListItemText, IconButton, CircularProgress, Alert, Snackbar, TextField
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

function ContactsPage({ token }) {
  const [contacts, setContacts] = useState([]);
  const [municipalities, setMunicipalities] = useState([]);
  const [occupations, setOccupations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [contactToDelete, setContactToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchData = async () => {
    try {
      const [contactsRes, municipalitiesRes, occupationsRes] = await Promise.all([
        axios.get(getApiUrl('/contacts/'), {
          headers: { Authorization: `Bearer ${token}` },
          params: { search: searchTerm }
        }),
        axios.get(getApiUrl('/municipalities/')),
        axios.get(getApiUrl('/occupations/'))
      ]);
      setContacts(contactsRes.data);
      setMunicipalities(municipalitiesRes.data);
      setOccupations(occupationsRes.data);
    } catch (err) {
      setError('No se pudieron cargar los datos iniciales.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      fetchData();
    }, 500);
    return () => clearTimeout(timer);
  }, [token, searchTerm]);

  const handleSave = async (contactData, contactId = null) => {
    const isEditMode = !!contactId;
    const url = isEditMode ? getApiUrl(`/contacts/${contactId}`) : getApiUrl('/contacts/');
    const method = isEditMode ? 'put' : 'post';
    
    try {
      const response = await axios[method](url, contactData, { headers: { Authorization: `Bearer ${token}` } });
      if (isEditMode) {
        setContacts(prev => prev.map(c => (c.id === contactId ? response.data : c)));
        setSelectedContact(response.data); // <-- CORRECCIÓN CLAVE
        setSnackbar({ open: true, message: '¡Contacto actualizado!', severity: 'success' });
      } else {
        setContacts(prev => [...prev, response.data]);
        setSnackbar({ open: true, message: '¡Contacto creado!', severity: 'success' });
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Ocurrió un error al guardar.', severity: 'error' });
    } finally {
      setIsCreating(false);
      setEditingContact(null);
    }
  };

  const handleDelete = async () => {
    if (!contactToDelete) return;
    try {
      await axios.delete(getApiUrl(`/contacts/${contactToDelete.id}`), { headers: { Authorization: `Bearer ${token}` } });
      setContacts(prev => prev.filter(c => c.id !== contactToDelete.id));
      setSelectedContact(null);
      setSnackbar({ open: true, message: 'Contacto eliminado.', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Error al eliminar el contacto.', severity: 'error' });
    } finally {
      setContactToDelete(null);
    }
  };

  const handleCloseSnackbar = () => setSnackbar(prev => ({ ...prev, open: false }));

  if (loading && contacts.length === 0) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" sx={{ mb: 2 }}>Gestión de Contactos</Typography>
      
      <Grid container spacing={3}>
        {/* --- COLUMNA IZQUIERDA: LISTA Y CONTROLES --- */}
        <Grid item xs={12} md={5}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Button variant="contained" onClick={() => setIsCreating(true)}>+ Crear</Button>
            <TextField label="Buscar..." size="small" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </Box>
          <List sx={{ bgcolor: 'background.paper', maxHeight: '70vh', overflow: 'auto' }}>
            {contacts.map(contact => (
              <ListItem key={contact.id} disablePadding secondaryAction={
                <>
                  <IconButton edge="end" onClick={() => setEditingContact(contact)}><EditIcon /></IconButton>
                  <IconButton edge="end" onClick={() => setContactToDelete(contact)}><DeleteIcon /></IconButton>
                </>
              }>
                <ListItemButton selected={selectedContact?.id === contact.id} onClick={() => setSelectedContact(contact)}>
                  <ListItemText 
                    primary={`${contact.first_name} ${contact.last_name}`} 
                    secondary={contact.email}
                    sx={{
                      '& .MuiListItemText-primary': {
                        color: contact.is_active === false ? 'error.main' : 'inherit'
                      },
                      '& .MuiListItemText-secondary': {
                        color: contact.is_active === false ? 'error.main' : 'inherit'
                      }
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Grid>

        {/* --- COLUMNA DERECHA: DETALLE DEL CONTACTO --- */}
        <Grid item xs={12} md={7}>
          {selectedContact ? (
            <ContactDetail contact={selectedContact} onClose={() => setSelectedContact(null)} />
          ) : (
            <Box sx={{ textAlign: 'center', color: 'text.secondary', mt: 10 }}>
              <Typography>Selecciona un contacto de la lista para ver sus detalles</Typography>
            </Box>
          )}
        </Grid>
      </Grid>
      
      <ContactForm open={isCreating || !!editingContact} onClose={() => { setIsCreating(false); setEditingContact(null); }} onSave={handleSave} existingContact={editingContact} municipalities={municipalities} occupations={occupations} />
      <ConfirmationDialog open={!!contactToDelete} onClose={() => setContactToDelete(null)} onConfirm={handleDelete} title="Confirmar Eliminación" message={`¿Seguro que quieres eliminar a ${contactToDelete?.first_name}?`} />
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Container>
  );
}

export default ContactsPage;