import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CircularProgress,
  Box,
  IconButton,
  Tooltip,
  Pagination,
  Button
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ListAltIcon from '@mui/icons-material/ListAlt';
import { Popover } from '@mui/material';
import { useState } from 'react';
import NewUserForm from '../../Forms/NewUser';

import PropTypes from "prop-types";
export default function UsersTable ({ users, loading, page, onSubmit, onDelete, totalPages, onPageChange, setLoading, roles }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  const [deleteAnchorEl, setDeleteAnchorEl] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);

  const handleOpen = (event, user) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  const handleOpenDelete = (event, user) => {
    setDeleteAnchorEl(event.currentTarget);
    setUserToDelete(user);
  };

  const handleCloseDelete = () => {
    setDeleteAnchorEl(null);
    setUserToDelete(null);
  };

  const open = Boolean(anchorEl);
  const openDelete = Boolean(deleteAnchorEl);

  return (
    <Paper
      elevation={2}
      sx={{
        width: '100%',
        borderRadius: 3,
        overflow: "hidden",
        border: "1px solid #e0e0e0"
      }}
    >
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              <TableCell><strong>Documento</strong></TableCell>
              <TableCell><strong>Nombre completo</strong></TableCell>
              <TableCell><strong>Email</strong></TableCell>
              <TableCell><strong>Rol</strong></TableCell>
              <TableCell><strong>Acciones</strong></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {/* Loading */}
            {loading && (
              <TableRow>
                <TableCell colSpan={5}>
                  <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                    <CircularProgress size={32} />
                  </Box>
                </TableCell>
              </TableRow>
            )}

            {/* No data */}
            {!loading && users?.length === 0 && (
              <TableRow>
                <TableCell colSpan={5}>
                  <Typography
                    sx={{
                      textAlign: "center",
                      py: 2,
                      color: "#7a7a7a"
                    }}
                  >
                    No hay usuarios para mostrar.
                  </Typography>
                </TableCell>
              </TableRow>
            )}

            {/* Data */}
            {!loading && users?.map((user) => (
              <TableRow key={user.userId} hover>
                <TableCell>{user.username}</TableCell>
                <TableCell>
                  {user.UserProfile?.name} {user.UserProfile?.lastName}
                </TableCell>
                <TableCell>{user.UserProfile?.email}</TableCell>
                <TableCell>{user.UserRole?.name}</TableCell>
                <TableCell>
                  <Tooltip title="Editar">
                    <IconButton
                      color="primary"
                      size="small"
                      onClick={(e) => handleOpen(e, user)}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Eliminar">
                    <IconButton color="error" size="small" onClick={(e) => handleOpenDelete(e, user)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}

          </TableBody>
        </Table>
      </TableContainer>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <Box sx={{ p: 2, minWidth: 250 }}>
          <NewUserForm onSubmit={(formData) => { onSubmit(formData); handleClose(); setLoading(true); }} roles={roles} title={'Editar usuario'} data={selectedUser} />
        </Box>
      </Popover>
      <Popover
        open={openDelete}
        anchorEl={deleteAnchorEl}
        onClose={handleCloseDelete}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <Box sx={{ p: 3, minWidth: 260 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            ¿Seguro que deseas eliminar este usuario?
          </Typography>

          <Typography variant="body2" sx={{ color: "#666", mb: 2 }}>
            Esta acción no se puede deshacer.
          </Typography>

          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
            <Button
              variant="outlined"
              color="inherit"
              size="small"
              onClick={handleCloseDelete}
            >
              Cancelar
            </Button>

            <Button
              variant="contained"
              color="error"
              size="small"
              onClick={() => {
                onDelete(userToDelete.userId);
                handleCloseDelete();
              }}
            >
              Eliminar
            </Button>
          </Box>
        </Box>
      </Popover>
      <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(e, value) => onPageChange(value)}
          color="primary"
          size="medium"
          shape="rounded"
        />
      </Box>
    </Paper>
  );
}

UsersTable.propTypes = {
    users: PropTypes.object,
    loading: PropTypes.any,
    page: PropTypes.number,
    onSubmit: PropTypes.func,
    onDelete: PropTypes.func,
    totalPages: PropTypes.number,
    onPageChange: PropTypes.func,
    setLoading: PropTypes.any,
    roles: PropTypes.string,
};
