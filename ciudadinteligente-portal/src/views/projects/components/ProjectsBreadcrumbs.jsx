import { Breadcrumbs, Paper, Typography } from '@mui/material';

import PropTypes from "prop-types";
export default function ProjectsBreadcrumbs({
  selectedDependency,
  selectedProject,
  selectedSystem,
  onResetAll,
  onResetDependency,
  onResetSystem
}) {
  return (
    <Paper
      elevation={2}
      sx={{
        position: 'sticky',
        top: '64px',
        background: '#fff',
        border: '1px solid #e0e0e0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        mt: 1,
        width: '100%',
        py: 3,
        zIndex: 1000,
        borderRadius: 2
      }}
    >
      <Breadcrumbs
        aria-label="breadcrumb"
        sx={{ width: '100%', maxWidth: 1000, px: 1 }}
      >
        <Typography
          color="text.primary"
          sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
          onClick={onResetAll}
        >
          Secretarías
        </Typography>

        {selectedDependency && (
          <Typography
            color="text.secondary"
            sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
            onClick={onResetDependency}
          >
            {selectedDependency.name}
          </Typography>
        )}

        {selectedProject && (
          <Typography
            color="text.secondary"
            sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
            onClick={onResetSystem}
          >
            {selectedProject.Project?.name}
          </Typography>
        )}

        {selectedSystem && (
          <Typography color="text.secondary">
            {selectedSystem.name}
          </Typography>
        )}
      </Breadcrumbs>
    </Paper>
  );
}

ProjectsBreadcrumbs.propTypes = {
    selectedDependency: PropTypes.bool,
    selectedProject: PropTypes.bool,
    selectedSystem: PropTypes.bool,
    onResetAll: PropTypes.func,
    onResetDependency: PropTypes.func,
    onResetSystem: PropTypes.func,
};
