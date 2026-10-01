import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  TextField,
  Typography
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import PropTypes from 'prop-types';

import { formatMoney } from '../../../utils/formatMoney';

const contractToForm = (contract) => ({
  contractNumber: contract?.contractNumber || '',
  contractor: contract?.Contractor?.nameContractor || '',
  initDate: contract?.initDate?.substring(0, 10) || '',
  finalDate: contract?.finalDate?.substring(0, 10) || '',
  budget: Number(contract?.budget || 0),
  status: contract?.status || 'ACTIVO'
});

export function EditContractDialog({ open, contract, onClose, onUpdate }) {
  const [form, setForm] = useState(() => contractToForm(contract));
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) setForm(contractToForm(contract));
  }, [open, contract]);

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const updateBudget = (event) => {
    const rawValue = event.target.value.replace(/\D/g, '');
    setForm((current) => ({ ...current, budget: rawValue ? Number(rawValue) : 0 }));
  };

  const invalidDates = Boolean(
    form.initDate && form.finalDate && form.finalDate < form.initDate
  );
  const isComplete = Boolean(
    form.contractNumber.trim() &&
    form.contractor.trim() &&
    form.initDate &&
    form.finalDate &&
    !invalidDates &&
    Number.isSafeInteger(Number(form.budget)) &&
    Number(form.budget) >= 0
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isComplete || submitting) return;

    setSubmitting(true);
    const updated = await onUpdate(contract.idContract, {
      ...form,
      budget: Number(form.budget)
    });
    setSubmitting(false);

    if (updated) onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            width: 'calc(100% - 32px)',
            maxWidth: 720,
            borderRadius: 3,
            overflow: 'hidden'
          }
        }
      }}
    >
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle
          sx={{
            py: 2,
            px: { xs: 2.5, sm: 3 },
            display: 'flex',
            alignItems: 'center',
            gap: 1.25,
            color: '#fff',
            bgcolor: '#1976d2'
          }}
        >
          <Box
            sx={{
              display: 'grid',
              placeItems: 'center',
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: 'rgba(255,255,255,0.16)'
            }}
          >
            <EditIcon />
          </Box>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" component="div" sx={{ fontWeight: 800 }}>
              Editar contrato
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.82)' }}>
              Los sistemas y su histórico no se modificarán.
            </Typography>
          </Box>
          <IconButton
            onClick={onClose}
            disabled={submitting}
            aria-label="Cerrar edición"
            sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.12)', '&:hover': { bgcolor: 'rgba(255,255,255,0.22)' } }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: { xs: 2, sm: 3 }, bgcolor: '#f6f8fb' }}>
          <Paper variant="outlined" sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 2.5, bgcolor: '#fff' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1976d2' }}>
              Información del contrato
            </Typography>
            <Divider sx={{ mt: 1, mb: 2.5 }} />

            <Grid container spacing={2.25}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Número del contrato"
                  value={form.contractNumber}
                  onChange={updateField('contractNumber')}
                  fullWidth
                  required
                  autoFocus
                  size="small"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Contratista"
                  value={form.contractor}
                  onChange={updateField('contractor')}
                  fullWidth
                  required
                  size="small"
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Typography variant="caption" sx={{ display: 'block', mt: 0.5, fontWeight: 800, color: 'text.secondary' }}>
                  VIGENCIA
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Fecha de inicio"
                  type="date"
                  value={form.initDate}
                  onChange={updateField('initDate')}
                  fullWidth
                  required
                  size="small"
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Fecha de finalización"
                  type="date"
                  value={form.finalDate}
                  onChange={updateField('finalDate')}
                  error={invalidDates}
                  helperText={invalidDates ? 'Debe ser posterior a la fecha de inicio' : undefined}
                  fullWidth
                  required
                  size="small"
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Typography variant="caption" sx={{ display: 'block', mt: 0.5, fontWeight: 800, color: 'text.secondary' }}>
                  INFORMACIÓN FINANCIERA Y ESTADO
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Presupuesto"
                  value={formatMoney(form.budget)}
                  onChange={updateBudget}
                  fullWidth
                  required
                  size="small"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select
                  label="Estado del contrato"
                  value={form.status}
                  onChange={updateField('status')}
                  fullWidth
                  size="small"
                >
                  <MenuItem value="ACTIVO">Activo</MenuItem>
                  <MenuItem value="FINALIZADO">Finalizado</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </Paper>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #e6e9ee', bgcolor: '#fff', gap: 1 }}>
          <Button onClick={onClose} disabled={submitting} color="inherit" sx={{ fontWeight: 700 }}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={!isComplete || submitting}
            sx={{ px: 3, minWidth: 170, fontWeight: 700 }}
          >
            {submitting ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

EditContractDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  contract: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired
};
