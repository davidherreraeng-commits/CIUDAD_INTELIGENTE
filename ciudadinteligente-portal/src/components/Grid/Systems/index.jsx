import { Box, Typography, Button, Popover, TextField, Grid, Paper, IconButton, MenuItem } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useState } from "react";
import StatusSelector from "./StatusSelector";

import FlagIcon from "@mui/icons-material/Flag";
import FlagOutlinedIcon from "@mui/icons-material/OutlinedFlag";
import LinkIcon from "@mui/icons-material/Link";
import { Tooltip } from "@mui/material"; // Asegúrate de importar Tooltip

import PropTypes from "prop-types";
export function GridSystems ({
  anchorNuevoSistema,
  setAnchorNuevoSistema,
  addSystem,
  systemsForProject,
  hasContracts,
  title,
  emptyMessage,
  showCreateButton,
  availableContracts,
  defaultContractId,
  lockContractSelection,
  showDeleteButton,
  showAssociateButton,
  onAssociateSystem,
  anchorDeleteSystem,
  setAnchorDeleteSystem,
  deleteSystem,
  setSelectedSystem,
  onStatusChange,
  toggleSystemAlert
}) {
  const [systemToDelete, setSystemToDelete] = useState(null);
  const [newSystem, setNewSystem] = useState({
    name: '',
    description: '',
    initDate: '',
    finalDate: '',
    idContract: defaultContractId || ''
  })

  const handleAddSystem = async () => {
    const created = await addSystem(newSystem);
    if (created) {
      setNewSystem({
        name: '',
        description: '',
        initDate: '',
        finalDate: '',
        idContract: defaultContractId || ''
      });
    }
  }

  const closePopover = () => {
    setAnchorNuevoSistema(null);
    setNewSystem({
      name: '',
      description: '',
      initDate: '',
      finalDate: '',
      idContract: defaultContractId || ''
    });
  }

  return (
    <Box sx={{ mt: hasContracts ? 3 : 0 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: { xs: "stretch", sm: "center" },
          flexDirection: { xs: "column", sm: "row" },
          gap: 1.5,
          mb: 2
        }}
      >
        <Typography
          variant="h6"
          sx={{ fontWeight: 600 }}
        >
          {title || (hasContracts ? 'Sistemas sin contrato' : 'Sistemas o aplicaciones')}
        </Typography>
        <Box
          sx={{
            ml: { xs: 0, sm: "auto" },
            mt: { xs: 0, sm: hasContracts ? 1.5 : 0 },
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 1
          }}
        >
          {showCreateButton && (
            <Button
              variant="contained"
              onClick={(e) => {
                setNewSystem((current) => ({
                  ...current,
                  idContract: defaultContractId || current.idContract || ''
                }));
                setAnchorNuevoSistema(e.currentTarget);
              }}
            >
              Nuevo sistema
            </Button>
          )}
        </Box>
        <Popover
          open={Boolean(anchorNuevoSistema)}
          anchorEl={anchorNuevoSistema}
          onClose={closePopover}
          anchorOrigin={{ vertical:"bottom", horizontal:"right" }}
          transformOrigin={{ vertical:"top", horizontal:"right" }}
        >
          <Box sx={{ p: 2, width: 260 }}>
            <Typography sx={{ fontWeight: 600, mb: 1 }}>Nuevo sistema</Typography>
            <form style={{display:"flex",flexDirection:"column",gap:8,width:240}}>
              <TextField
                size="small"
                label="Nombre"
                fullWidth
                required
                value={newSystem.name}
                onChange={(e) => setNewSystem({ ...newSystem, name:e.target.value })}
              />
              <TextField
                size="small"
                label="Descripción"
                fullWidth
                multiline
                minRows={2}
                value={newSystem.description}
                onChange={(e) => setNewSystem({ ...newSystem, description:e.target.value })}
              />
              <TextField
                type="date"
                size="small"
                label="Fecha inicio"
                fullWidth
                required
                value={newSystem.initDate}
                slotProps={{ inputLabel: { shrink: true } }}
                onChange={(e) => setNewSystem({ ...newSystem, initDate:e.target.value })}
              />
              <TextField
                type="date"
                size="small"
                label="Fecha fin"
                fullWidth
                required
                value={newSystem.finalDate}
                slotProps={{ inputLabel: { shrink: true } }}
                onChange={(e) => setNewSystem({ ...newSystem, finalDate:e.target.value })}
              />
              {Boolean(availableContracts?.length) && (
                <TextField
                  select
                  size="small"
                  label="Contrato asociado"
                  fullWidth
                  value={newSystem.idContract}
                  disabled={lockContractSelection}
                  onChange={(e) => setNewSystem({ ...newSystem, idContract: e.target.value })}
                  helperText={lockContractSelection ? 'Se asociará al contrato actual' : 'Opcional'}
                >
                  {!lockContractSelection && (
                    <MenuItem value="">Sin contrato</MenuItem>
                  )}
                  {availableContracts.map((contract) => (
                    <MenuItem key={contract.idContract} value={contract.idContract}>
                      Contrato {contract.contractNumber}
                    </MenuItem>
                  ))}
                </TextField>
              )}
              <Button variant="contained" sx={{ mt:1 }}
                disabled={!newSystem.name || !newSystem.initDate || !newSystem.finalDate}
                onClick={handleAddSystem}
              >
                Guardar
              </Button>
            </form>
          </Box>
        </Popover>
        <Popover
          open={Boolean(anchorDeleteSystem)}
          anchorEl={anchorDeleteSystem}
          onClose={() => setAnchorDeleteSystem(null)}
          anchorOrigin={{ vertical:"bottom", horizontal:"center" }}
          transformOrigin={{ vertical:"top", horizontal:"center" }}
        >
          <Box sx={{ p:2, maxWidth: 250 }}>
            <Typography sx={{ mb:1 }}>
              ¿Estás seguro de eliminar el sistema <b>{systemToDelete?.name}</b>?
            </Typography>
            <Button variant="contained" color="error" onClick={() => deleteSystem({ systemsId: systemToDelete.systemsId })}>
              Confirmar
            </Button>
            <Button sx={{ ml:1 }} onClick={() => setAnchorDeleteSystem(null)}>
              Cancelar
            </Button>
          </Box>
        </Popover>
      </Box>
      <Grid container spacing={2}>
        {!systemsForProject?.length && (
          <Grid size={{ xs: 12 }}>
            <Paper
              variant="outlined"
              sx={{ p: 3, borderRadius: 3, borderStyle: 'dashed', textAlign: 'center' }}
            >
              <Typography color="text.secondary">
                {emptyMessage || (hasContracts
                  ? 'Todos los sistemas del proyecto están asociados a un contrato.'
                  : 'Este proyecto aún no tiene sistemas registrados.')}
              </Typography>
            </Paper>
          </Grid>
        )}
        {systemsForProject?.map((s, i) => {
          return (
            <Grid size={{ xs: 12 }} key={`system_grid_${i}`}>
              <Paper
             elevation={0}
             sx={{
               borderRadius: 3,
               // ESTILO CONDICIONAL: Borde rojo y fondo rojizo si hay alerta
               border: s.hasAlert ? "2px solid #ef5350" : "2px solid #d0e3ff",
               backgroundColor: s.hasAlert ? "#fff8f8" : "#fff",
               padding: 2.5,
               transition: "0.2s",
               position: "relative",
               cursor: "pointer",
               "&:hover": {
                 boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                 borderColor: s.hasAlert ? "#d32f2f" : "#90b8ff"
               }
             }}
             onClick={() => setSelectedSystem(s)}
           >
             <Box sx={{ display: "flex", alignItems: "center" }}>
               <Typography variant="h6" sx={{ fontWeight: 600, flexGrow: 1, color: s.hasAlert ? "#d32f2f" : "inherit" }}>
                 {s.name}
               </Typography>

               {showAssociateButton && (
                 <Button
                   variant="outlined"
                   size="small"
                   startIcon={<LinkIcon />}
                   onClick={(event) => {
                     event.stopPropagation();
                     onAssociateSystem(s);
                   }}
                   sx={{ mr: 1 }}
                 >
                   Asociar a contrato
                 </Button>
               )}

               {/* BOTÓN DE BANDERITA PARA ALERTAS */}
               <Tooltip title={s.hasAlert ? "Quitar alerta del sistema" : "Marcar sistema con novedad"}>
                 <IconButton
                   size="small"
                   onClick={(e) => {
                     e.stopPropagation(); // Evita que se abra el sistema
                     toggleSystemAlert(s.systemsId, s.hasAlert);
                   }}
                 >
                   {s.hasAlert ? <FlagIcon color="error" /> : <FlagOutlinedIcon color="action" />}
                 </IconButton>
               </Tooltip>

               {showDeleteButton && (
                 <IconButton
                   color="error"
                   size="small"
                   onClick={(e) => {
                     e.stopPropagation();
                     setSystemToDelete(s);
                     setAnchorDeleteSystem(e.currentTarget);
                   }}
                 >
                   <DeleteIcon />
                 </IconButton>
               )}
             </Box>

               <Box sx={{mt: 1, mb: 1}}>
                    <StatusSelector
                      currentStatus={s.status}
                      systemsId={s.systemsId}
                      idContractSystem={s.idContractSystem}
                      onStatusChange={onStatusChange}
                    />
                </Box>

                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    Inicio: <b>{s.initDate?.substring(0,10) || "Sin definir"}</b>
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    Fin: <b>{s.finalDate?.substring(0,10) || "Sin definir"}</b>
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  )
}

GridSystems.propTypes = {
    anchorNuevoSistema: PropTypes.any,
    setAnchorNuevoSistema: PropTypes.any,
    addSystem: PropTypes.func,
    systemsForProject: PropTypes.array,
    hasContracts: PropTypes.bool,
    title: PropTypes.string,
    emptyMessage: PropTypes.string,
    showCreateButton: PropTypes.bool,
    availableContracts: PropTypes.array,
    defaultContractId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    lockContractSelection: PropTypes.bool,
    showDeleteButton: PropTypes.bool,
    showAssociateButton: PropTypes.bool,
    onAssociateSystem: PropTypes.func,
    anchorDeleteSystem: PropTypes.object,
    setAnchorDeleteSystem: PropTypes.func,
    deleteSystem: PropTypes.func,
    setSelectedSystem: PropTypes.func,
    onStatusChange: PropTypes.func,
    toggleSystemAlert: PropTypes.func,
};

GridSystems.defaultProps = {
  showCreateButton: true,
  availableContracts: [],
  lockContractSelection: false,
  showDeleteButton: true,
  showAssociateButton: false
};
