import { useState } from 'react';
import { Box, Chip, Divider, Grid, IconButton, Paper, Tooltip, Typography } from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ComputerIcon from '@mui/icons-material/Computer';
import EditIcon from '@mui/icons-material/Edit';
import PropTypes from 'prop-types';

import { formatMoney } from '../../../utils/formatMoney';
import { EditContractDialog } from '../../Forms/EditContract';

const formatDate = (value) => {
  if (!value) return 'Sin definir';
  return new Intl.DateTimeFormat('es-CO', { timeZone: 'UTC' }).format(new Date(value));
};

export function GridContracts({
  contracts,
  onSelectContract,
  onUpdateContract,
  canManageContracts
}) {
  const [contractToEdit, setContractToEdit] = useState(null);

  if (!contracts?.length) return null;

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
        Contratos
      </Typography>

      <Grid container spacing={2}>
        {contracts.map((contract) => (
          <Grid key={contract.idContract} size={{ xs: 12, md: 6 }}>
            <Paper
              variant="outlined"
              onClick={() => onSelectContract(contract)}
              sx={{
                p: 2.5,
                height: '100%',
                borderRadius: 2.5,
                borderColor: contract.status === 'ACTIVO' ? '#8bc7a3' : '#d9e0e7',
                bgcolor: contract.status === 'ACTIVO' ? '#f7fcf9' : '#fff',
                cursor: 'pointer',
                transition: 'box-shadow 0.2s, border-color 0.2s, transform 0.2s',
                '&:hover': {
                  borderColor: '#1976d2',
                  boxShadow: '0 5px 16px rgba(25, 118, 210, 0.14)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, flexGrow: 1 }}>
                  Contrato {contract.contractNumber}
                </Typography>
                {canManageContracts && contract.status === 'ACTIVO' && (
                  <Tooltip title="Editar contrato">
                    <IconButton
                      color="primary"
                      aria-label={`Editar contrato ${contract.contractNumber}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        setContractToEdit(contract);
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                )}
                <Chip
                  label={contract.status === 'ACTIVO' ? 'Activo' : 'Finalizado'}
                  color={contract.status === 'ACTIVO' ? 'success' : 'default'}
                  size="small"
                  sx={{ fontWeight: 700 }}
                />
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <CalendarMonthIcon color="action" fontSize="small" />
                <Typography variant="body2">
                  {formatDate(contract.initDate)} — {formatDate(contract.finalDate)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <BusinessIcon color="action" fontSize="small" />
                <Typography variant="body2">
                  {contract.Contractor?.nameContractor || 'Sin contratista'}
                </Typography>
              </Box>
              <Typography sx={{ mt: 1.5, fontWeight: 800, color: '#1769aa' }}>
                Presupuesto: {formatMoney(Number(contract.budget || 0))}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <ComputerIcon color="action" fontSize="small" />
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {contract.ContractSystems?.length || 0} sistemas asociados
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                {contract.ContractSystems?.map((relation) => (
                  <Chip
                    key={relation.idContractSystem}
                    label={relation.System?.name || 'Sistema'}
                    size="small"
                    variant="outlined"
                    sx={{ bgcolor: '#fff' }}
                  />
                ))}
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {canManageContracts && (
        <EditContractDialog
          open={Boolean(contractToEdit)}
          contract={contractToEdit}
          onClose={() => setContractToEdit(null)}
          onUpdate={onUpdateContract}
        />
      )}
    </Box>
  );
}

GridContracts.propTypes = {
  contracts: PropTypes.array,
  onSelectContract: PropTypes.func,
  onUpdateContract: PropTypes.func,
  canManageContracts: PropTypes.bool
};

GridContracts.defaultProps = {
  contracts: [],
  canManageContracts: false
};
