import { Box, CircularProgress } from '@mui/material';

export default function ProjectsLoadingOverlay() {
  return (
    <Box
      sx={{
        position: 'fixed',
        height: '100%',
        width: '100%',
        background: 'rgba(0, 0, 0, .4)',
        top: 0,
        left: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 20000
      }}
    >
      <CircularProgress />
    </Box>
  );
}
