import { useState, useEffect, useRef } from 'react';
import {
  Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle,
  MenuItem, FormControl, InputLabel, Select, FormControlLabel, Switch, Box,
  useMediaQuery, useTheme
} from '@mui/material';
import { useIsMobile } from './hooks/useIsMobile';
import { MobileStickyActions } from './components/MobileStickyActions';

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
    mdv: '',
    password: ''
  });
  
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const isMobile = useIsMobile();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  
  const inputRefs = useRef({});
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
        mdv: existingUser.mdv || '',
        password: ''
      });
    } else {
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
    setErrors({});
    setTouched({});
  }, [existingUser, open]);

  const handleFocus = (fieldName) => {
    if (isMobile && inputRefs.current[fieldName]) {
      setTimeout(() => {
        inputRefs.current[fieldName]?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }, 300);
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
    } else if (name === 'email' && !value.trim()) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (name === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      newErrors.email = 'Correo electrónico inválido';
    } else if (name === 'phone' && !value.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    } else if (name === 'password' && !isEditMode && !value.trim()) {
      newErrors.password = 'La contraseña es requerida';
    } else if (name === 'password' && !isEditMode && value && value.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    } else if (name === 'cedula' && value && (value.length < 5 || value.length > 15)) {
      newErrors.cedula = 'La cédula debe tener entre 5 y 15 dígitos';
    } else {
      delete newErrors[name];
    }
    
    setErrors(newErrors);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'cedula') {
      const numericValue = value.replace(/\D/g, '');
      setFormData(prev => ({ ...prev, [name]: numericValue }));
      if (touched[name]) {
        validateField(name, numericValue);
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      if (touched[name]) {
        validateField(name, value);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const allFields = ['first_name', 'last_name', 'email', 'phone'];
    if (!isEditMode) {
      allFields.push('password');
    }
    
    const newTouched = {};
    allFields.forEach(field => {
      newTouched[field] = true;
      validateField(field, formData[field]);
    });
    setTouched(newTouched);

    if (!formData.first_name.trim() || !formData.last_name.trim() || 
        !formData.email.trim() || !formData.phone.trim() || 
        (!isEditMode && !formData.password.trim())) {
      return;
    }

    if (isMobile && navigator.vibrate) {
      navigator.vibrate(50);
    }
    
    let dataToSend;

    if (isEditMode && existingUser) {
      dataToSend = {};
      
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
      if (formData.password && formData.password.trim() !== '') {
        dataToSend.password = formData.password;
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

    onSave(dataToSend, isEditMode ? existingUser.id : null);
    onClose();
  };

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
          {isEditMode ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
        </DialogTitle>
        <DialogContent 
          sx={{ 
            pb: isMobile ? 10 : 2,
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
            required
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
            required
            error={touched.phone && !!errors.phone}
            helperText={touched.phone && errors.phone}
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

          {!isEditMode && (
            <TextField 
              name="password" 
              label="Contraseña" 
              type="password" 
              fullWidth 
              variant={isMobile ? 'outlined' : 'standard'}
              value={formData.password} 
              onChange={handleChange}
              onFocus={() => handleFocus('password')}
              onBlur={() => handleBlur('password')}
              required
              error={touched.password && !!errors.password}
              helperText={touched.password ? errors.password : 'Mínimo 6 caracteres'}
              inputRef={el => inputRefs.current.password = el}
              inputProps={{ 
                style: { fontSize: isMobile ? 16 : 14 },
                autoCapitalize: 'off',
                autoCorrect: 'off',
                autoComplete: 'new-password',
              }}
              sx={textFieldSx}
            />
          )}
          
          <FormControl 
            fullWidth 
            variant={isMobile ? 'outlined' : 'standard'}
            required
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
                municipalities.map((mun) => (
                  <option key={mun.id} value={mun.id}>{mun.name}</option>
                ))
              ) : (
                municipalities.map((mun) => (
                  <MenuItem key={mun.id} value={mun.id}>
                    {mun.name}
                  </MenuItem>
                ))
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

          <FormControl 
            fullWidth 
            variant={isMobile ? 'outlined' : 'standard'}
            sx={{ 
              minHeight: isMobile ? 56 : 'auto',
              mb: isMobile ? 0.5 : 0,
            }}
          >
            <InputLabel id="role-label" sx={{ fontSize: isMobile ? 16 : 14 }}>
              Rol
            </InputLabel>
            <Select 
              native={isMobile}
              labelId="role-label" 
              name="role" 
              value={formData.role} 
              onChange={handleChange}
              label="Rol"
              onFocus={() => handleFocus('role')}
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
                  <option value="lider">Líder</option>
                  <option value="admin">Administrador</option>
                </>
              ) : (
                <>
                  <MenuItem value="lider">Líder</MenuItem>
                  <MenuItem value="admin">Administrador</MenuItem>
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
              label="Usuario Activo"
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

export default AddUserForm;
