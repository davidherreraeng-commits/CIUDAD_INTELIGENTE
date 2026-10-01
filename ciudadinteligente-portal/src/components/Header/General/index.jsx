import { useState } from 'react';

import { Toolbar, AppBar, IconButton, Typography, Tooltip, Popover, TextField, Button, Box } from '@mui/material';
import { Password } from '@mui/icons-material';

import { updatePassword } from '../../../api/users';

import Swal from 'sweetalert2';

import { useErrorAlert } from '../../../hooks/errorAlert';
import NotificationBell from './NotificationsBell';

export function Header() {
  const { errorAlert } = useErrorAlert();

  const [anchorEl, setAnchorEl] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setNewPassword('');
  };

  const handleUpdatePassword = () => {
    updatePassword({ password: newPassword })
      .then((res) => {
        Swal.fire({
          icon: 'success',
          title: 'Contraseña actualizada',
          text: res.message,
          timer: 2000,
          showConfirmButton: false,
          timerProgressBar: true,
        });
      })
      .catch((err) => errorAlert("Error en la eliminación", err));
    handleClose();
  };

  return (
    <AppBar sx={{ background: '#3366cc' }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Ciudad Inteligente
        </Typography>
        
        <Tooltip title="Restablecer contraseña" arrow>
          </Tooltip>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Aquí va la campana, ella misma se encarga de validar el rol internamente */}
          <NotificationBell />

          {/* Aquí iría el resto de info del usuario que ya tengas */}
        </Box>
          <IconButton color="inherit" onClick={handleOpen}>
            <Password />
          </IconButton>
        
        <Popover
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >

          <Box sx={{ p: 2, width: 250 }}>
            <TextField
              fullWidth
              label="Nueva contraseña"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button variant="contained" fullWidth onClick={handleUpdatePassword}>
              Actualizar
            </Button>
          </Box>
        </Popover>
      </Toolbar>
    </AppBar>
  )
}
