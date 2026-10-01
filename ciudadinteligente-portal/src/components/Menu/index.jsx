import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Box, Typography, Button, Collapse } from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { usePermission } from "../../hooks/usePermission";
import { useLocation, useNavigate } from "react-router-dom";
import LogoutIcon from '@mui/icons-material/Logout';
// 1. IMPORTAR EL HOOK DE AUTENTICACIÓN
import { useAuth } from "../../provider/useAuth";
import { useEffect, useState } from "react";

import PropTypes from "prop-types";
export function MenuSide({ menuItems }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { hasPermission } = usePermission();
  const [openSubmenus, setOpenSubmenus] = useState({});

  const toggleSubmenu = (key) => {
    setOpenSubmenus((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Elementos de primer nivel (los que tienen parentPathname se muestran como submenú)
  const topLevelItems = menuItems.filter((item) => !item.parentPathname);

  // Abre automáticamente el submenú que contiene la ruta activa
  useEffect(() => {
    const activeParent = menuItems.find(
      (item) => item.parentPathname && `/${item.pathname}` === pathname
    )?.parentPathname;

    if (activeParent) {
      setOpenSubmenus((prev) => ({ ...prev, [activeParent]: true }));
    }
  }, [pathname, menuItems]);

  // 2. EXTRAER authUser Y logout DEL PROVIDER
  const { authUser, logout } = useAuth();

  // 3. OBTENER LOS DATOS REALES (Manejando posibles nulos por si el token tarda en cargar)
  const userName = authUser?.userProfile?.name || "Usuario";
  const userLastName = authUser?.userProfile?.lastName || "";
  // Si en el token no viene el nombre del rol, puedes mapearlo por el roleId (Ej: 1 = Admin)
  const userRole = authUser?.roleName
    || (authUser?.roleId === 1 ? "Administrador" : "Auditor");

  const handleLogout = () => {
    // 4. USAR LA FUNCIÓN DEL PROVIDER
    logout(); 
    navigate('/login');
  };

  return (
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        width: 280,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 280,
          height: 'calc(100vh - 64px)',
          boxSizing: 'border-box',
          backgroundColor: '#ffffff',
          mt: '64px', // Se mantiene debajo de tu Header actual
          borderRight: '1px solid #e5e7eb',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between', // Separa el menú de la tarjeta de perfil
        },
      }}
    >
      {/* SECCIÓN SUPERIOR: RUTAS */}
      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', px: 2, py: 3 }}>
        <List sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {topLevelItems.map((item) => {
            if (!hasPermission(item.roleId)) return null;

            const hasChildren = Array.isArray(item.children) && item.children.length > 0;

            // Sub-items visibles (respetando permisos), en el orden definido en children
            const subItems = hasChildren
              ? item.children
                  .map((childPathname) => menuItems.find((mi) => mi.pathname === childPathname))
                  .filter((childItem) => childItem && hasPermission(childItem.roleId))
              : [];

            const isChildActive = subItems.some((child) => pathname === `/${child.pathname}`);
            const isActive = !hasChildren && pathname === `/${item.pathname}`;
            const isOpen = !!openSubmenus[item.pathname];

            return (
              <Box key={item.pathname}>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => hasChildren ? toggleSubmenu(item.pathname) : navigate(`/${item.pathname}`)}
                    sx={{
                      borderRadius: '12px',
                      px: 2,
                      py: 1.5,
                      transition: 'all 0.2s ease-in-out',
                      // Estilos de Caracterización 360
                      ...((isActive || isChildActive) ? {
                        backgroundColor: '#003A57',
                        color: '#ffffff',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        transform: 'scale(1.02)',
                        fontWeight: 'bold',
                        '&:hover': { backgroundColor: '#003A57' }
                      } : {
                        color: 'rgba(0, 58, 87, 0.7)',
                        '&:hover': {
                          backgroundColor: 'rgba(0, 58, 87, 0.1)',
                          color: '#003A57'
                        }
                      })
                    }}
                  >
                    <ListItemIcon sx={{
                      minWidth: 40,
                      color: (isActive || isChildActive) ? '#ffffff' : 'inherit'
                    }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      slotProps={{
                        primary: {
                          fontSize: '14px',
                          fontWeight: (isActive || isChildActive) ? 700 : 500
                        }
                      }}
                    />
                    {hasChildren && (isOpen ? <ExpandLess /> : <ExpandMore />)}
                  </ListItemButton>
                </ListItem>

                {hasChildren && (
                  <Collapse in={isOpen} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                      {subItems.map((child) => {
                        const isSubActive = pathname === `/${child.pathname}`;
                        return (
                          <ListItem key={child.pathname} disablePadding>
                            <ListItemButton
                              onClick={() => navigate(`/${child.pathname}`)}
                              sx={{
                                borderRadius: '12px',
                                pl: 5,
                                pr: 2,
                                py: 1.25,
                                transition: 'all 0.2s ease-in-out',
                                ...(isSubActive ? {
                                  backgroundColor: '#003A57',
                                  color: '#ffffff',
                                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                  fontWeight: 'bold',
                                  '&:hover': { backgroundColor: '#003A57' }
                                } : {
                                  color: 'rgba(0, 58, 87, 0.7)',
                                  '&:hover': {
                                    backgroundColor: 'rgba(0, 58, 87, 0.1)',
                                    color: '#003A57'
                                  }
                                })
                              }}
                            >
                              <ListItemIcon sx={{
                                minWidth: 32,
                                color: isSubActive ? '#ffffff' : 'inherit'
                              }}>
                                {child.icon}
                              </ListItemIcon>
                              <ListItemText
                                primary={child.label}
                                slotProps={{
                                  primary: {
                                    fontSize: '13px',
                                    fontWeight: isSubActive ? 700 : 500
                                  }
                                }}
                              />
                            </ListItemButton>
                          </ListItem>
                        );
                      })}
                    </List>
                  </Collapse>
                )}
              </Box>
            );
          })}
        </List>
      </Box>

      {/* SECCIÓN INFERIOR: PERFIL Y LOGOUT */}
      <Box sx={{ flexShrink: 0, p: 3, borderTop: '1px solid #f3f4f6', backgroundColor: '#f9fafb' }}>
        <Box sx={{ 
          px: 2, 
          py: 2, 
          mb: 2, 
          borderRadius: 3, 
          backgroundColor: '#ffffff', 
          border: '1px solid #e5e7eb', 
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          textAlign: 'center' 
        }}>
          <Box sx={{ 
            width: 40, 
            height: 40, 
            borderRadius: '50%', 
            backgroundColor: 'rgba(0, 58, 87, 0.1)', 
            color: '#003A57', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontWeight: 'bold', 
            fontSize: '18px',
            mb: 1
          }}>
            {userName.charAt(0).toUpperCase()}
          </Box>
          <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#003A57', width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {userName} {userLastName}
          </Typography>
          <Typography sx={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280', fontWeight: 600, mt: 0.5, width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {userRole}
          </Typography>
        </Box>
        <Button
          fullWidth
          onClick={handleLogout}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            px: 2,
            py: 1.5,
            fontSize: '14px',
            fontWeight: 700,
            color: '#b91c1c', // red-700
            backgroundColor: '#fef2f2', // red-50
            borderRadius: '12px',
            textTransform: 'none',
            transition: 'all 0.2s',
            '&:hover': {
              backgroundColor: '#fee2e2', // red-100
            }
          }}
        >
          <LogoutIcon fontSize="small" /> Cerrar Sesión
        </Button>
      </Box>
    </Drawer>
  );
}

MenuSide.propTypes = {
    menuItems: PropTypes.array,
};
