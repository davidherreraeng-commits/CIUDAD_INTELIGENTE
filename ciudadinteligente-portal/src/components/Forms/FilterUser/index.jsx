import { TextField, Grid, Paper, Divider, Typography, Box, MenuItem } from '@mui/material';

import {
  Person as PersonIcon,
  Badge as BadgeIcon,
  Email as EmailIcon,
  AssignmentInd as AssignmentIndIcon
} from '@mui/icons-material';

import PropTypes from "prop-types";
export default function FilterUser ({ filters, handleFilterChange, roles }) {
  return (
    <Box>
      <Paper
        elevation={2}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 3,
          backgroundColor: '#ffffff',
          border: '1px solid #e0e0e0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}
      >
        <Typography
          variant="h6"
          sx={{ mb: 2, fontWeight: 600, color: '#424242' }}
        >
          Filtros de búsqueda
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2} rowSpacing={3} alignItems="center">
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              label="Número de documento"
              variant="outlined"
              size="small"
              value={filters.username || ''}
              onChange={(e) => {
                if (/^\d*$/.test(e.target.value)) {
                  handleFilterChange('username', e.target.value)
                }
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <BadgeIcon sx={{ mr: 1, color: '#757575' }} />
                  )
                }
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4.5 }}>
            <TextField
              fullWidth
              label="Nombres"
              variant="outlined"
              size="small"
              value={filters.name || ''}
              onChange={(e) => handleFilterChange('name', e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <PersonIcon sx={{ mr: 1, color: '#757575' }} />
                  )
                }
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4.5 }}>
            <TextField
              fullWidth
              label="Apellidos"
              variant="outlined"
              size="small"
              value={filters.lastName || ''}
              onChange={(e) => handleFilterChange('lastName', e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <PersonIcon sx={{ mr: 1, color: '#757575' }} />
                  )
                }
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 9 }}>
            <TextField
              fullWidth
              label="Email"
              variant="outlined"
              size="small"
              value={filters.email || ''}
              onChange={(e) => handleFilterChange('email', e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <EmailIcon sx={{ mr: 1, color: '#757575' }} />
                  )
                }
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              select
              fullWidth
              label="Rol"
              value={filters.roleId ?? ''}
              onChange={(e) => handleFilterChange("roleId", e.target.value)}
              sx={{
                '& .MuiInputBase-root': {
                  maxHeight: 40,
                  height: 40
                }
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <AssignmentIndIcon sx={{ mr: 1, color: '#757575' }} />
                  )
                }
              }}
            >
              {roles && roles.length > 0 ? (
                roles.map((r) => (
                  <MenuItem key={r.roleId} value={r.roleId}>
                    {r.name}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>No hay roles disponibles</MenuItem>
              )}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
              <button
                onClick={() => {
                  handleFilterChange('username', null);
                  handleFilterChange('name', null);
                  handleFilterChange('lastName', null);
                  handleFilterChange('email', null);
                  handleFilterChange('roleId', null);
                }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#e0e0e0',
                  color: '#424242',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Limpiar filtros
              </button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  )
}

FilterUser.propTypes = {
    filters: PropTypes.object,
  handleFilterChange: PropTypes.func,
  roles: PropTypes.array,
};
