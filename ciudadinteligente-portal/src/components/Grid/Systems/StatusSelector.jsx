import React, { useState } from 'react';
import { Box, Button, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import { 
  CheckCircle as CheckIcon, 
  PauseCircleFilled as PauseIcon, 
  Cancel as CancelIcon, 
  PlayCircleFilled as ProcessIcon 
} from '@mui/icons-material';

import PropTypes from "prop-types";
const STATUS_CONFIG = {
  'Terminado': { color: 'success', icon: <CheckIcon fontSize="small" />, label: 'Terminado' },
  'Pausado': { color: 'warning', icon: <PauseIcon fontSize="small" />, label: 'Pausado' },
  'Cancelado': { color: 'error', icon: <CancelIcon fontSize="small" />, label: 'Cancelado' },
  'En Proceso': { color: 'info', icon: <ProcessIcon fontSize="small" />, label: 'En Proceso' }
};

// 1. Recibimos 'systemsId' explícitamente para devolverlo al padre
export default function StatusSelector({
  currentStatus,
  systemsId,
  idContractSystem,
  onStatusChange
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  
  const statusToDisplay = currentStatus || 'En Proceso';
  const activeConfig = STATUS_CONFIG[statusToDisplay] || STATUS_CONFIG['En Proceso'];

  // 2. BLINDAJE DE EVENTOS: Detener propagación al abrir el menú
  const handleClick = (event) => {
    event.preventDefault();
    event.stopPropagation(); // <--- CRUCIAL: Evita que se seleccione la tarjeta del sistema
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (event) => {
    if(event) event.stopPropagation();
    setAnchorEl(null);
  };

  const handleSelect = (event, newStatus) => {
    event.preventDefault();
    event.stopPropagation(); // <--- CRUCIAL
    
    // Cerramos menú visualmente
    setAnchorEl(null);

    // Si el estado es el mismo, no hacemos nada
    if (newStatus === statusToDisplay) return;

    // 3. Emitimos el evento hacia arriba
    if (onStatusChange) {
      onStatusChange(newStatus, systemsId, idContractSystem);
    }
  };

  return (
    // Envolvemos en un Box que también detenga clics "por si acaso"
    <Box onClick={(e) => e.stopPropagation()} sx={{ display: 'inline-block' }}>
      <Button
        variant="outlined"
        color={activeConfig.color}
        size="small"
        onClick={handleClick}
        startIcon={activeConfig.icon || undefined}
        sx={{ 
          textTransform: 'none', 
          borderRadius: 2,
          minWidth: 130,
          justifyContent: "flex-start",
          fontWeight: 600,
          zIndex: 10 // Aseguramos que esté por encima visualmente
        }}
      >
        {activeConfig.label}
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        onClick={(e) => e.stopPropagation()} // El menú también debe detener propagación
      >
        {Object.keys(STATUS_CONFIG).map((statusKey) => (
          <MenuItem 
            key={statusKey} 
            onClick={(e) => handleSelect(e, statusKey)}
            selected={statusToDisplay === statusKey}
          >
            <ListItemIcon sx={{ color: `${STATUS_CONFIG[statusKey].color}.main` }}>
              {STATUS_CONFIG[statusKey].icon}
            </ListItemIcon>
            <ListItemText primary={STATUS_CONFIG[statusKey].label} />
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}

StatusSelector.propTypes = {
    currentStatus: PropTypes.string,
    systemsId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    idContractSystem: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    onStatusChange: PropTypes.func,
};
