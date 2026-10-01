import { Box, Paper, Typography, TextField, IconButton, MenuItem } from "@mui/material";
import { Edit as EditIcon, Close as CloseIcon, Check as CheckIcon } from "@mui/icons-material";
import { useState, useEffect } from "react";
import { formatMoney } from "../../../utils/formatMoney";

import PropTypes from "prop-types";
export function DependencyHeaderInfo ({ selectedDependency, updateDependencyBudget }) {
  // Estados locales para controlar si estamos editando y el valor del input
  const [isEditing, setIsEditing] = useState(false);
  const [localBudget, setLocalBudget] = useState(selectedDependency?.globalBudget || 0);

  const [localCurrency, setLocalCurrency] = useState(selectedDependency?.currency || 'COP');

  // Si seleccionamos otra dependencia, reseteamos el valor
  useEffect(() => {
    setLocalBudget(selectedDependency?.globalBudget || 0);
    setLocalCurrency(selectedDependency?.currency || 'COP');
    setIsEditing(false);
  }, [selectedDependency]);

  const handleSave = () => {
    // Enviamos presupuesto Y moneda
    updateDependencyBudget(localBudget, localCurrency); 
    setIsEditing(false);
  };

  return (
    <Paper
      elevation={2}
      sx={{
        p: 3, mb: 2, borderRadius: 3, backgroundColor: '#ffffff',
        border: '1px solid #e0e0e0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 600, color: '#424242' }}>
        {selectedDependency.name}
        <Typography component="span" sx={{ fontSize: '0.95rem', fontWeight: 500, color: '#616161', ml: 2 }}>
          • {selectedDependency.totalProjects} proyectos asignados
        </Typography>
      </Typography>

      <Box sx={{ display: 'flex', gap: 4, mt: 2, flexWrap: 'wrap' }}>
        
        {/* --- BOLSA PRINCIPAL (EDITABLE) --- */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography sx={{ fontWeight: 600, color: '#424242' }}>Bolsa Principal:</Typography>
          
          {/* 3. SELECTOR DE MONEDA */}
          <TextField
            select
            size="small"
            disabled={!isEditing}
            value={localCurrency}
            onChange={(e) => setLocalCurrency(e.target.value)}
            sx={{ 
              width: 85, 
              ...(!isEditing && { 
                backgroundColor: '#F5F5F5',
                '& .MuiOutlinedInput-notchedOutline': { border: 'none' } 
              }),
              '& .MuiInputBase-input': { fontWeight: 600 }
            }}
         
          >
            <MenuItem value="COP">COP</MenuItem>
            <MenuItem value="USD">USD</MenuItem>
          </TextField>

          {/* INPUT DE DINERO */}
          <TextField
            size="small"
            disabled={!isEditing}
            // Usamos nuestra utilidad mejorada pasando la moneda actual
            value={formatMoney(localBudget, localCurrency)} 
            onChange={(e) => {
              const raw = e.target.value.replace(/\D/g, "");
              setLocalBudget(raw ? Number(raw) : 0);
            }}
            sx={{ width: 160, ...(!isEditing && { backgroundColor: '#F5F5F5' }) }}
          />

          {!isEditing ? (
            <IconButton color="primary" size="small" onClick={() => setIsEditing(true)}>
              <EditIcon fontSize="small" />
            </IconButton>
          ) : (
            <>
              <IconButton color="error" size="small" onClick={() => { 
                setIsEditing(false); 
                setLocalBudget(selectedDependency.globalBudget || 0);
                setLocalCurrency(selectedDependency.currency || 'COP');
              }}>
                <CloseIcon fontSize="small" />
              </IconButton>
              
              {/* Llamamos a handleSave */}
              <IconButton color="success" size="small" onClick={handleSave}>
                <CheckIcon fontSize="small" />
              </IconButton>
            </>
          )}
        </Box>

        {/* LO DISTRIBUIDO (Siempre se muestra en la moneda de la dependencia) */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography sx={{ fontWeight: 600, color: '#424242' }}>Distribuido:</Typography>
          <Typography sx={{ color: '#d32f2f', fontWeight: 700 }}>
            {formatMoney(selectedDependency.distributedBudget || 0, selectedDependency.currency || 'COP')}
          </Typography>
        </Box>

        {/* LO DISPONIBLE */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography sx={{ fontWeight: 600, color: '#424242' }}>Disponible:</Typography>
          <Typography sx={{ color: '#2e7d32', fontWeight: 700 }}>
            {formatMoney(selectedDependency.availableBudget || 0, selectedDependency.currency || 'COP')}
          </Typography>
        </Box>

      </Box>
    </Paper>
  );
}

DependencyHeaderInfo.propTypes = {
    selectedDependency: PropTypes.bool,
    updateDependencyBudget: PropTypes.object,
};
