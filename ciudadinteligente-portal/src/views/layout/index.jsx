import { Box, Typography } from '@mui/material';
import { Header } from '../../components/Header/General';
import { menuItems } from './routes.config'
import { MenuSide } from '../../components/Menu';
import { useLocation, useNavigate } from 'react-router-dom';
import { usePermission } from '../../hooks/usePermission';
import { useEffect, useState } from 'react';

export default function HomeComponent () {
  const navigate = useNavigate();

  const { pathname } = useLocation();
  const { hasPermission } = usePermission();
  const [routeActive, setRouteActive] = useState(null);

  useEffect(() => {
  if (!pathname) return;

  const currentItem = menuItems.find(item => `/${item.pathname}` === pathname);

  if (!currentItem || !hasPermission(currentItem.roleId)) {
    navigate('/projects');
  };

  setRouteActive(currentItem);
}, [pathname, hasPermission, navigate]);

// En src/views/layout/index.jsx (Línea 23)
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', width: '100%', backgroundColor: '#f3f4f6', overflowX: 'hidden' }}> {/* <-- Añadí un fondo gris sutil */}
      <Header />
      <MenuSide menuItems={menuItems} />
      {routeActive && (
        <Box sx={{ display: 'flex', flex: 1, minWidth: 0, mt: '64px', alignItems: 'center', flexDirection: 'column', p: 4 }}> {/* <-- Cambié p:3 por p:4 para que respire más */}
          <Typography
            variant='h5'
            sx={{
              mb: 3,
              fontWeight: 700,
              color: '#1f2937',
              alignSelf: routeActive.pathname === 'projects' ? 'center' : 'flex-start',
              width: routeActive.pathname === 'projects' ? '100%' : 'auto',
              maxWidth: routeActive.pathname === 'projects' ? 1000 : 'none'
            }}
          >
            {routeActive.label}
          </Typography>
          {routeActive.component}
        </Box>
      )}
    </Box>
  );
}
