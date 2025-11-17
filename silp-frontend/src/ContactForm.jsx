import { useState, useEffect } from 'react';
import {
  Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle,
  MenuItem, FormControl, InputLabel, Select, FormControlLabel, Switch, Box
} from '@mui/material';

function ContactForm({ open, onClose, onSave, existingContact, municipalities, occupations }) {
  const [formData, setFormData] = useState({
    first_name: '', 
    last_name: '', 
    cedula: '',
    email: '', 
    phone: '',
    address: '', 
    municipality_id: '', 
    occupation_id: '',
    is_active: true,
    mdv: ''
  });

  const isEditMode = !!existingContact;

  useEffect(() => {
    if (isEditMode && existingContact) {
      setFormData({
        first_name: existingContact.first_name || '',
        last_name: existingContact.last_name || '',
        cedula: existingContact.cedula || '',
        email: existingContact.email || '',
        phone: existingContact.phone || '',
        address: existingContact.address || '',
        municipality_id: existingContact.municipality_id || '',
        occupation_id: existingContact.occupation_id || '',
        is_active: existingContact.is_active !== undefined ? existingContact.is_active : true,
        mdv: existingContact.mdv || ''
      });
    } else {
      setFormData({ 
        first_name: '', 
        last_name: '', 
        cedula: '',
        email: '', 
        phone: '', 
        address: '', 
        municipality_id: '', 
        occupation_id: '',
        is_active: true,
        mdv: ''
      });
    }
  }, [existingContact, open]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    // Manejar Switch/Checkbox para is_active
    if (type === 'checkbox') {
      setFormData(prevData => ({ ...prevData, [name]: checked }));
    } else if (name === 'cedula') {
      // Solo permitir dígitos numéricos para cédula
      const numericValue = value.replace(/\D/g, '');
      setFormData(prevData => ({ ...prevData, [name]: numericValue }));
    } else {
      setFormData(prevData => ({ ...prevData, [name]: value }));
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    
    let dataToSend;

    if (isEditMode && existingContact) {
      // En modo edición, solo enviar campos que cambiaron
      dataToSend = {};
      
      // Comparar cada campo con el valor original
      if (formData.first_name !== (existingContact.first_name || '')) {
        dataToSend.first_name = formData.first_name;
      }
      if (formData.last_name !== (existingContact.last_name || '')) {
        dataToSend.last_name = formData.last_name;
      }
      if (formData.cedula !== (existingContact.cedula || '')) {
        dataToSend.cedula = formData.cedula || null;
      }
      if (formData.email !== (existingContact.email || '')) {
        dataToSend.email = formData.email || null;
      }
      if (formData.phone !== (existingContact.phone || '')) {
        dataToSend.phone = formData.phone || null;
      }
      if (formData.address !== (existingContact.address || '')) {
        dataToSend.address = formData.address || null;
      }
      if (formData.municipality_id !== (existingContact.municipality_id || '')) {
        dataToSend.municipality_id = formData.municipality_id ? parseInt(formData.municipality_id) : null;
      }
      if (formData.occupation_id !== (existingContact.occupation_id || '')) {
        dataToSend.occupation_id = formData.occupation_id ? parseInt(formData.occupation_id) : null;
      }
      if (formData.is_active !== (existingContact.is_active !== undefined ? existingContact.is_active : true)) {
        dataToSend.is_active = Boolean(formData.is_active);
      }
      if (formData.mdv !== (existingContact.mdv || '')) {
        dataToSend.mdv = formData.mdv && formData.mdv.trim() !== '' ? formData.mdv.trim() : null;
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

    onSave(dataToSend, isEditMode ? existingContact.id : null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{isEditMode ? 'Editar Contacto' : 'Crear Nuevo Contacto'}</DialogTitle>
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
        <TextField margin="dense" name="email" label="Correo Electrónico" type="email" fullWidth variant="standard" value={formData.email} onChange={handleChange} />
        <TextField margin="dense" name="phone" label="Teléfono" type="text" fullWidth variant="standard" value={formData.phone} onChange={handleChange} />
        <TextField margin="dense" name="address" label="Dirección" fullWidth variant="standard" value={formData.address} onChange={handleChange} />
        
        
        <FormControl fullWidth margin="dense" variant="standard">
          <InputLabel id="municipality-label">Municipio</InputLabel>
          <Select labelId="municipality-label" name="municipality_id" value={formData.municipality_id} onChange={handleChange}>
            <MenuItem value=""><em>Ninguno</em></MenuItem>
            {municipalities.map((mun) => (
              <MenuItem key={mun.id} value={mun.id}>{mun.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth margin="dense" variant="standard">
          <InputLabel id="occupation-label">Ocupación</InputLabel>
          <Select labelId="occupation-label" name="occupation_id" value={formData.occupation_id} onChange={handleChange}>
            <MenuItem value=""><em>Ninguna</em></MenuItem>
            {occupations.map((occ) => (
              <MenuItem key={occ.id} value={occ.id}>{occ.name}</MenuItem>
            ))}
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
            label="Contacto Activo"
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

export default ContactForm;