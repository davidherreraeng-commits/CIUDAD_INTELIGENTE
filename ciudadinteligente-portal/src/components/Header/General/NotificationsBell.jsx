import React, { useState, useEffect } from 'react';
import { IconButton, Badge, Menu, MenuItem, Typography, Box, Divider, CircularProgress, Tooltip } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorIcon from '@mui/icons-material/Error';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import { projectsGetStaleNotifications } from '../../../api/projects';

export default function NotificationBell() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const response = await projectsGetStaleNotifications();
      setNotifications(response.data || []);
    } catch (error) {
      console.error("Error cargando notificaciones", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleOpen = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleNotificationClick = (notif) => {
    handleClose();
    navigate('/projects', { 
      state: { 
        targetDependencyId: notif.dependencyId,
        targetProjectId: notif.projectId,
        targetSystemId: notif.id,
        targetDependencyName: notif.dependencyName,
        targetProjectName: notif.projectName
      } 
    });
  };

  const handleDismiss = (e, id) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <>
      <IconButton color="inherit" onClick={handleOpen}>
        <Badge badgeContent={notifications.length} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        slotProps={{
          paper: { style: { maxHeight: 400, width: 360 } },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1" fontWeight="bold">
            Alertas de Inactividad
          </Typography>
          {loading && <CircularProgress size={16} />}
        </Box>
        <Divider />

        {notifications.length === 0 ? (
          <MenuItem disabled>
            <Typography variant="body2">No hay alertas pendientes</Typography>
          </MenuItem>
        ) : (
          notifications.map((notif) => {
            // 2. Determinamos si es Crítica (Compromiso) o Advertencia
            const isError = notif.type === 'error';
            
            return (
            <MenuItem 
              key={notif.id} 
              onClick={() => handleNotificationClick(notif)} 
              sx={{ 
                whiteSpace: 'normal', 
                py: 1.5, 
                borderBottom: '1px solid #f0f0f0',
                position: 'relative',
                pr: 5,
                bgcolor: isError ? '#fff5f5' : 'inherit' // Fondo sutil rojo si es error
              }}
            >
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                {/* 3. Icono Dinámico */}
                {isError ? (
                   <ErrorIcon color="error" sx={{ mt: 0.5 }} />
                ) : (
                   <WarningAmberIcon color="warning" sx={{ mt: 0.5 }} />
                )}
                
                <Box>
                  <Typography variant="body2" fontWeight={600} sx={{ lineHeight: 1.2, color: isError ? '#d32f2f' : 'text.primary' }}>
                    {notif.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                    {notif.subtitle}
                  </Typography>
                  <Typography variant="caption" color={isError ? "error" : "warning.main"} fontWeight={500}>
                    Inactivo desde: {notif.date ? notif.date.substring(0, 10) : 'N/A'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#1976d2', display: 'block', mt: 0.5, fontWeight: 'bold' }}>
                    Ir al proyecto →
                  </Typography>
                </Box>
              </Box>

              <Tooltip title="Ocultar notificación">
                <IconButton
                  size="small"
                  onClick={(e) => handleDismiss(e, notif.id)}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    color: '#9e9e9e',
                    '&:hover': { color: '#d32f2f', backgroundColor: 'rgba(211, 47, 47, 0.04)' }
                  }}
                >
                  <CloseIcon fontSize="small" style={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            </MenuItem>
          )})
        )}
      </Menu>
    </>
  );
}