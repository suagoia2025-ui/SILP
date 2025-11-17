// src/Layout.jsx
import { Link as RouterLink, Outlet } from 'react-router-dom';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemText, ListItemIcon, Typography, Button, AppBar, Toolbar } from '@mui/material';
import AccountTreeIcon from '@mui/icons-material/AccountTree';

const drawerWidth = 240;

function Layout({ currentUser, onLogout }) {
  return (
    <Box sx={{ display: 'flex' }}>
      {/* Barra de Navegación Superior */}
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6" noWrap component="div">
            Plataforma SILP
          </Typography>
          <Button color="inherit" onClick={onLogout}>Cerrar Sesión</Button>
        </Toolbar>
      </AppBar>

      {/* Menú Lateral */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            <ListItem disablePadding component={RouterLink} to="/contacts">
              <ListItemButton>
                <ListItemText primary="Gestión de Contactos" />
              </ListItemButton>
            </ListItem>

            {/* Este link solo aparece si el usuario es superadmin */}
            {currentUser?.role === 'superadmin' && (
              <ListItem disablePadding component={RouterLink} to="/users">
                <ListItemButton>
                  <ListItemText primary="Gestión de Usuarios" />
                </ListItemButton>
              </ListItem>
            )}

            {/* Este link aparece para superadmin, admin y lider */}
            {['superadmin', 'admin', 'lider'].includes(currentUser?.role) && (
              <ListItem disablePadding component={RouterLink} to="/admin/carga-contactos">
                <ListItemButton>
                  <ListItemText primary="Carga Masiva de Contactos" />
                </ListItemButton>
              </ListItem>
            )}

            {/* Este link solo aparece para superadmin y admin */}
            {['superadmin', 'admin'].includes(currentUser?.role) && (
              <ListItem disablePadding component={RouterLink} to="/admin/descarga-contactos">
                <ListItemButton>
                  <ListItemText primary="Descarga Masiva de Contactos" />
                </ListItemButton>
              </ListItem>
            )}

            {/* Este link aparece para superadmin, admin y lider */}
            {['superadmin', 'admin', 'lider'].includes(currentUser?.role) && (
              <ListItem disablePadding component={RouterLink} to="/network">
                <ListItemButton>
                  <ListItemIcon>
                    <AccountTreeIcon />
                  </ListItemIcon>
                  <ListItemText primary="Red de Contactos" />
                </ListItemButton>
              </ListItem>
            )}
          </List>
        </Box>
      </Drawer>

      {/* Área de Contenido Principal */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Outlet /> {/* Aquí React Router renderizará la página activa */}
      </Box>
    </Box>
  );
}

export default Layout;