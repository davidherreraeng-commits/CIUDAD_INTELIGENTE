import { Box, Button, Chip, Divider, Paper, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BusinessIcon from '@mui/icons-material/Business';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ComputerIcon from '@mui/icons-material/Computer';
import PropTypes from 'prop-types';

import { formatMoney } from '../../../utils/formatMoney';

const formatDate = (value) => {
  if (!value) return 'Sin definir';
  return new Intl.DateTimeFormat('es-CO', { timeZone: 'UTC' }).format(new Date(value));
};

export function ContractHeaderInfo({ contract, onBack }) {
  return (
    <Paper
      elevation={2}
      sx={{
        p: { xs: 2.5, sm: 3 },
        mb: 2.5,
        borderRadius: 3,
        border: '1px solid #e0e0e0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
      }}
    >
      <Button startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ mb: 2 }}>
        Volver a contratos
      </Button>

      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, flexGrow: 1 }}>
          Contrato {contract.contractNumber}
        </Typography>
        <Chip
          label={contract.status === 'ACTIVO' ? 'Activo' : 'Finalizado'}
          color={contract.status === 'ACTIVO' ? 'success' : 'default'}
          sx={{ fontWeight: 700 }}
        />
      </Box>

      <Divider sx={{ my: 2.5 }} />

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CalendarMonthIcon color="primary" />
          <Box>
            <Typography variant="caption" color="text.secondary">Vigencia</Typography>
            <Typography>{formatDate(contract.initDate)} — {formatDate(contract.finalDate)}</Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BusinessIcon color="primary" />
          <Box>
            <Typography variant="caption" color="text.secondary">Contratista</Typography>
            <Typography>{contract.Contractor?.nameContractor || 'Sin contratista'}</Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ComputerIcon color="primary" />
          <Box>
            <Typography variant="caption" color="text.secondary">Sistemas asociados</Typography>
            <Typography>{contract.ContractSystems?.length || 0}</Typography>
          </Box>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">Presupuesto</Typography>
          <Typography sx={{ fontWeight: 800, color: '#1769aa' }}>
            {formatMoney(Number(contract.budget || 0))}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}

ContractHeaderInfo.propTypes = {
  contract: PropTypes.object.isRequired,
  onBack: PropTypes.func.isRequired
};
