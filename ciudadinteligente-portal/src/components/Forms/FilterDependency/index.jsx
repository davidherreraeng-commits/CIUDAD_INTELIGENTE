import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from "@mui/material"
import {
  Business as BusinessIcon,
  WorkOutline as WorkOutlineIcon,
  Computer as ComputerIcon,
  PlayCircleOutline as PlayCircleOutlineIcon,
  PauseCircleOutline as PauseCircleOutlineIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  CancelOutlined as CancelOutlinedIcon,
  Close as CloseIcon,
  FilterAltOff as FilterAltOffIcon,
  Search as SearchIcon
} from '@mui/icons-material';

import { projectsGetSystemsSummary } from '../../../api/projects';
import PropTypes from "prop-types";

const STATUS_CARDS = [
  { value: 'En Proceso', label: 'En proceso', dialogLabel: 'en proceso', singularLabel: 'en proceso', subtitle: 'Sistemas activos', color: '#1769d2', bg: '#e8f1ff', icon: PlayCircleOutlineIcon },
  { value: 'Pausado', label: 'Pausado', dialogLabel: 'pausados', singularLabel: 'pausado', subtitle: 'Sistemas pausados', color: '#f08217', bg: '#fff0dd', icon: PauseCircleOutlineIcon },
  { value: 'Terminado', label: 'Terminado', dialogLabel: 'terminados', singularLabel: 'terminado', subtitle: 'Sistemas finalizados', color: '#0aa85a', bg: '#e6f7ed', icon: CheckCircleOutlineIcon },
  { value: 'Cancelado', label: 'Cancelado', dialogLabel: 'cancelados', singularLabel: 'cancelado', subtitle: 'Sistemas cancelados', color: '#d32f2f', bg: '#fdecec', icon: CancelOutlinedIcon }
];

function StatusFilterCard({ status, isActive, onClick }) {
  const Icon = status.icon;

  return (
    <Box
      component="button"
      type="button"
      aria-pressed={isActive}
      onClick={onClick}
      sx={{
        width: '100%',
        minHeight: 112,
        p: 2,
        borderRadius: 2,
        border: `1px solid ${isActive ? status.color : '#e7ebf0'}`,
        backgroundColor: '#fff',
        boxShadow: isActive
          ? `inset 0 0 0 1px ${status.color}, 0 10px 24px rgba(15,23,42,0.12)`
          : '0 3px 12px rgba(15,23,42,0.05)',
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        textAlign: 'left',
        cursor: 'pointer',
        font: 'inherit',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
        '&:hover': {
          transform: 'translateY(-3px)',
          borderColor: status.color,
          boxShadow: '0 10px 24px rgba(15,23,42,0.1)'
        },
        '&:focus-visible': {
          outline: `3px solid ${status.color}33`,
          outlineOffset: 3
        }
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: 2,
          backgroundColor: status.bg,
          color: status.color,
          display: 'grid',
          placeItems: 'center',
          flexShrink: 0
        }}
      >
        <Icon sx={{ fontSize: 29 }} />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontWeight: 850, color: '#172033', lineHeight: 1.2, fontSize: 17 }}>
          {status.label}
        </Typography>
        <Typography sx={{ color: isActive ? status.color : '#5f6b7a', mt: 0.7, fontSize: 14, fontWeight: isActive ? 700 : 400 }}>
          {isActive ? 'Filtro seleccionado' : status.subtitle}
        </Typography>
      </Box>
    </Box>
  );
}

export default function FilterDependency ({ filters, handleFilterChange, projects, onSelectSystem }) {
  
  // 1. ESTADO LOCAL: Aquí guardamos lo que escribes SIN avisarle a la API todavía
  const [localFilters, setLocalFilters] = useState(filters);
  const [summaryDialog, setSummaryDialog] = useState({ open: false, status: null });
  const [summarySystems, setSummarySystems] = useState([]);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState('');
  const [dialogSearch, setDialogSearch] = useState('');
  const [dialogDependency, setDialogDependency] = useState('');
  const [dialogProject, setDialogProject] = useState('');
  const [dialogContract, setDialogContract] = useState('');

  // 2. Si limpiamos los filtros desde la miga de pan, esto borra los campos de texto
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // 3. Manejador para escribir libremente
  const onLocalChange = (field, value) => {
    setLocalFilters(prev => ({ ...prev, [field]: value }));
  };

  const loadSummary = async (nextFilters, status = null) => {
    setSummaryDialog({ open: true, status });
    setSummarySystems([]);
    setSummaryError('');
    setSummaryLoading(true);
    setDialogSearch('');
    setDialogDependency('');
    setDialogProject('');
    setDialogContract('');

    try {
      const response = await projectsGetSystemsSummary({
        name: nextFilters.name || undefined,
        projectsId: nextFilters.projectsId || undefined,
        systemName: nextFilters.systemName || undefined,
        status: status || undefined
      });
      setSummarySystems(response.data.systems || []);
    } catch (error) {
      setSummaryError(error.response?.data?.message || 'No se pudieron consultar los sistemas.');
    } finally {
      setSummaryLoading(false);
    }
  };

  // Los campos se aplican juntos únicamente al buscar.
  const handleSearch = () => {
    handleFilterChange('name', localFilters.name || null);
    handleFilterChange('projectsId', localFilters.projectsId || null);
    handleFilterChange('systemName', localFilters.systemName || null);
    handleFilterChange('contractFilter', null);
    handleFilterChange('status', null);
    setLocalFilters((current) => ({ ...current, status: null }));
    loadSummary(localFilters);
  };

  const handleClear = () => {
    setLocalFilters({
      name: null,
      projectsId: null,
      systemName: null,
      contractFilter: null,
      status: null
    });
    handleFilterChange('name', null);
    handleFilterChange('projectsId', null);
    handleFilterChange('systemName', null);
    handleFilterChange('contractFilter', null);
    handleFilterChange('status', null);
  };

  const handleStatusSelect = (status) => {
    setLocalFilters(prev => ({ ...prev, status }));
    loadSummary(localFilters, status);
  };

  const selectedStatus = STATUS_CARDS.find(item => item.value === summaryDialog.status);
  const SummaryIcon = selectedStatus?.icon || ComputerIcon;
  const summaryColor = selectedStatus?.color || '#1769d2';
  const summaryBackground = selectedStatus?.bg || '#e8f1ff';

  const dependencyOptions = useMemo(() => Array.from(
    new Map(summarySystems.map(system => [system.dependencyId, {
      id: system.dependencyId,
      name: system.dependencyName
    }])).values()
  ).sort((a, b) => a.name.localeCompare(b.name, 'es')), [summarySystems]);

  const projectOptions = useMemo(() => Array.from(
    new Map(summarySystems.map(system => [system.projectsId, {
      id: system.projectsId,
      name: system.projectName
    }])).values()
  ).sort((a, b) => a.name.localeCompare(b.name, 'es')), [summarySystems]);

  const dialogContractOptions = useMemo(() => {
    const contractsByNumber = new Map();

    summarySystems
      .filter(system => system.idContract && system.contractNumber)
      .forEach((system) => {
        const normalizedNumber = system.contractNumber.trim().toLocaleLowerCase('es');
        const current = contractsByNumber.get(normalizedNumber);

        if (!current) {
          contractsByNumber.set(normalizedNumber, {
            number: system.contractNumber.trim(),
            status: system.contractStatus
          });
        } else if (current.status !== system.contractStatus) {
          current.status = 'MIXTO';
        }
      });

    return Array.from(contractsByNumber.values())
      .sort((a, b) => a.number.localeCompare(b.number, 'es'));
  }, [summarySystems]);

  const filteredSummarySystems = useMemo(() => {
    const search = dialogSearch.trim().toLocaleLowerCase('es');
    return summarySystems.filter(system => (
      (!search || system.systemName.toLocaleLowerCase('es').includes(search))
      && (!dialogDependency || String(system.dependencyId) === String(dialogDependency))
      && (!dialogProject || String(system.projectsId) === String(dialogProject))
      && (!dialogContract || (
        dialogContract === 'WITHOUT_CONTRACT'
          ? !system.idContract
          : system.contractNumber?.trim().toLocaleLowerCase('es')
            === String(dialogContract).trim().toLocaleLowerCase('es')
      ))
    ));
  }, [dialogContract, dialogDependency, dialogProject, dialogSearch, summarySystems]);

  const handleOpenSystem = (system) => {
    setSummaryDialog(prev => ({ ...prev, open: false }));
    onSelectSystem(system);
  };

  const handleCloseSummaryDialog = () => {
    setSummaryDialog({ open: false, status: null });
    setLocalFilters(prev => ({ ...prev, status: null }));
  };

  const handleClearDialogFilters = () => {
    setDialogSearch('');
    setDialogDependency('');
    setDialogProject('');
    setDialogContract('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

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
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#424242' }}>
        Filtros de búsqueda
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <Typography sx={{ mb: 1.5, fontWeight: 700, color: '#172033' }}>
        Selecciona un estado
      </Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {STATUS_CARDS.map((status) => (
          <Grid key={status.value} size={{ xs: 12, sm: 6, md: 3 }} sx={{ display: 'flex' }}>
            <StatusFilterCard
              status={status}
              isActive={localFilters.status === status.value}
              onClick={() => handleStatusSelect(status.value)}
            />
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ mb: 2 }} />
      <Grid container spacing={2} rowSpacing={3} alignItems="center">
        
        {/* Filtro Secretaría */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            fullWidth
            label="Nombre de la secretaría"
            variant="outlined"
            size="small"
            value={localFilters.name || ''}
            onChange={(e) => onLocalChange('name', e.target.value)}
            onKeyDown={handleKeyDown}
            slotProps={{ input: { startAdornment: <BusinessIcon sx={{ mr: 1, color: '#757575' }} /> } }}
          />
        </Grid>

        {/* Filtro Proyecto */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            select
            fullWidth
            label="Proyecto"
            size="small"
            value={localFilters.projectsId ?? ''}
            onChange={(e) => onLocalChange('projectsId', e.target.value)}
            slotProps={{ input: { startAdornment: <WorkOutlineIcon sx={{ mr: 1, color: '#757575' }} /> } }}
          >
            <MenuItem value="">Todos los proyectos</MenuItem>
            {projects?.map((project) => (
              <MenuItem key={project.projectsId} value={project.projectsId}>
                {project.name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Filtro Sistema */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            fullWidth
            label="Sistema o aplicación"
            variant="outlined"
            size="small"
            value={localFilters.systemName || ''}
            onChange={(e) => onLocalChange('systemName', e.target.value)}
            onKeyDown={handleKeyDown}
            slotProps={{ input: { startAdornment: <ComputerIcon sx={{ mr: 1, color: '#757575' }} /> } }}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 1 }}>
            <Button
              variant="outlined"
              color="inherit"
              onClick={handleClear}
              sx={{ textTransform: 'none', color: '#424242', borderColor: '#e0e0e0' }}
            >
              Limpiar filtros
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSearch}
              startIcon={<SearchIcon />}
              sx={{ textTransform: 'none' }}
            >
              Buscar
            </Button>
          </Box>
        </Grid>
      </Grid>

      <Dialog
        open={summaryDialog.open}
        onClose={handleCloseSummaryDialog}
        maxWidth="lg"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, minHeight: '76vh', maxHeight: '92vh' } } }}
      >
        <DialogTitle sx={{ px: { xs: 2.5, md: 4 }, pt: 3.5, pb: 0.5, pr: 8, fontSize: 30, fontWeight: 900, color: '#172033' }}>
          {selectedStatus ? `Sistemas ${selectedStatus.dialogLabel}` : 'Resultados de búsqueda'}
          <IconButton
            aria-label="Cerrar"
            onClick={handleCloseSummaryDialog}
            sx={{ position: 'absolute', right: 22, top: 22 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ px: { xs: 2.5, md: 4 }, pb: 4 }}>
          <Typography sx={{ color: '#5f6b7a', mb: 3, fontSize: 17 }}>
            Cada fila corresponde al sistema dentro de un contrato específico o a un sistema sin contrato.
          </Typography>

          {summaryLoading && (
            <Box sx={{ minHeight: 360, display: 'grid', placeItems: 'center' }}>
              <CircularProgress />
            </Box>
          )}

          {!summaryLoading && summaryError && <Alert severity="error">{summaryError}</Alert>}

          {!summaryLoading && !summaryError && (
            <>
              <Box
                sx={{
                  width: 'fit-content',
                  minWidth: 260,
                  p: 2,
                  mb: 3,
                  borderRadius: 2,
                  backgroundColor: summaryBackground,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5
                }}
              >
                <Box sx={{ width: 48, height: 48, borderRadius: '50%', display: 'grid', placeItems: 'center', color: summaryColor, backgroundColor: '#ffffff99' }}>
                  <SummaryIcon sx={{ fontSize: 31 }} />
                </Box>
                <Typography sx={{ fontSize: 30, fontWeight: 900, color: summaryColor }}>
                  {summarySystems.length}
                </Typography>
                <Typography sx={{ fontSize: 17, fontWeight: 800, color: '#172033' }}>
                  {selectedStatus
                    ? summarySystems.length === 1
                      ? `sistema ${selectedStatus.singularLabel}`
                      : `sistemas ${selectedStatus.dialogLabel}`
                    : summarySystems.length === 1 ? 'resultado' : 'resultados'}
                </Typography>
              </Box>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    fullWidth
                    label="Buscar por sistema"
                    placeholder="Escribe el nombre del sistema..."
                    value={dialogSearch}
                    onChange={(event) => setDialogSearch(event.target.value)}
                    slotProps={{ input: { startAdornment: <SearchIcon sx={{ mr: 1, color: '#757575' }} /> } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <TextField
                    select
                    fullWidth
                    label="Secretaría"
                    value={dialogDependency}
                    onChange={(event) => setDialogDependency(event.target.value)}
                  >
                    <MenuItem value="">Todas</MenuItem>
                    {dependencyOptions.map(dependency => (
                      <MenuItem key={dependency.id} value={dependency.id}>{dependency.name}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <TextField
                    select
                    fullWidth
                    label="Proyecto"
                    value={dialogProject}
                    onChange={(event) => setDialogProject(event.target.value)}
                  >
                    <MenuItem value="">Todos</MenuItem>
                    {projectOptions.map(project => (
                      <MenuItem key={project.id} value={project.id}>{project.name}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <TextField
                    select
                    fullWidth
                    label="Contrato"
                    value={dialogContract}
                    onChange={(event) => setDialogContract(event.target.value)}
                  >
                    <MenuItem value="">Todos</MenuItem>
                    {summarySystems.some(system => !system.idContract) && (
                      <MenuItem value="WITHOUT_CONTRACT">Sin contrato</MenuItem>
                    )}
                    {dialogContractOptions.map(contract => (
                      <MenuItem key={contract.number} value={contract.number}>
                        {contract.number} · {contract.status === 'ACTIVO'
                          ? 'Activo'
                          : contract.status === 'FINALIZADO' ? 'Finalizado' : 'Varios estados'}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="outlined"
                      color="inherit"
                      startIcon={<FilterAltOffIcon />}
                      onClick={handleClearDialogFilters}
                      disabled={!dialogSearch && !dialogDependency && !dialogProject && !dialogContract}
                      sx={{
                        textTransform: 'none',
                        color: '#424242',
                        borderColor: '#d8dee8',
                        fontWeight: 700
                      }}
                    >
                      Limpiar filtros
                    </Button>
                  </Box>
                </Grid>
              </Grid>

              {summarySystems.length === 0 && (
                <Alert severity="info">No hay sistemas que coincidan con los filtros seleccionados.</Alert>
              )}

              {summarySystems.length > 0 && filteredSummarySystems.length === 0 && (
                <Alert severity="info">No hay sistemas que coincidan con los filtros seleccionados.</Alert>
              )}

              {filteredSummarySystems.length > 0 && (
                <TableContainer sx={{ border: '1px solid #e7ebf0', borderRadius: 2, minHeight: 280 }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 850, color: '#5f6b7a', backgroundColor: '#fff' }}>Sistema</TableCell>
                        <TableCell sx={{ fontWeight: 850, color: '#5f6b7a', backgroundColor: '#fff' }}>Secretaría</TableCell>
                        <TableCell sx={{ fontWeight: 850, color: '#5f6b7a', backgroundColor: '#fff' }}>Proyecto</TableCell>
                        <TableCell sx={{ fontWeight: 850, color: '#5f6b7a', backgroundColor: '#fff' }}>Contrato</TableCell>
                        <TableCell sx={{ fontWeight: 850, color: '#5f6b7a', backgroundColor: '#fff' }}>Estado contrato</TableCell>
                        <TableCell sx={{ fontWeight: 850, color: '#5f6b7a', backgroundColor: '#fff' }}>Estado sistema</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredSummarySystems.map((system) => {
                        const rowStatus = STATUS_CARDS.find(item => item.value === system.status);
                        return (
                          <TableRow
                          key={`${system.systemsId}-${system.idContractSystem || 'without-contract'}`}
                          hover
                          role="button"
                          tabIndex={0}
                          onClick={() => handleOpenSystem(system)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') handleOpenSystem(system);
                          }}
                          sx={{ cursor: 'pointer', '&:last-child td': { borderBottom: 0 } }}
                        >
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                              <Box sx={{ width: 34, height: 34, borderRadius: '50%', color: rowStatus?.color || summaryColor, backgroundColor: rowStatus?.bg || summaryBackground, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                                <SummaryIcon sx={{ fontSize: 22 }} />
                              </Box>
                              <Typography sx={{ fontWeight: 800, color: '#172033' }}>{system.systemName}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>{system.dependencyName}</TableCell>
                          <TableCell>{system.projectName}</TableCell>
                          <TableCell>
                            <Typography sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                              {system.contractNumber || 'Sin contrato'}
                            </Typography>
                            {system.contractorName && (
                              <Typography variant="body2" color="text.secondary" noWrap>
                                {system.contractorName}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            {system.contractStatus ? (
                              <Chip
                                label={system.contractStatus === 'ACTIVO' ? 'Activo' : 'Finalizado'}
                                size="small"
                                color={system.contractStatus === 'ACTIVO' ? 'success' : 'default'}
                                sx={{ fontWeight: 800 }}
                              />
                            ) : '—'}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={system.status}
                              size="small"
                              sx={{
                                fontWeight: 800,
                                color: rowStatus?.color || summaryColor,
                                backgroundColor: rowStatus?.bg || summaryBackground
                              }}
                            />
                          </TableCell>
                        </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </Paper>
  )
}

FilterDependency.propTypes = {
    filters: PropTypes.object,
    handleFilterChange: PropTypes.func,
    projects: PropTypes.array,
    onSelectSystem: PropTypes.func.isRequired,
};

StatusFilterCard.propTypes = {
  status: PropTypes.shape({
    value: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    dialogLabel: PropTypes.string.isRequired,
    singularLabel: PropTypes.string.isRequired,
    subtitle: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
    bg: PropTypes.string.isRequired,
    icon: PropTypes.elementType.isRequired
  }).isRequired,
  isActive: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired
};
