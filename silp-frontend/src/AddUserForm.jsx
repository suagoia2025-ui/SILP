import { useState, useEffect } from 'react';
import {
  Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle,
  MenuItem, FormControl, InputLabel, Select, FormControlLabel, Switch, Box
} from '@mui/material';

function AddUserForm({ open, onClose, onSave, existingUser, municipalities, occupations }) {
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    cedula: '',
    phone: '',
    role: 'lider',
    address: '',
    municipality_id: '',
    occupation_id: '',
    is_active: true,
    mdv: ''
  });
  
  const isEditMode = !!existingUser;

  useEffect(() => {
    if (isEditMode && existingUser) {
      setFormData({
        email: existingUser.email || '',
        first_name: existingUser.first_name || '',
        last_name: existingUser.last_name || '',
        cedula: existingUser.cedula || '',
        phone: existingUser.phone || '',
        role: existingUser.role || 'lider',
        address: existingUser.address || '',
        municipality_id: existingUser.municipality?.id || '',
        occupation_id: existingUser.occupation?.id || '',
        is_active: existingUser.is_active !== undefined ? existingUser.is_active : true,
        mdv: existingUser.mdv || ''
      });
    } else {
      // Resetea el formulario para 'crear', incluyendo la contraseña
      setFormData({ 
        email: '', 
        password: '', 
        first_name: '', 
        last_name: '', 
        cedula: '',
        phone: '', 
        role: 'lider', 
        address: '', 
        municipality_id: '', 
        occupation_id: '',
        is_active: true,
        mdv: ''
      });
    }
  }, [existingUser, open]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    // Manejar Switch/Checkbox para is_active
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'cedula') {
      // Solo permitir dígitos numéricos para cédula
      const numericValue = value.replace(/\D/g, '');
      setFormData(prev => ({ ...prev, [name]: numericValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    let dataToSend;

    if (isEditMode && existingUser) {
      // En modo edición, solo enviar campos que cambiaron
      dataToSend = {};
      
      // Comparar cada campo con el valor original
      if (formData.first_name !== (existingUser.first_name || '')) {
        dataToSend.first_name = formData.first_name;
      }
      if (formData.last_name !== (existingUser.last_name || '')) {
        dataToSend.last_name = formData.last_name;
      }
      if (formData.email !== (existingUser.email || '')) {
        dataToSend.email = formData.email || null;
      }
      if (formData.cedula !== (existingUser.cedula || '')) {
        dataToSend.cedula = formData.cedula || null;
      }
      if (formData.phone !== (existingUser.phone || '')) {
        dataToSend.phone = formData.phone || null;
      }
      if (formData.address !== (existingUser.address || '')) {
        dataToSend.address = formData.address || null;
      }
      if (formData.municipality_id !== (existingUser.municipality_id || '')) {
        dataToSend.municipality_id = formData.municipality_id ? parseInt(formData.municipality_id) : null;
      }
      if (formData.occupation_id !== (existingUser.occupation_id || '')) {
        dataToSend.occupation_id = formData.occupation_id ? parseInt(formData.occupation_id) : null;
      }
      if (formData.is_active !== (existingUser.is_active !== undefined ? existingUser.is_active : true)) {
        dataToSend.is_active = Boolean(formData.is_active);
      }
      if (formData.mdv !== (existingUser.mdv || '')) {
        dataToSend.mdv = formData.mdv && formData.mdv.trim() !== '' ? formData.mdv.trim() : null;
      }
      if (formData.role !== (existingUser.role || '')) {
        dataToSend.role = formData.role;
      }
      // Solo incluir password si se proporcionó uno nuevo
      if (formData.password && formData.password.trim() !== '') {
        dataToSend.password = formData.password;
      }
    } else {
      // En modo creación, enviar todos los campos
      dataToSend = { ...formData };

      // Convertir municipality_id y occupation_id a números si tienen valor
      if (dataToSend.municipality_id) {
        dataToSend.municipality_id = parseInt(dataToSend.municipality_id);
      } else {
        dataToSend.municipality_id = null;
      }
      if (dataToSend.occupation_id) {
        dataToSend.occupation_id = parseInt(dataToSend.occupation_id);
      } else {
        dataToSend.occupation_id = null;
      }

      // Asegurar que is_active sea booleano
      dataToSend.is_active = Boolean(dataToSend.is_active);

      // Convertir campos vacíos a null
      if (!dataToSend.cedula || dataToSend.cedula.trim() === '') {
        dataToSend.cedula = null;
      }
      if (!dataToSend.email || dataToSend.email.trim() === '') {
        dataToSend.email = null;
      }
      if (!dataToSend.phone || dataToSend.phone.trim() === '') {
        dataToSend.phone = null;
      }
      if (!dataToSend.address || dataToSend.address.trim() === '') {
        dataToSend.address = null;
      }
      if (!dataToSend.mdv || dataToSend.mdv.trim() === '') {
        dataToSend.mdv = null;
      }
    }

    onSave(dataToSend, isEditMode ? existingUser.id : null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{isEditMode ? 'Editar Usuario' : 'Crear Nuevo Usuario'}</DialogTitle>
      <DialogContent>
        {/* ... (otros TextFields no cambian) ... */}
        <TextField autoFocus margin="dense" name="first_name" label="Nombre" fullWidth variant="standard" value={formData.first_name} onChange={handleChange} required />
        <TextField margin="dense" name="last_name" label="Apellido" fullWidth variant="standard" value={formData.last_name} onChange={handleChange} required />
        <TextField 
          margin="dense" 
          name="cedula" 
          label="Cédula" 
          fullWidth 
          variant="standard" 
          value={formData.cedula} 
          onChange={handleChange}
          inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
          helperText="Opcional. Solo números (mínimo 5, máximo 15 dígitos)"
        />
        <TextField margin="dense" name="email" label="Correo Electrónico" type="email" fullWidth variant="standard" value={formData.email} onChange={handleChange} required />
        <TextField margin="dense" name="phone" label="Teléfono" fullWidth variant="standard" value={formData.phone} onChange={handleChange} required />
        <TextField margin="dense" name="address" label="Dirección" fullWidth variant="standard" value={formData.address} onChange={handleChange} />

        {!isEditMode && (
          <TextField margin="dense" name="password" label="Contraseña" type="password" fullWidth variant="standard" value={formData.password} onChange={handleChange} required />
        )}
        
        <FormControl fullWidth margin="dense" variant="standard" required>
          <InputLabel id="municipality-label">Municipio</InputLabel>
          <Select
            labelId="municipality-label"
            name="municipality_id"
            value={formData.municipality_id}
            onChange={handleChange}
          >
            {municipalities.map((mun) => (
              <MenuItem key={mun.id} value={mun.id}>
                {mun.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth margin="dense" variant="standard">
          <InputLabel id="occupation-label">Ocupación</InputLabel>
          <Select labelId="occupation-label" name="occupation_id" value={formData.occupation_id} onChange={handleChange}>
            <MenuItem value=""><em>Ninguna</em></MenuItem>
            {occupations.map((occ) => (<MenuItem key={occ.id} value={occ.id}>{occ.name}</MenuItem>))}
          </Select>
        </FormControl>

        <FormControl fullWidth margin="dense" variant="standard">
          <InputLabel id="role-label">Rol</InputLabel>
          <Select labelId="role-label" name="role" value={formData.role} onChange={handleChange}>
            <MenuItem value="lider">Líder</MenuItem>
            <MenuItem value="admin">Administrador</MenuItem>
          </Select>
        </FormControl>

        <Box sx={{ mt: 2, mb: 1 }}>
          <FormControlLabel
            control={
              <Switch
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                color="primary"
              />
            }
            label="Usuario Activo"
          />
        </Box>

        <TextField 
          margin="dense" 
          name="mdv" 
          label="Referencia MDV" 
          fullWidth 
          variant="standard" 
          value={formData.mdv} 
          onChange={handleChange}
          helperText="Referencia alfanumérica libre"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSubmit}>{isEditMode ? 'Guardar Cambios' : 'Guardar'}</Button>
      </DialogActions>
    </Dialog>
  );
}

export default AddUserForm;
