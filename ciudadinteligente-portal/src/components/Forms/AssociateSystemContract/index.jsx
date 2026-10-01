import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  MenuItem,
  Radio,
  RadioGroup,
  TextField,
  Typography
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LinkIcon from '@mui/icons-material/Link';
import PropTypes from 'prop-types';

export function AssociateSystemContractDialog({ open, system, contracts, onClose, onAssociate }) {
  const activeContracts = useMemo(
    () => contracts.filter((contract) => contract.status === 'ACTIVO'),
    [contracts]
  );
  const firstProjectContractId = useMemo(() => contracts.reduce((firstId, contract) => (
    firstId === null || Number(contract.idContract) < firstId
      ? Number(contract.idContract)
      : firstId
  ), null), [contracts]);
  const [idContract, setIdContract] = useState('');
  const [historyMode, setHistoryMode] = useState('WITH_HISTORY');
  const [submitting, setSubmitting] = useState(false);
  const hasMigratableHistory = Boolean(
    system?.hasUnassignedProgress && !system?.hasContractHistory
  );
  const canIncludeHistory = hasMigratableHistory
    && Number(idContract) === firstProjectContractId;

  useEffect(() => {
    if (!open) return;
    const initialContractId = activeContracts.length === 1
      ? String(activeContracts[0].idContract)
      : '';
    setIdContract(initialContractId);
    setHistoryMode(
      hasMigratableHistory && Number(initialContractId) === firstProjectContractId
        ? 'WITH_HISTORY'
        : 'WITHOUT_HISTORY'
    );
  }, [open, hasMigratableHistory, activeContracts, firstProjectContractId]);

  useEffect(() => {
    if (!canIncludeHistory) setHistoryMode('WITHOUT_HISTORY');
  }, [canIncludeHistory]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!idContract || submitting) return;

    setSubmitting(true);
    const associated = await onAssociate({
      idContract: Number(idContract),
      system,
      includeHistory: canIncludeHistory && historyMode === 'WITH_HISTORY'
    });
    setSubmitting(false);

    if (associated) onClose();
  };

  return (
    <Dialog open={open} onClose={submitting ? undefined : onClose} maxWidth="sm" fullWidth>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.25, color: '#fff', bgcolor: '#1976d2' }}>
          <LinkIcon />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" component="div" sx={{ fontWeight: 800 }}>
              Asociar sistema a un contrato
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.82)' }}>
              Sistema: {system?.name || 'Sin nombre'}
            </Typography>
          </Box>
          <IconButton onClick={onClose} disabled={submitting} sx={{ color: '#fff' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          {activeContracts.length ? (
            <>
              <TextField
                select
                label="Contrato de destino"
                value={idContract}
                onChange={(event) => setIdContract(event.target.value)}
                fullWidth
                required
                sx={{ mt: 1 }}
              >
                {activeContracts.map((contract) => (
                  <MenuItem key={contract.idContract} value={String(contract.idContract)}>
                    Contrato {contract.contractNumber} — {contract.Contractor?.nameContractor || 'Sin contratista'}
                  </MenuItem>
                ))}
              </TextField>

              {canIncludeHistory && (
                <Box sx={{ mt: 3 }}>
                  <Typography sx={{ fontWeight: 800, mb: 1 }}>
                    ¿Qué debe pasar con los avances existentes?
                  </Typography>
                  <RadioGroup value={historyMode} onChange={(event) => setHistoryMode(event.target.value)}>
                    <FormControlLabel
                      value="WITH_HISTORY"
                      control={<Radio />}
                      label="Incluir los avances existentes en el contrato"
                    />
                    <FormControlLabel
                      value="WITHOUT_HISTORY"
                      control={<Radio />}
                      label="Asociar el sistema y comenzar el contrato sin historial"
                    />
                  </RadioGroup>
                </Box>
              )}
            </>
          ) : (
            <Alert severity="info" sx={{ mt: 1 }}>
              No hay contratos activos disponibles. Debes crear o activar un contrato antes de asociar el sistema.
            </Alert>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, bgcolor: '#f8f9fa' }}>
          <Button onClick={onClose} disabled={submitting} color="inherit">
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={!idContract || submitting}>
            {submitting ? 'Asociando...' : 'Asociar sistema'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

AssociateSystemContractDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  system: PropTypes.object,
  contracts: PropTypes.array,
  onClose: PropTypes.func.isRequired,
  onAssociate: PropTypes.func.isRequired
};

AssociateSystemContractDialog.defaultProps = {
  contracts: []
};
