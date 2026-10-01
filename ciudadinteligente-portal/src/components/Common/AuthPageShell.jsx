import { Box, Container, Fade, Paper, Typography } from '@mui/material';

import { getRandomAuthBackground } from '../../utils/authBackgroundImages';

import PropTypes from "prop-types";
const randomImage = getRandomAuthBackground();

export default function AuthPageShell({ title, subtitle, children }) {
  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundImage: `url(${randomImage})`
      }}
    >
      <Container maxWidth="sm">
        <Fade in={true}>
          <Paper
            elevation={6}
            sx={{
              p: 6,
              borderRadius: 3,
              backgroundColor: 'rgba(255,255,255,0.75)',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
            }}
          >
            <Typography variant="h4" component="h1" gutterBottom>
              {title}
            </Typography>
            <Typography variant="subtitle2" gutterBottom sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
              {subtitle}
            </Typography>
            {children}
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
}

AuthPageShell.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  children: PropTypes.node,
};
