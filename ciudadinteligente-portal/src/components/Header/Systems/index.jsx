import { useEffect, useState } from 'react';
import { Box, Button, IconButton, Paper, TextField, Tooltip, Typography } from '@mui/material';
import AddBusinessIcon from '@mui/icons-material/AddBusiness';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import PersonIcon from '@mui/icons-material/Person';
import PropTypes from 'prop-types';

import { formatMoney } from '../../../utils/formatMoney';
import { CreateContractDialog } from '../../Forms/CreateContract';

export function SystemHeaderInfo({
  selectedProject,
  systemsForProject,
  contracts,
  onCreateContract,
  onReuseContract,
  canManageContracts,
  editProjectInfo,
  setEditProjectInfo,
  changeDateProject,
  editProjectBudget,
  setEditProjectBudget,
  changeBudgetProject
}) {
  const [openCreateContract, setOpenCreateContract] = useState(false);
  const [initDate, setInitDate] = useState(selectedProject?.initDate?.substring(0, 10) || '');
  const [finalDate, setFinalDate] = useState(selectedProject?.finalDate?.substring(0, 10) || '');
  const [budget, setBudget] = useState(Number(selectedProject?.budget) || 0);

  useEffect(() => {
    setInitDate(selectedProject?.initDate?.substring(0, 10) || '');
    setFinalDate(selectedProject?.finalDate?.substring(0, 10) || '');
    setBudget(Number(selectedProject?.budget) || 0);
  }, [selectedProject]);

  const resetDates = () => {
    setEditProjectInfo(false);
    setInitDate(selectedProject?.initDate?.substring(0, 10) || '');
    setFinalDate(selectedProject?.finalDate?.substring(0, 10) || '');
  };

  const resetBudget = () => {
    setEditProjectBudget(false);
    setBudget(Number(selectedProject?.budget) || 0);
  };

  return (
    <Paper
      elevation={2}
      sx={{
        p: { xs: 2.5, sm: 3 },
        mb: 2,
        borderRadius: 3,
        bgcolor: '#fff',
        border: '1px solid #e0e0e0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: { xs: 'stretch', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#2f3944' }}>
            {selectedProject?.Project?.name || 'Proyecto'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {contracts.length
              ? `${contracts.length} ${contracts.length === 1 ? 'contrato registrado' : 'contratos registrados'}`
              : 'Gestión de contratos del proyecto'}
          </Typography>
        </Box>
        {canManageContracts && (
          <Button
            variant="contained"
            startIcon={<AddBusinessIcon />}
            onClick={() => setOpenCreateContract(true)}
            sx={{ ml: { xs: 0, sm: 'auto' }, alignSelf: { xs: 'flex-start', sm: 'center' } }}
          >
            Crear contrato
          </Button>
        )}
      </Box>

      {!contracts.length ? (
        <Box sx={{ mt: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2, color: '#424242' }}>
            <Typography sx={{ fontSize: '1.05rem' }}>Fecha Inicio:</Typography>
            <TextField
              type="date"
              size="small"
              disabled={!editProjectInfo}
              value={initDate}
              onChange={(event) => setInitDate(event.target.value)}
              sx={{ ...(!editProjectInfo && { bgcolor: '#f5f5f5' }) }}
            />
            <Typography sx={{ fontSize: '1.05rem' }}>Fecha Fin:</Typography>
            <TextField
              type="date"
              size="small"
              disabled={!editProjectInfo}
              value={finalDate}
              onChange={(event) => setFinalDate(event.target.value)}
              sx={{ ...(!editProjectInfo && { bgcolor: '#f5f5f5' }) }}
            />
            {editProjectInfo ? (
              <>
                <IconButton color="error" size="small" onClick={resetDates}><CloseIcon /></IconButton>
                <IconButton
                  color="success"
                  size="small"
                  disabled={!initDate || !finalDate || (initDate === selectedProject?.initDate?.substring(0, 10) && finalDate === selectedProject?.finalDate?.substring(0, 10))}
                  onClick={() => changeDateProject(initDate, finalDate)}
                >
                  <CheckIcon />
                </IconButton>
              </>
            ) : (
              <IconButton color="primary" size="small" onClick={() => setEditProjectInfo(true)}><EditIcon /></IconButton>
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2, mt: 2, color: '#424242' }}>
            <Typography sx={{ fontSize: '1.05rem' }}>Presupuesto:</Typography>
            <TextField
              size="small"
              disabled={!editProjectBudget}
              value={formatMoney(budget)}
              onChange={(event) => {
                const rawValue = event.target.value.replace(/\D/g, '');
                setBudget(rawValue ? Number(rawValue) : 0);
              }}
              sx={{ ...(!editProjectBudget && { bgcolor: '#f5f5f5' }) }}
            />
            {editProjectBudget ? (
              <>
                <IconButton color="error" size="small" onClick={resetBudget}><CloseIcon /></IconButton>
                <IconButton
                  color="success"
                  size="small"
                  disabled={Number(selectedProject?.budget) === budget}
                  onClick={() => changeBudgetProject(budget)}
                >
                  <CheckIcon />
                </IconButton>
              </>
            ) : (
              <IconButton color="primary" size="small" onClick={() => setEditProjectBudget(true)}><EditIcon /></IconButton>
            )}

            {selectedProject?.UserProfile && (
              <Tooltip title={`Modificado por: ${selectedProject.UserProfile.name} ${selectedProject.UserProfile.lastName}`}>
                <IconButton color="default" size="small"><PersonIcon fontSize="small" /></IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>
      ) : null}

      {canManageContracts && (
        <CreateContractDialog
          open={openCreateContract}
          onClose={() => setOpenCreateContract(false)}
          projectName={selectedProject?.Project?.name}
          projectRelationId={selectedProject?.idRelation}
          projectBudget={selectedProject?.budget}
          projectInitDate={selectedProject?.initDate}
          projectFinalDate={selectedProject?.finalDate}
          systems={systemsForProject || []}
          existingContracts={contracts || []}
          onCreate={onCreateContract}
          onReuse={onReuseContract}
        />
      )}
    </Paper>
  );
}

SystemHeaderInfo.propTypes = {
  selectedProject: PropTypes.object,
  systemsForProject: PropTypes.array,
  contracts: PropTypes.array,
  onCreateContract: PropTypes.func,
  onReuseContract: PropTypes.func,
  canManageContracts: PropTypes.bool,
  editProjectInfo: PropTypes.bool,
  setEditProjectInfo: PropTypes.func,
  changeDateProject: PropTypes.func,
  editProjectBudget: PropTypes.bool,
  setEditProjectBudget: PropTypes.func,
  changeBudgetProject: PropTypes.func
};

SystemHeaderInfo.defaultProps = {
  systemsForProject: [],
  contracts: [],
  canManageContracts: false
};
