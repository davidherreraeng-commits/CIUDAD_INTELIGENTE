import { Box, Grid, Paper, Typography, Button, Popover, TextField, Tooltip } from "@mui/material"
import { useState } from "react";
import { Flag as FlagIcon } from "@mui/icons-material"
import PropTypes from "prop-types";
function DependencyCard({ dep, onClick, hasProjects }) {
  return (
    <Grid size={{ xs: 12, sm: 6, md: 4 }} sx={{ display: 'flex' }}>
      <Paper
        elevation={0}
        onClick={onClick}
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          borderRadius: 3,
          border: hasProjects ? "2px solid #d0e3ff" : "2px dashed #ddd",
          padding: 2.5,
          cursor: "pointer",
          transition: "0.2s",
          ...(hasProjects ? {} : { opacity: 0.8 }),
          "&:hover": {
            boxShadow: hasProjects ? "0 4px 16px rgba(0,0,0,0.08)" : "0 4px 16px rgba(0,0,0,0.05)",
            borderColor: hasProjects ? "#90b8ff" : "#bbb"
          }
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, flexGrow: 1, justifyContent: "space-between" }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: hasProjects ? "#1c3c68" : "#444",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis"
            }}
          >
            {dep.name}
          </Typography>
          {hasProjects && dep.hasSystemAlert && (
            <Tooltip title="Atención: Esta secretaría tiene sistemas con novedades">
              <FlagIcon color="error" />
            </Tooltip>
          )}
          <Box
            sx={{
              backgroundColor: hasProjects ? "#e8f1ff" : "#f5f5f5",
              color: hasProjects ? "#1a73e8" : "#888",
              width: "fit-content",
              px: 2,
              py: 0.5,
              borderRadius: 2,
              fontSize: 14,
              fontWeight: 600
            }}
          >
            {hasProjects ? `${dep.totalProjects} Proyectos` : 'Sin proyectos'}
          </Box>
        </Box>
      </Paper>
    </Grid>
  );
}

export function GridDependencies({ dependencies, setSelectedDependency, addDependency }) {

  const [anchorNuevaDep, setAnchorNuevaDep] = useState(null);
  const [newDependencyName, setNewDependencyName] = useState('');

  const handleGuardar = () => {
    addDependency(newDependencyName);
    setNewDependencyName('');
    setAnchorNuevaDep(null);
  };

  return (
    <>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Selecciona una Dependencia
        </Typography>

        <Button
          variant="contained"
          sx={{ ml: 'auto' }}
          onClick={(e) => setAnchorNuevaDep(e.currentTarget)}
        >
          Nueva Dependencia
        </Button>

        <Popover
          open={Boolean(anchorNuevaDep)}
          anchorEl={anchorNuevaDep}
          onClose={() => {
            setAnchorNuevaDep(null);
            setNewDependencyName('');
          }}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Box sx={{ p: 2, width: 260 }}>
            <Typography sx={{ fontWeight: 600, mb: 1 }}>Crear Nueva Secretaría</Typography>
            <form style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <TextField
                size="small"
                label="Nombre de la Secretaría"
                fullWidth
                required
                value={newDependencyName}
                onChange={(e) => setNewDependencyName(e.target.value)}
              />
              <Button
                variant="contained"
                sx={{ mt: 1 }}
                disabled={!newDependencyName.trim()}
                onClick={handleGuardar}
              >
                Guardar
              </Button>
            </form>
          </Box>
        </Popover>
      </Box>

      <Grid container spacing={2}>
        {dependencies && (
          <>
            {dependencies
              .filter((dep) => dep.totalProjects > 0)
              .map((dep) => (
                <DependencyCard key={dep.name} dep={dep} onClick={() => setSelectedDependency(dep)} hasProjects />
              ))}
          </>
        )}
      </Grid>
    </>
  )
}

DependencyCard.propTypes = {
  dep: PropTypes.object,
  onClick: PropTypes.func,
  hasProjects: PropTypes.bool,
};

GridDependencies.propTypes = {
  dependencies: PropTypes.array,
  setSelectedDependency: PropTypes.func,
  addDependency: PropTypes.func,
};
