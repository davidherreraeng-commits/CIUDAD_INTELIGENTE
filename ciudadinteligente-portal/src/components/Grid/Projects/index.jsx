import { Box, Button, Chip, Grid, IconButton, MenuItem, Paper, Popover, Typography, Tooltip } from "@mui/material";
import { BusinessCenter as BusinessCenterIcon, Delete as DeleteIcon, Flag as FlagIcon} from "@mui/icons-material"
import { useState } from "react";

import PropTypes from "prop-types";
export function GridProjects({
  setAnchorAsignarProyecto,
  selectedDependency,
  anchorAsignarProyecto,
  projectsList,
  projectsForDependency,
  addProject,
  deleteProject,
  setAnchorDeleteConfirm,
  anchorDeleteConfirm,
  setSelectedProject,
}) {
  const [projectToDelete, setProjectToDelete] = useState(null);

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Typography
          variant="h6"
          sx={{ fontWeight: 600 }}
        >
          Proyectos
        </Typography>
        <Button
          variant="contained"
          sx={{ ml: 'auto' }}
          onClick={(e) => setAnchorAsignarProyecto(e.currentTarget)}
        >
          Asignar proyecto
        </Button>
        <Popover
          open={Boolean(anchorAsignarProyecto)}
          anchorEl={anchorAsignarProyecto}
          onClose={() => setAnchorAsignarProyecto(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          disableEnforceFocus
          disableAutoFocus
          disableRestoreFocus
        >
          <Box sx={{ p: 2, width: 250 }}>
            <Typography sx={{ fontWeight: 600, mb: 1 }}>Asignar proyecto</Typography>
            {projectsList && projectsForDependency &&
              (() => {
                const disponibles = projectsList.filter(
                  p => !projectsForDependency.some(pd => pd.projectsId === p.projectsId)
                );

                return disponibles.length === 0 ? (
                  <Typography sx={{ p: 1, textAlign: "center", fontSize: 14, color: "gray" }}>
                    No hay más proyectos por asignar
                  </Typography>
                ) : (
                  disponibles.map((p) => (
                    <MenuItem key={p.projectsId} value={p.projectsId} onClick={() => addProject(p.projectsId, selectedDependency?.dependencyId)}>
                      {p.name}
                    </MenuItem>
                  ))
                );
              })()
            }
          </Box>
        </Popover>
        <Popover
          open={Boolean(anchorDeleteConfirm)}
          anchorEl={anchorDeleteConfirm}
          onClose={() => setAnchorDeleteConfirm(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          disableEnforceFocus
          disableAutoFocus
          disableRestoreFocus
        >
          <Box sx={{ p: 2, width: 260 }}>
            <Typography sx={{ fontWeight: 600, mb: 1 }}>¿Eliminar proyecto?</Typography>
            <Typography sx={{ fontSize: 14, color: "gray", mb: 2 }}>
              Si eliminas este proyecto de la dependencia se eliminarán los sistemas asignados.
            </Typography>

            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="contained"
                color="error"
                fullWidth
                onClick={() => {
                  deleteProject(projectToDelete.projectsId, projectToDelete.dependencyId);
                  setProjectToDelete(null);
                }}
              >
                Eliminar
              </Button>

              <Button
                variant="outlined"
                fullWidth
                onClick={() => {
                  setAnchorDeleteConfirm(null);
                  setProjectToDelete(null);
                }}
              >
                Cancelar
              </Button>
            </Box>
          </Box>
        </Popover>
      </Box>
      <Grid container spacing={2}>
        {projectsForDependency?.map((p) => {
          return (
            <Grid size={{ xs: 12, sm: 6 }} key={p.projectsId}>
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: "2px solid #d0e3ff",
                  padding: 2.5,
                  transition: "0.2s",
                  position: "relative",
                  cursor: "pointer",
                  "&:hover": {
                    boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                    borderColor: "#90b8ff"
                  }
                }}
                onClick={() => setSelectedProject(p)}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: ''}}>
                  
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, color: '#424242', flexGrow: 1 }}
                  >
                    {p.Project?.name}
                  </Typography>

                  {p.hasSystemAlert && (
                    <Tooltip title="Atención: Uno o más sistemas de este proyecto tienen novedades">
                      <FlagIcon color="error" fontSize="small" />
                    </Tooltip>
                  )}

                  <IconButton
                    size="small"
                    sx={{ color: "#d32f2f", ml: 1 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setProjectToDelete(p);
                      setAnchorDeleteConfirm(e.currentTarget);
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>

                {Boolean(p.totalContracts) && (
                  <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1.25 }}>
                    <Box
                      sx={{
                        display: 'grid',
                        placeItems: 'center',
                        width: 42,
                        height: 42,
                        borderRadius: 2,
                        bgcolor: '#e8f1ff',
                        color: '#1976d2'
                      }}
                    >
                      <BusinessCenterIcon />
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 800, color: '#26364a' }}>
                        {`${p.totalContracts} ${p.totalContracts === 1 ? 'contrato asociado' : 'contratos asociados'}`}
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 0.75 }}>
                        <Chip
                          label={`${p.activeContracts || 0} activos`}
                          color="success"
                          size="small"
                          variant="outlined"
                        />
                        <Chip
                          label={`${p.finalizedContracts || 0} finalizados`}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                  </Box>
                )}
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  )
}

GridProjects.propTypes = {
    setAnchorAsignarProyecto: PropTypes.any,
    selectedDependency: PropTypes.bool,
    anchorAsignarProyecto: PropTypes.any,
    projectsList: PropTypes.array,
    projectsForDependency: PropTypes.array,
    addProject: PropTypes.func,
    deleteProject: PropTypes.func,
    setAnchorDeleteConfirm: PropTypes.any,
    anchorDeleteConfirm: PropTypes.any,
    setSelectedProject: PropTypes.func,
};
