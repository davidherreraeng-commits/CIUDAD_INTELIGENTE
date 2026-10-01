import { Paper, Typography, Box, Chip, TextField, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import { useState } from 'react';
import StatusSelector from '../../Grid/Systems/StatusSelector';

import PropTypes from "prop-types";
export function ProgressHeaderInfo ({
  selectedSystem,
  contractNumber,
  editSystemDescription,
  setEditSystemDescription,
  updateSystemDescription,
  loadingSystemDescription,
  editSystemDates,
  setEditSystemDates,
  updateSystemDates,
  onStatusChange,
}) {
  const [initDate, setInitDate] = useState(selectedSystem?.initDate?.substring(0, 10) || "");
  const [finalDate, setFinalDate] = useState(selectedSystem?.finalDate?.substring(0, 10) || "");
  const [description, setDescription] = useState(selectedSystem.description || "");

  const resetDate = () => {
    setEditSystemDates(false);
    setInitDate(selectedSystem?.initDate?.substring(0, 10) || "")
    setFinalDate(selectedSystem?.finalDate?.substring(0, 10) || "")
  }

  const resetDescription = () => {
    setEditSystemDescription(false);
    setDescription(selectedSystem.description || "");
  }

  return (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        mb: 2,
        borderRadius: 3,
        backgroundColor: '#ffffff',
        border: '1px solid #e0e0e0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#424242' }}>
          {selectedSystem.name || 'Sistema'}
        </Typography>
        {contractNumber && (
          <Chip label={`Contrato ${contractNumber}`} color="primary" variant="outlined" size="small" />
        )}
      </Box>

      

      {/* --- DESCRIPCIÓN DEL SISTEMA --- */}
      <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Typography sx={{ fontWeight: 600, color: '#555' }}>Descripción del sistema</Typography>

        <Box sx={{ display:'flex', gap: 1, alignItems:'flex-start' }}>
          <TextField
            fullWidth
            multiline
            minRows={4}
            disabled={!editSystemDescription}
            value={description}
            onChange={(e)=> setDescription(e.target.value)}
            sx={{ ...(!editSystemDescription && { backgroundColor: '#F1F1F1' }), borderRadius: 1, flexGrow: 1 }}
          />

          {editSystemDescription ? (
            <Box sx={{ display:'flex', flexDirection:'column', gap:1 }}>
              <IconButton
                disabled={loadingSystemDescription}
                color="error"
                size="small"
                onClick={resetDescription}
              >
                <CloseIcon />
              </IconButton>
              <IconButton
                disabled={selectedSystem.description === description}
                color="success"
                size="small"
                onClick={() => updateSystemDescription(description)}
              >
                <CheckIcon />
              </IconButton>
            </Box>
          ) : (
            <IconButton
              disabled={loadingSystemDescription}
              color="primary"
              size="small"
              onClick={()=> setEditSystemDescription(true)}
              sx={{ mt:1 }}
            >
              <EditIcon />
            </IconButton>
          )}
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
        Fecha Inicio:
        <TextField
          type="date"
          size="small"
          disabled={!editSystemDates}
          value={initDate}
          onChange={(e) => setInitDate(e.target.value)}
          sx={{ ...(!editSystemDates && { backgroundColor: '#F5F5F5' }) }}
        />

        Fecha Fin:
        <TextField
          type="date"
          size="small"
          disabled={!editSystemDates}
          value={finalDate}
          onChange={(e) => setFinalDate(e.target.value)}
          sx={{ ...(!editSystemDates && { backgroundColor: '#F5F5F5' }) }}
        />

        {editSystemDates ? (
          <>
            <IconButton
              color="error"
              size="small"
              onClick={resetDate}
            >
              <CloseIcon />
            </IconButton>

            <IconButton
              color="success"
              size="small"
              disabled={
                selectedSystem?.initDate?.substring(0, 10) === initDate &&
                selectedSystem?.finalDate?.substring(0, 10) === finalDate
              }
              onClick={() => updateSystemDates(initDate, finalDate)}
            >
              <CheckIcon />
            </IconButton>
          </>
        ) : (
          <IconButton color="primary" size="small" onClick={()=> setEditSystemDates(true)}>
            <EditIcon />
          </IconButton>
        )}

        <StatusSelector 
           currentStatus={selectedSystem.status}
           systemsId={selectedSystem.systemsId}
           idContractSystem={selectedSystem.idContractSystem}
           onStatusChange={onStatusChange}
        />
      </Box>
    </Paper>
  )
}

ProgressHeaderInfo.propTypes = {
    selectedSystem: PropTypes.bool,
    contractNumber: PropTypes.string,
    editSystemDescription: PropTypes.string,
    setEditSystemDescription: PropTypes.string,
    updateSystemDescription: PropTypes.string,
    loadingSystemDescription: PropTypes.bool,
    editSystemDates: PropTypes.object,
    setEditSystemDates: PropTypes.object,
    updateSystemDates: PropTypes.object,
    onStatusChange: PropTypes.func,
};
