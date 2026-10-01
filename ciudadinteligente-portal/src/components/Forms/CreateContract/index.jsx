import { useEffect, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  InputAdornment,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography
} from '@mui/material';
import AddBusinessIcon from '@mui/icons-material/AddBusiness';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import ComputerIcon from '@mui/icons-material/Computer';
import HistoryIcon from '@mui/icons-material/History';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import PropTypes from 'prop-types';
import { projectsGetContractCatalog } from '../../../api/projects';
import { formatMoney } from '../../../utils/formatMoney';

const INITIAL_FORM = {
  contractNumber: '',
  contractor: '',
  initDate: '',
  finalDate: '',
  budget: 0,
  status: 'ACTIVO'
};

export function CreateContractDialog({
  open,
  onClose,
  projectName,
  projectRelationId,
  projectBudget,
  projectInitDate,
  projectFinalDate,
  systems,
  existingContracts,
  onCreate,
  onReuse
}) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [showSummary, setShowSummary] = useState(false);
  const [showSystems, setShowSystems] = useState(false);
  const [systemSearch, setSystemSearch] = useState('');
  const [selectedSystemIds, setSelectedSystemIds] = useState([]);
  const [transferModes, setTransferModes] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [contractCatalog, setContractCatalog] = useState({
    contracts: [],
    contractors: []
  });
  const [selectedExistingContract, setSelectedExistingContract] = useState(null);
  const [referencedCatalogContract, setReferencedCatalogContract] = useState(null);
  const [contractOptionsOpen, setContractOptionsOpen] = useState(false);
  const isFirstProjectContract = existingContracts.length === 0;
  const firstProjectContractId = existingContracts.reduce((firstId, contract) => (
    firstId === null || Number(contract.idContract) < firstId
      ? Number(contract.idContract)
      : firstId
  ), null);
  const initialContractBudget = Number(projectBudget || 0);
  const hasLegacyContractData = isFirstProjectContract && Boolean(
    projectInitDate || projectFinalDate || initialContractBudget > 0
  );

  useEffect(() => {
    if (!open) return;
    setForm({
      ...INITIAL_FORM,
      initDate: hasLegacyContractData ? projectInitDate?.substring(0, 10) || '' : '',
      finalDate: hasLegacyContractData ? projectFinalDate?.substring(0, 10) || '' : '',
      budget: initialContractBudget
    });
    setSelectedExistingContract(null);
    setReferencedCatalogContract(null);
    setContractOptionsOpen(false);
  }, [open, hasLegacyContractData, projectInitDate, projectFinalDate, initialContractBudget]);

  useEffect(() => {
    if (!open) return undefined;

    let active = true;
    setContractCatalog({
      contracts: existingContracts,
      contractors: [
        ...new Map(
          existingContracts
            .filter((contract) => contract.Contractor?.nameContractor)
            .map((contract) => [
              contract.Contractor.nameContractor.trim().toLocaleLowerCase('es'),
              contract.Contractor
            ])
        ).values()
      ]
    });

    projectsGetContractCatalog()
      .then((response) => {
        if (!active) return;
        setContractCatalog({
          contracts: response.data?.contracts?.length
            ? response.data.contracts
            : existingContracts,
          contractors: response.data?.contractors?.length
            ? response.data.contractors
            : [
              ...new Map(
                existingContracts
                  .filter((contract) => contract.Contractor?.nameContractor)
                  .map((contract) => [
                    contract.Contractor.nameContractor.trim().toLocaleLowerCase('es'),
                    contract.Contractor
                  ])
              ).values()
            ]
        });
      })
      .catch(() => {
        if (!active) return;
        setContractCatalog((current) => ({
          ...current,
          contracts: existingContracts
        }));
      });

    return () => {
      active = false;
    };
  }, [open, existingContracts]);

  const contractNumberOptions = [...new Set(contractCatalog.contracts.map(
    (contract) => contract.contractNumber
  ))];
  const contractorOptions = contractCatalog.contractors.map(
    (contractor) => contractor.nameContractor
  );
  const findCatalogContracts = (contractNumber) => {
    const normalizedNumber = contractNumber.trim().toLocaleLowerCase('es');
    if (!normalizedNumber) return [];
    return contractCatalog.contracts.filter(
      (contract) => contract.contractNumber.trim().toLocaleLowerCase('es') === normalizedNumber
    );
  };

  const activeContractSystemIds = new Set(
    contractCatalog.contracts
      .filter((contract) => contract.status === 'ACTIVO')
      .flatMap((contract) => contract.ContractSystems || [])
      .map((relation) => relation.systemId)
  );
  const availableSystems = systems.filter(
    (system) => !activeContractSystemIds.has(system.systemsId)
  );
  const selectedContractBelongsToProject = !selectedExistingContract || (
    Number(selectedExistingContract.idRelation) === Number(projectRelationId)
  );

  const hasInvalidDates = Boolean(
    form.initDate && form.finalDate && form.finalDate < form.initDate
  );

  const isComplete = selectedExistingContract
    ? selectedExistingContract.status === 'ACTIVO' && selectedContractBelongsToProject
    : Boolean(
      form.contractNumber.trim() &&
      form.contractor.trim() &&
      form.initDate &&
      form.finalDate &&
      Number.isSafeInteger(Number(form.budget)) &&
      Number(form.budget) >= 0 &&
      !hasInvalidDates
    );

  const updateContractNumber = (value) => {
    const matchingContracts = findCatalogContracts(value);
    const existingContract = matchingContracts.find(
      (contract) => Number(contract.idRelation) === Number(projectRelationId)
    ) || null;
    const catalogReference = existingContract || matchingContracts[0] || null;
    setSelectedExistingContract(existingContract);
    setReferencedCatalogContract(catalogReference);

    if (existingContract) {
      setForm({
        contractNumber: existingContract.contractNumber,
        contractor: existingContract.Contractor?.nameContractor || '',
        initDate: existingContract.initDate?.substring(0, 10) || '',
        finalDate: existingContract.finalDate?.substring(0, 10) || '',
        budget: Number(existingContract.budget || 0),
        status: existingContract.status
      });
      return;
    }

    setForm((current) => ({
      ...(selectedExistingContract
        ? {
          ...INITIAL_FORM,
          initDate: hasLegacyContractData ? projectInitDate?.substring(0, 10) || '' : '',
          finalDate: hasLegacyContractData ? projectFinalDate?.substring(0, 10) || '' : '',
          budget: initialContractBudget
        }
        : current),
      contractNumber: value,
      ...(catalogReference?.Contractor?.nameContractor && {
        contractor: catalogReference.Contractor.nameContractor
      })
    }));
  };

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const updateBudget = (event) => {
    const rawValue = event.target.value.replace(/\D/g, '');
    setForm((current) => ({
      ...current,
      budget: rawValue ? Number(rawValue) : 0
    }));
  };

  const handleClose = () => {
    setForm(INITIAL_FORM);
    setShowSummary(false);
    setShowSystems(false);
    setSystemSearch('');
    setSelectedSystemIds([]);
    setTransferModes({});
    setSubmitting(false);
    setSelectedExistingContract(null);
    setReferencedCatalogContract(null);
    setContractOptionsOpen(false);
    onClose();
  };

  const handleContinue = (event) => {
    event.preventDefault();
    if (isComplete) setShowSummary(true);
  };

  const filteredSystems = availableSystems.filter((system) =>
    (system.name || '').toLocaleLowerCase('es').includes(systemSearch.trim().toLocaleLowerCase('es'))
  );

  const canMigrateExistingInformation = (system) => {
    const targetIsFirstProjectContract = selectedExistingContract
      ? Number(selectedExistingContract.idContract) === firstProjectContractId
      : isFirstProjectContract;

    if (!targetIsFirstProjectContract) return false;

    if (system.hasContractHistory === undefined && system.hasUnassignedProgress === undefined) {
      return true;
    }

    return system.hasContractHistory === false && system.hasUnassignedProgress === true;
  };

  const initialTransferMode = (system) => (
    canMigrateExistingInformation(system) ? 'WITH_HISTORY' : 'WITHOUT_HISTORY'
  );

  const toggleSystem = (system) => {
    const systemsId = system.systemsId;
    setSelectedSystemIds((current) => {
      if (current.includes(systemsId)) {
        setTransferModes((modes) => {
          const nextModes = { ...modes };
          delete nextModes[systemsId];
          return nextModes;
        });
        return current.filter((id) => id !== systemsId);
      }

      setTransferModes((modes) => ({ ...modes, [systemsId]: initialTransferMode(system) }));
      return [...current, systemsId];
    });
  };

  const selectAllVisible = () => {
    const visibleIds = filteredSystems.map((system) => system.systemsId);
    const allVisibleSelected = visibleIds.every((id) => selectedSystemIds.includes(id));

    setSelectedSystemIds((current) => {
      if (allVisibleSelected) {
        setTransferModes((modes) => {
          const nextModes = { ...modes };
          visibleIds.forEach((id) => delete nextModes[id]);
          return nextModes;
        });
        return current.filter((id) => !visibleIds.includes(id));
      }

      setTransferModes((modes) => {
        const nextModes = { ...modes };
        filteredSystems.forEach((system) => {
          if (!nextModes[system.systemsId]) {
            nextModes[system.systemsId] = initialTransferMode(system);
          }
        });
        return nextModes;
      });
      return [...new Set([...current, ...visibleIds])];
    });
  };

  const changeTransferMode = (systemsId, mode) => {
    if (!mode) return;
    setTransferModes((current) => ({ ...current, [systemsId]: mode }));
  };

  const statusLabel = (status) => ({
    EN_PROCESO: 'En proceso',
    PAUSADO: 'Pausado',
    TERMINADO: 'Terminado',
    CANCELADO: 'Cancelado'
  }[status] || status || 'En proceso');

  const handleCreate = async () => {
    if (!selectedSystemIds.length || submitting) return;

    setSubmitting(true);
    const selectedSystems = selectedSystemIds.map((systemsId) => ({
      systemsId,
      includeHistory: transferModes[systemsId] === 'WITH_HISTORY'
    }));
    const created = selectedExistingContract
      ? await onReuse({
        idContract: selectedExistingContract.idContract,
        systems: selectedSystems
      })
      : await onCreate({ ...form, systems: selectedSystems });
    setSubmitting(false);

    if (created) handleClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3 } } }}
    >
      <DialogTitle
        sx={{
          py: 2.5,
          px: { xs: 2.5, sm: 3.5 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          color: '#fff',
          bgcolor: '#1976d2'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <AddBusinessIcon />
          <Box>
            <Typography variant="h6" component="div" sx={{ fontWeight: 800 }}>
              Crear nuevo contrato
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.82)' }}>
              Proyecto: {projectName || 'Sin nombre'}
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={handleClose}
          aria-label="Cerrar"
          sx={{
            color: '#fff',
            bgcolor: 'rgba(255,255,255,0.14)',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.24)' }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {!showSummary && !showSystems ? (
        <Box component="form" onSubmit={handleContinue}>
          <DialogContent sx={{ p: { xs: 2.5, sm: 4 } }}>
            <Typography
              variant="subtitle2"
              sx={{ mb: 2.5, fontWeight: 800, color: '#1976d2', textTransform: 'uppercase' }}
            >
              Información general del contrato
            </Typography>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Autocomplete
                  freeSolo
                  autoSelect
                  selectOnFocus
                  open={contractOptionsOpen}
                  onOpen={() => setContractOptionsOpen(true)}
                  onClose={() => setContractOptionsOpen(false)}
                  options={contractNumberOptions}
                  noOptionsText="No hay contratos registrados"
                  inputValue={form.contractNumber}
                  onInputChange={(_, value, reason) => {
                    updateContractNumber(value);
                    if (reason === 'input') setContractOptionsOpen(true);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Número del contrato"
                      placeholder="Busca o escribe un número nuevo"
                      onClick={() => setContractOptionsOpen(true)}
                      helperText={selectedExistingContract
                        ? selectedContractBelongsToProject
                          ? 'Usarás el contrato existente sin crear un registro duplicado'
                          : 'Este contrato está registrado en otra secretaría o proyecto'
                        : referencedCatalogContract
                          ? 'Número encontrado. Puedes usarlo para crear el contrato en este proyecto'
                        : 'Selecciona uno existente o escribe un número nuevo'}
                      required
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Autocomplete
                  freeSolo
                  autoSelect
                  options={contractorOptions}
                  inputValue={form.contractor}
                  disabled={Boolean(selectedExistingContract)}
                  onInputChange={(_, value) => {
                    setForm((current) => ({ ...current, contractor: value }));
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Contratista"
                      placeholder="Busca o escribe un contratista nuevo"
                      helperText="Selecciona uno existente o escribe uno nuevo"
                      required
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Fecha de inicio"
                  type="date"
                  value={form.initDate}
                  disabled={Boolean(selectedExistingContract)}
                  onChange={updateField('initDate')}
                  helperText={hasLegacyContractData ? 'Puedes modificar la fecha existente' : ' '}
                  fullWidth
                  required
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Fecha de finalización"
                  type="date"
                  value={form.finalDate}
                  disabled={Boolean(selectedExistingContract)}
                  onChange={updateField('finalDate')}
                  error={hasInvalidDates}
                  helperText={hasInvalidDates
                    ? 'Debe ser posterior a la fecha de inicio'
                    : hasLegacyContractData
                      ? 'Puedes modificar la fecha existente'
                      : ' '}
                  fullWidth
                  required
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select
                  label="Estado del contrato"
                  value={form.status}
                  disabled={Boolean(selectedExistingContract)}
                  onChange={updateField('status')}
                  fullWidth
                >
                  <MenuItem value="ACTIVO">Activo</MenuItem>
                  <MenuItem value="FINALIZADO">Finalizado</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Presupuesto del contrato"
                  value={formatMoney(form.budget)}
                  disabled={Boolean(selectedExistingContract)}
                  onChange={updateBudget}
                  fullWidth
                  required
                  helperText="Puedes modificar el valor antes de continuar"
                />
              </Grid>
            </Grid>

            <Alert
              severity={
                selectedExistingContract?.status === 'FINALIZADO' || !selectedContractBelongsToProject
                  ? 'warning'
                  : 'info'
              }
              sx={{ mt: 3 }}
            >
              {selectedExistingContract
                ? !selectedContractBelongsToProject
                  ? 'El número existe, pero pertenece a otra secretaría o proyecto y no puede recibir los sistemas de esta vista.'
                  : selectedExistingContract.status === 'ACTIVO'
                  ? `Seleccionaste el contrato ${selectedExistingContract.contractNumber}. Los sistemas se asociarán a este contrato sin duplicarlo.`
                  : 'Este contrato está finalizado y no admite nuevos sistemas.'
                : isFirstProjectContract
                  ? 'Tomamos como referencia las fechas y el presupuesto actuales del proyecto. Puedes ajustar ambos valores antes de continuar.'
                  : 'El presupuesto inicia en $0, pero puedes definirlo antes de continuar.'}
            </Alert>
          </DialogContent>
          <DialogActions sx={{ p: 3, bgcolor: '#f8f9fa', gap: 1 }}>
            <Button onClick={handleClose} color="inherit" sx={{ fontWeight: 700 }}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={!isComplete}
              sx={{ px: 4, borderRadius: 2, fontWeight: 700 }}
            >
              Continuar
            </Button>
          </DialogActions>
        </Box>
      ) : showSummary && !showSystems ? (
        <>
          <DialogContent sx={{ p: { xs: 2.5, sm: 4 } }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#172033', mb: 1 }}>
              Revisa la información del contrato
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Esta vista es el paso previo a seleccionar los sistemas que se asociarán.
            </Typography>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, bgcolor: '#fbfdff' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  Contrato {form.contractNumber}
                </Typography>
                <Chip
                  label={form.status === 'ACTIVO' ? 'Activo' : 'Finalizado'}
                  color={form.status === 'ACTIVO' ? 'success' : 'default'}
                  size="small"
                  sx={{ fontWeight: 700 }}
                />
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">Proyecto</Typography>
                  <Typography sx={{ fontWeight: 700 }}>{projectName || 'Sin nombre'}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">Contratista</Typography>
                  <Typography sx={{ fontWeight: 700 }}>{form.contractor}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">Fecha de inicio</Typography>
                  <Typography sx={{ fontWeight: 700 }}>{form.initDate}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">Fecha de finalización</Typography>
                  <Typography sx={{ fontWeight: 700 }}>{form.finalDate}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">Presupuesto inicial del contrato</Typography>
                  <Typography sx={{ fontWeight: 700 }}>{formatMoney(form.budget)}</Typography>
                </Grid>
              </Grid>
            </Paper>
          </DialogContent>
          <DialogActions sx={{ p: 3, bgcolor: '#f8f9fa', gap: 1 }}>
            <Button onClick={() => setShowSummary(false)} color="inherit" sx={{ fontWeight: 700 }}>
              Volver a editar
            </Button>
            <Button
              variant="contained"
              onClick={() => setShowSystems(true)}
              sx={{ px: 4, borderRadius: 2, fontWeight: 700 }}
            >
              Asociar sistemas
            </Button>
          </DialogActions>
        </>
      ) : (
        <>
          <DialogContent sx={{ p: { xs: 2.5, sm: 4 } }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'stretch', sm: 'center' },
                justifyContent: 'space-between',
                gap: 2,
                mb: 2.5
              }}
            >
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#172033' }}>
                  Selecciona los sistemas del contrato
                </Typography>
                <Typography color="text.secondary">
                  {selectedExistingContract
                    ? `Se asociarán al contrato existente ${selectedExistingContract.contractNumber}.`
                    : 'Los sistemas no seleccionados permanecerán fuera de este contrato.'}
                </Typography>
              </Box>
              <Chip
                label={`${selectedSystemIds.length} seleccionados`}
                color={selectedSystemIds.length ? 'primary' : 'default'}
                sx={{ alignSelf: { xs: 'flex-start', sm: 'center' }, fontWeight: 700 }}
              />
            </Box>

            <Alert severity="info" sx={{ mb: 2.5 }}>
              {(selectedExistingContract
                ? Number(selectedExistingContract.idContract) === firstProjectContractId
                : isFirstProjectContract)
                ? 'En el primer contrato del proyecto puedes incluir la información existente de los sistemas.'
                : 'Los sistemas de este contrato comienzan En proceso, sin avances ni evidencias de contratos anteriores.'}
            </Alert>

            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 1.5,
                mb: 2
              }}
            >
              <TextField
                value={systemSearch}
                onChange={(event) => setSystemSearch(event.target.value)}
                placeholder="Buscar sistema..."
                size="small"
                fullWidth
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    )
                  }
                }}
              />
              <Button
                variant="outlined"
                onClick={selectAllVisible}
                disabled={!filteredSystems.length}
                sx={{ whiteSpace: 'nowrap' }}
              >
                {filteredSystems.length && filteredSystems.every((system) => selectedSystemIds.includes(system.systemsId))
                  ? 'Quitar selección'
                  : 'Seleccionar todos'}
              </Button>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, maxHeight: 360, overflowY: 'auto', pr: 0.5 }}>
              {!filteredSystems.length && (
                <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
                  <Typography color="text.secondary">
                    No se encontraron sistemas con ese nombre.
                  </Typography>
                </Paper>
              )}

              {filteredSystems.map((system) => {
                const selected = selectedSystemIds.includes(system.systemsId);
                const canMigrateHistory = canMigrateExistingInformation(system);
                return (
                  <Paper
                    key={system.systemsId}
                    variant="outlined"
                    sx={{
                      borderRadius: 2.5,
                      borderWidth: selected ? 2 : 1,
                      borderColor: selected ? '#1976d2' : '#dfe5eb',
                      bgcolor: selected ? '#f4f8ff' : '#fff',
                      transition: '0.15s ease',
                      '&:hover': { borderColor: '#90b8ff', bgcolor: '#f8fbff' }
                    }}
                  >
                    <Box
                      onClick={() => toggleSystem(system)}
                      sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }}
                    >
                      <Checkbox
                        checked={selected}
                        onChange={() => toggleSystem(system)}
                        onClick={(event) => event.stopPropagation()}
                        inputProps={{ 'aria-label': `Seleccionar ${system.name}` }}
                      />
                      <Box
                        sx={{
                          width: 42,
                          height: 42,
                          borderRadius: 2,
                          bgcolor: selected ? '#dceaff' : '#eef2f6',
                          color: selected ? '#1976d2' : '#607080',
                          display: 'grid',
                          placeItems: 'center',
                          flexShrink: 0
                        }}
                      >
                        <ComputerIcon />
                      </Box>
                      <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                          <Typography sx={{ fontWeight: 800 }} noWrap>
                            {system.name}
                          </Typography>
                          {canMigrateHistory && (
                            <Chip
                              label="Información existente"
                              size="small"
                              color="warning"
                              variant="outlined"
                              sx={{ fontWeight: 700 }}
                            />
                          )}
                        </Box>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {system.description || 'Sin descripción'}
                        </Typography>
                      </Box>
                      <Chip label={statusLabel(system.status)} size="small" variant="outlined" />
                    </Box>

                    {selected && canMigrateHistory && (
                      <Box sx={{ px: 2, pb: 2 }}>
                        <Divider sx={{ mb: 2 }} />
                        <Typography sx={{ fontWeight: 800, mb: 1.25 }}>
                          ¿Deseas incluir el historial actual en este contrato?
                        </Typography>
                        <ToggleButtonGroup
                          exclusive
                          value={transferModes[system.systemsId] || 'WITHOUT_HISTORY'}
                          onChange={(_, mode) => changeTransferMode(system.systemsId, mode)}
                          fullWidth
                          sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                            gap: 1.5,
                            '& .MuiToggleButtonGroup-grouped': {
                              m: 0,
                              border: '1px solid #d8e0e8 !important',
                              borderRadius: '10px !important'
                            }
                          }}
                        >
                          <ToggleButton
                            value="WITH_HISTORY"
                            sx={{
                              p: 2,
                              justifyContent: 'flex-start',
                              alignItems: 'flex-start',
                              gap: 1.25,
                              textAlign: 'left',
                              textTransform: 'none',
                              '&.Mui-selected': { bgcolor: '#e8f5e9', borderColor: '#4caf50 !important' }
                            }}
                          >
                            <HistoryIcon color="success" />
                            <Box>
                              <Typography sx={{ fontWeight: 800 }}>Incluir historial existente</Typography>
                              <Typography variant="body2" color="text.secondary">
                                Este contrato incluirá los avances y evidencias actuales del sistema.
                              </Typography>
                            </Box>
                          </ToggleButton>
                          <ToggleButton
                            value="WITHOUT_HISTORY"
                            sx={{
                              p: 2,
                              justifyContent: 'flex-start',
                              alignItems: 'flex-start',
                              gap: 1.25,
                              textAlign: 'left',
                              textTransform: 'none',
                              '&.Mui-selected': { bgcolor: '#eaf3ff', borderColor: '#1976d2 !important' }
                            }}
                          >
                            <RestartAltIcon color="primary" />
                            <Box>
                              <Typography sx={{ fontWeight: 800 }}>Empezar contrato desde cero</Typography>
                              <Typography variant="body2" color="text.secondary">
                                El contrato comienza sin avances ni evidencias anteriores.
                              </Typography>
                            </Box>
                          </ToggleButton>
                        </ToggleButtonGroup>
                      </Box>
                    )}

                    {selected && !canMigrateHistory && (
                      <Box sx={{ px: 2, pb: 2 }}>
                        <Divider sx={{ mb: 2 }} />
                        <Box
                          sx={{
                            p: 2,
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 1.25,
                            borderRadius: 2,
                            bgcolor: '#eaf3ff',
                            border: '1px solid #9bc2f2'
                          }}
                        >
                          <RestartAltIcon color="primary" />
                          <Box>
                            <Typography sx={{ fontWeight: 800 }}>Nuevo contrato sin historial</Typography>
                            <Typography variant="body2" color="text.secondary">
                              Los avances anteriores siguen en su contrato correspondiente. Este contrato comienza sin avances ni evidencias anteriores.
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    )}
                  </Paper>
                );
              })}
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, bgcolor: '#f8f9fa', gap: 1 }}>
            <Button onClick={() => setShowSystems(false)} color="inherit" sx={{ fontWeight: 700 }}>
              Volver
            </Button>
            <Button
              variant="contained"
              disabled={!selectedSystemIds.length || submitting}
              onClick={handleCreate}
              sx={{ px: 4, borderRadius: 2, fontWeight: 700 }}
            >
              {submitting
                ? selectedExistingContract ? 'Asociando...' : 'Creando...'
                : selectedExistingContract ? 'Asociar al contrato' : 'Crear contrato'}
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}

CreateContractDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  projectName: PropTypes.string,
  projectRelationId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  projectBudget: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  projectInitDate: PropTypes.string,
  projectFinalDate: PropTypes.string,
  systems: PropTypes.array,
  existingContracts: PropTypes.array,
  onCreate: PropTypes.func.isRequired,
  onReuse: PropTypes.func.isRequired
};

CreateContractDialog.defaultProps = {
  systems: [],
  existingContracts: []
};
