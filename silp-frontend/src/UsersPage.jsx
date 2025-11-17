import { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Typography, List, ListItem, ListItemText, CircularProgress, Box, Button, Snackbar, Alert, IconButton, TextField, Grid, ListItemButton } from '@mui/material';
import { getApiUrl } from './config';
import AddUserForm from './AddUserForm';
import ConfirmationDialog from './ConfirmationDialog';
import UserDetail from './UserDetail'; // <-- Importamos el nuevo componente
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

function UsersPage({ token }) {
  const [users, setUsers] = useState([]);
  const [municipalities, setMunicipalities] = useState([]);
  const [occupations, setOccupations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null); // <-- Nuevo estado
  const [editingUser, setEditingUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    try {
      const [usersRes, municipalitiesRes, occupationsRes] = await Promise.all([
        axios.get(getApiUrl('/users/'), { headers: { Authorization: `Bearer ${token}` }, params: { search: searchTerm } }),
        axios.get(getApiUrl('/municipalities/')),
        axios.get(getApiUrl('/occupations/'))
      ]);
      setUsers(usersRes.data);
      setMunicipalities(municipalitiesRes.data);
      setOccupations(occupationsRes.data);
    } catch (error) {
      setSnackbar({ open: true, message: 'Error al cargar los datos.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        // Hacemos las tres peticiones en paralelo para cargar todo
        const [usersRes, municipalitiesRes, occupationsRes] = await Promise.all([
          axios.get(getApiUrl('/users/'), { 
            headers: { Authorization: `Bearer ${token}` },
            params: { search: searchTerm }
          }),
          axios.get(getApiUrl('/municipalities/')),
          axios.get(getApiUrl('/occupations/'))
        ]);

        setUsers(usersRes.data);
        setMunicipalities(municipalitiesRes.data);
        setOccupations(occupationsRes.data); // <-- Guardamos las ocupaciones en el estado
        
      } catch (error) {
        setSnackbar({ open: true, message: 'Error al cargar los datos iniciales.', severity: 'error' });
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchInitialData, 500);
    return () => clearTimeout(timer);
  }, [token, searchTerm]);

  const handleSave = async (userData) => {
    const isEditMode = !!editingUser;
    const url = isEditMode ? getApiUrl(`/users/${editingUser.id}`) : getApiUrl('/users/');
    const method = isEditMode ? 'put' : 'post';
    try {
      const response = await axios[method](url, userData, { headers: { Authorization: `Bearer ${token}` } });
      if (isEditMode) {
        setUsers(users.map(u => u.id === editingUser.id ? response.data : u));
        setSelectedUser(response.data); // <-- Actualiza el detalle
        setSnackbar({ open: true, message: '¡Usuario actualizado!', severity: 'success' });
      } else {
        setUsers([...users, response.data]);
        setSnackbar({ open: true, message: '¡Usuario creado!', severity: 'success' });
      }
    } catch (err) {
      let errorMessage = 'Ocurrió un error al guardar.';
      // Este código extrae el mensaje de texto de un error de validación de Pydantic
      if (err.response?.data?.detail && Array.isArray(err.response.data.detail)) {
        errorMessage = `Error en el campo '${err.response.data.detail[0].loc[1]}': ${err.response.data.detail[0].msg}`;
      } else if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      }
      setSnackbar({ open: true, message: err.response?.data?.detail || 'Ocurrió un error.', severity: 'error' });
    } finally {
      setIsCreating(false);
      setEditingUser(null);
    }
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    try {
      await axios.delete(getApiUrl(`/users/${userToDelete.id}`), { headers: { Authorization: `Bearer ${token}` } });
      setUsers(users.filter(u => u.id !== userToDelete.id));
      setSelectedUser(null);
      setSnackbar({ open: true, message: 'Usuario eliminado.', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Error al eliminar el usuario.', severity: 'error' });
    } finally {
      setUserToDelete(null);
    }
  };

  const handleCloseSnackbar = () => setSnackbar(prev => ({ ...prev, open: false }));

  if (loading) return <CircularProgress />;

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" sx={{ mb: 2 }}>Gestión de Usuarios</Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Button variant="contained" onClick={() => setIsCreating(true)}>+ Crear Usuario</Button>
            <TextField label="Buscar usuario..." size="small" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </Box>
          <List sx={{ bgcolor: 'background.paper' }}>
            {users.map(user => (
              <ListItem key={user.id} disablePadding secondaryAction={
                <>
                  <IconButton edge="end" onClick={() => setEditingUser(user)}><EditIcon /></IconButton>
                  <IconButton edge="end" onClick={() => setUserToDelete(user)}><DeleteIcon /></IconButton>
                </>
              }>
                <ListItemButton selected={selectedUser?.id === user.id} onClick={() => setSelectedUser(user)}>
                  <ListItemText 
                    primary={`${user.first_name} ${user.last_name} (${user.role})`} 
                    secondary={user.email}
                    sx={{
                      '& .MuiListItemText-primary': {
                        color: user.is_active === false ? 'error.main' : 'inherit'
                      },
                      '& .MuiListItemText-secondary': {
                        color: user.is_active === false ? 'error.main' : 'inherit'
                      }
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Grid>

        <Grid item xs={12} md={7}>
          {selectedUser ? (
            <UserDetail user={selectedUser} onClose={() => setSelectedUser(null)} />
          ) : (
            <Box sx={{ textAlign: 'center', color: 'text.secondary', mt: 10 }}>
              <Typography>Selecciona un usuario de la lista para ver sus detalles</Typography>
            </Box>
          )}
        </Grid>
      </Grid>
      
      <AddUserForm open={isCreating || !!editingUser} onClose={() => { setIsCreating(false); setEditingUser(null); }} onSave={handleSave} existingUser={editingUser} municipalities={municipalities} occupations={occupations}/>
      <ConfirmationDialog open={!!userToDelete} onClose={() => setUserToDelete(null)} onConfirm={handleDelete} title="Confirmar Eliminación" message={`¿Seguro que quieres eliminar a ${userToDelete?.first_name}?`} />
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Container>
  );
}

export default UsersPage;