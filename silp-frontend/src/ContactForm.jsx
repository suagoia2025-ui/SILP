import { useState, useEffect, useRef } from 'react';
import {
  Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle,
  MenuItem, FormControl, InputLabel, Select, FormControlLabel, Switch, Box,
  FormHelperText, useMediaQuery, useTheme
} from '@mui/material';
import { useIsMobile } from './hooks/useIsMobile';
import { MobileStickyActions } from './components/MobileStickyActions';

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

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const isMobile = useIsMobile();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Refs para scroll automático en móvil
  const inputRefs = useRef({});
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
    setErrors({});
    setTouched({});
  }, [existingContact, open]);

  // Scroll automático al foco en móvil
  const handleFocus = (fieldName) => {
    if (isMobile && inputRefs.current[fieldName]) {
      setTimeout(() => {
        inputRefs.current[fieldName]?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }, 300); // Delay para que el teclado aparezca primero
    }
  };

  const handleBlur = (fieldName) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    validateField(fieldName, formData[fieldName]);
  };

  const validateField = (name, value) => {
    const newErrors = { ...errors };
    
    if (name === 'first_name' && !value.trim()) {
      newErrors.first_name = 'El nombre es requerido';
    } else if (name === 'last_name' && !value.trim()) {
      newErrors.last_name = 'El apellido es requerido';
    } else if (name === 'cedula' && value && (value.length < 5 || value.length > 15)) {
      newErrors.cedula = 'La cédula debe tener entre 5 y 15 dígitos';
    } else if (name === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      newErrors.email = 'Correo electrónico inválido';
    } else {
      delete newErrors[name];
    }
    
    setErrors(newErrors);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prevData => ({ ...prevData, [name]: checked }));
    } else if (name === 'cedula') {
      const numericValue = value.replace(/\D/g, '');
      setFormData(prevData => ({ ...prevData, [name]: numericValue }));
      if (touched[name]) {
        validateField(name, numericValue);
      }
    } else {
      setFormData(prevData => ({ ...prevData, [name]: value }));
      if (touched[name]) {
        validateField(name, value);
      }
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    
    // Marcar todos como touched para mostrar errores
    const allFields = ['first_name', 'last_name', 'cedula', 'email'];
    const newTouched = {};
    allFields.forEach(field => {
      newTouched[field] = true;
      validateField(field, formData[field]);
    });
    setTouched(newTouched);

    // Validar campos requeridos
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      return;
    }

    // Vibración sutil en móvil al éxito
    if (isMobile && navigator.vibrate) {
      navigator.vibrate(50);
    }
    
    let dataToSend;

    if (isEditMode && existingContact) {
      dataToSend = {};
      
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
      dataToSend = { ...formData };

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

      dataToSend.is_active = Boolean(dataToSend.is_active);

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

  // Estilos comunes para TextField móvil
  const textFieldSx = {
    '& .MuiInputBase-root': {
      minHeight: isMobile ? 56 : 40,
      fontSize: isMobile ? 16 : 14,
    },
    '& .MuiInputBase-input': {
      padding: isMobile ? '16px 14px' : '8px 14px',
      fontSize: isMobile ? 16 : 14,
    },
  };

  return (
    <>
      <Dialog 
        open={open} 
        onClose={onClose}
        fullScreen={fullScreen}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            maxHeight: isMobile ? '100vh' : '90vh',
            m: isMobile ? 0 : 2,
          }
        }}
      >
        <DialogTitle sx={{ fontSize: isMobile ? '1.25rem' : '1.5rem', pb: 1 }}>
          {isEditMode ? 'Editar Contacto' : 'Crear Nuevo Contacto'}
        </DialogTitle>
        <DialogContent 
          sx={{ 
            pb: isMobile ? 10 : 2, // Espacio para sticky actions en móvil
            '& > *': { mb: isMobile ? 2 : 1.5 }
          }}
        >
          <TextField 
            autoFocus={!isMobile}
            name="first_name" 
            label="Nombre" 
            fullWidth 
            variant={isMobile ? 'outlined' : 'standard'}
            value={formData.first_name} 
            onChange={handleChange}
            onFocus={() => handleFocus('first_name')}
            onBlur={() => handleBlur('first_name')}
            required
            error={touched.first_name && !!errors.first_name}
            helperText={touched.first_name && errors.first_name}
            inputRef={el => inputRefs.current.first_name = el}
            inputProps={{ 
              style: { fontSize: isMobile ? 16 : 14 },
              autoCapitalize: 'words',
              autoCorrect: 'off',
            }}
            sx={textFieldSx}
          />

          <TextField 
            name="last_name" 
            label="Apellido" 
            fullWidth 
            variant={isMobile ? 'outlined' : 'standard'}
            value={formData.last_name} 
            onChange={handleChange}
            onFocus={() => handleFocus('last_name')}
            onBlur={() => handleBlur('last_name')}
            required
            error={touched.last_name && !!errors.last_name}
            helperText={touched.last_name && errors.last_name}
            inputRef={el => inputRefs.current.last_name = el}
            inputProps={{ 
              style: { fontSize: isMobile ? 16 : 14 },
              autoCapitalize: 'words',
              autoCorrect: 'off',
            }}
            sx={textFieldSx}
          />

          <TextField 
            name="cedula" 
            label="Cédula" 
            fullWidth 
            variant={isMobile ? 'outlined' : 'standard'}
            value={formData.cedula} 
            onChange={handleChange}
            onFocus={() => handleFocus('cedula')}
            onBlur={() => handleBlur('cedula')}
            error={touched.cedula && !!errors.cedula}
            helperText={touched.cedula ? errors.cedula : 'Opcional. Solo números (mínimo 5, máximo 15 dígitos)'}
            inputRef={el => inputRefs.current.cedula = el}
            inputProps={{ 
              inputMode: 'numeric',
              pattern: '[0-9]*',
              style: { fontSize: isMobile ? 16 : 14 },
              autoCapitalize: 'off',
              autoCorrect: 'off',
            }}
            sx={textFieldSx}
          />

          <TextField 
            name="email" 
            label="Correo Electrónico" 
            type="email" 
            fullWidth 
            variant={isMobile ? 'outlined' : 'standard'}
            value={formData.email} 
            onChange={handleChange}
            onFocus={() => handleFocus('email')}
            onBlur={() => handleBlur('email')}
            error={touched.email && !!errors.email}
            helperText={touched.email && errors.email}
            inputRef={el => inputRefs.current.email = el}
            inputProps={{ 
              inputMode: 'email',
              style: { fontSize: isMobile ? 16 : 14 },
              autoCapitalize: 'off',
              autoCorrect: 'off',
              autoComplete: 'email',
            }}
            sx={textFieldSx}
          />

          <TextField 
            name="phone" 
            label="Teléfono" 
            fullWidth 
            variant={isMobile ? 'outlined' : 'standard'}
            value={formData.phone} 
            onChange={handleChange}
            onFocus={() => handleFocus('phone')}
            onBlur={() => handleBlur('phone')}
            inputRef={el => inputRefs.current.phone = el}
            inputProps={{ 
              inputMode: 'tel',
              style: { fontSize: isMobile ? 16 : 14 },
              autoCapitalize: 'off',
              autoCorrect: 'off',
              autoComplete: 'tel',
            }}
            sx={textFieldSx}
          />

          <TextField 
            name="address" 
            label="Dirección" 
            fullWidth 
            variant={isMobile ? 'outlined' : 'standard'}
            value={formData.address} 
            onChange={handleChange}
            onFocus={() => handleFocus('address')}
            onBlur={() => handleBlur('address')}
            inputRef={el => inputRefs.current.address = el}
            inputProps={{ 
              style: { fontSize: isMobile ? 16 : 14 },
              autoCapitalize: 'words',
              autoCorrect: 'off',
              enterKeyHint: 'next',
            }}
            sx={textFieldSx}
          />
          
          <FormControl 
            fullWidth 
            variant={isMobile ? 'outlined' : 'standard'}
            sx={{ 
              minHeight: isMobile ? 56 : 'auto',
              mb: isMobile ? 0.5 : 0,
            }}
          >
            <InputLabel id="municipality-label" sx={{ fontSize: isMobile ? 16 : 14 }}>
              Municipio
            </InputLabel>
            <Select 
              native={isMobile}
              labelId="municipality-label" 
              name="municipality_id" 
              value={formData.municipality_id} 
              onChange={handleChange}
              label="Municipio"
              onFocus={() => handleFocus('municipality_id')}
              sx={{
                minHeight: isMobile ? 56 : 'auto',
                fontSize: isMobile ? 16 : 14,
                '& .MuiSelect-select': {
                  padding: isMobile ? '16px 14px' : '8px 14px',
                }
              }}
            >
              {isMobile ? (
                <>
                  <option value="">Ninguno</option>
                  {municipalities.map((mun) => (
                    <option key={mun.id} value={mun.id}>{mun.name}</option>
                  ))}
                </>
              ) : (
                <>
                  <MenuItem value=""><em>Ninguno</em></MenuItem>
                  {municipalities.map((mun) => (
                    <MenuItem key={mun.id} value={mun.id}>{mun.name}</MenuItem>
                  ))}
                </>
              )}
            </Select>
          </FormControl>

          <FormControl 
            fullWidth 
            variant={isMobile ? 'outlined' : 'standard'}
            sx={{ 
              minHeight: isMobile ? 56 : 'auto',
              mb: isMobile ? 0.5 : 0,
            }}
          >
            <InputLabel id="occupation-label" sx={{ fontSize: isMobile ? 16 : 14 }}>
              Ocupación
            </InputLabel>
            <Select 
              native={isMobile}
              labelId="occupation-label" 
              name="occupation_id" 
              value={formData.occupation_id} 
              onChange={handleChange}
              label="Ocupación"
              onFocus={() => handleFocus('occupation_id')}
              sx={{
                minHeight: isMobile ? 56 : 'auto',
                fontSize: isMobile ? 16 : 14,
                '& .MuiSelect-select': {
                  padding: isMobile ? '16px 14px' : '8px 14px',
                }
              }}
            >
              {isMobile ? (
                <>
                  <option value="">Ninguna</option>
                  {occupations.map((occ) => (
                    <option key={occ.id} value={occ.id}>{occ.name}</option>
                  ))}
                </>
              ) : (
                <>
                  <MenuItem value=""><em>Ninguna</em></MenuItem>
                  {occupations.map((occ) => (
                    <MenuItem key={occ.id} value={occ.id}>{occ.name}</MenuItem>
                  ))}
                </>
              )}
            </Select>
          </FormControl>

          <Box sx={{ 
            mt: isMobile ? 2 : 1, 
            mb: isMobile ? 1 : 0,
            minHeight: isMobile ? 56 : 'auto',
            display: 'flex',
            alignItems: 'center',
          }}>
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
              sx={{ 
                height: isMobile ? 56 : 'auto',
                alignItems: 'center',
                '& .MuiFormControlLabel-label': {
                  fontSize: isMobile ? 16 : 14,
                }
              }}
            />
          </Box>

          <TextField 
            name="mdv" 
            label="Referencia MDV" 
            fullWidth 
            variant={isMobile ? 'outlined' : 'standard'}
            value={formData.mdv} 
            onChange={handleChange}
            onFocus={() => handleFocus('mdv')}
            onBlur={() => handleBlur('mdv')}
            inputRef={el => inputRefs.current.mdv = el}
            helperText="Referencia alfanumérica libre"
            inputProps={{ 
              style: { fontSize: isMobile ? 16 : 14 },
              autoCapitalize: 'off',
              autoCorrect: 'off',
              enterKeyHint: 'done',
            }}
            sx={textFieldSx}
          />
        </DialogContent>
        
        {!isMobile && (
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={onClose} size="large">Cancelar</Button>
            <Button 
              onClick={handleSubmit} 
              variant="contained" 
              size="large"
              sx={{ height: 48, fontSize: 16 }}
            >
              {isEditMode ? 'Guardar Cambios' : 'Guardar'}
            </Button>
          </DialogActions>
        )}
      </Dialog>

      {/* Sticky actions bar para móvil */}
      {isMobile && open && (
        <MobileStickyActions
          onCancel={onClose}
          onSubmit={handleSubmit}
          submitLabel={isEditMode ? 'Guardar Cambios' : 'Guardar'}
        />
      )}
    </>
  );
}

export default ContactForm;
