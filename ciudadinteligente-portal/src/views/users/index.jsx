import { useState, useEffect } from 'react';

import { Box, Divider, Button } from '@mui/material';
import { Popover } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

import { usersCreate, usersGetAll, usersUpdate, usersDelete } from '../../api/users';
import { rolesGetAll } from '../../api/roles';

import FilterUser from '../../components/Forms/FilterUser';
import UsersTable from '../../components/Tables/UserTable';
import NewUserForm from '../../components/Forms/NewUser';

import { useErrorAlert, useSuccessAlert } from '../../hooks/errorAlert';

export function Users () {
  const { errorAlert } = useErrorAlert();
  const { successAlert } = useSuccessAlert();

  const initialFilters = {
    username: null,
    roleId: null,
    email: null,
    name: null,
    lastName: null,
    page: 1,
    limit: 10
  };

  const [users, setUsers] = useState(null);
  const [roles, setRoles] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState(initialFilters);

  const open = Boolean(anchorEl);

  useEffect(() => {
    setLoading(true);
    const delay = setTimeout(() => {
      usersGetAll(filters)
        .then((res) => {
          setUsers(res.data.users);
          setTotalPages(res.data.totalPages || 1);
          setLoading(false);
        })
        .catch((err) => {
          errorAlert("No se pudo consultar los usuarios correctamente", err)
          setLoading(false);
        });
    }, 600);

    return () => clearTimeout(delay);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  useEffect(() => {
    if (roles) return;

    rolesGetAll()
      .then((res) => { setRoles(res.data.roles); })
      .catch((err) => { errorAlert("No se pudo consultar los roles correctamente", err) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roles]);

  const handleFilterChange = (field, value) => { setFilters(prev => ({ ...prev, [field]: value, page: 1 })); };
  const handleOpenPopover = (event) => { setAnchorEl(event.currentTarget); };
  const handleClosePopover = () => { setAnchorEl(null); };
  const handlePageChange = (newPage) => { setFilters(prev => ({ ...prev, page: newPage })); };

  const registerNewUser = (dataForm) => {
    usersCreate(dataForm)
      .then((res) => {
        successAlert('Usuario creado correctamente', res);
        setFilters(initialFilters);
      })
      .catch((err) => { errorAlert("Error en la creación", err) });
  }

  const updateUser = (dataForm) => {
    usersUpdate(dataForm)
      .then((res) => {
        successAlert('Usuario actualizado', res);
        setFilters(initialFilters);
      })
      .catch((err) => { errorAlert("Error en la creación", err); setLoading(false); });
  }

  const deleteUser = (userId) => {
    usersDelete({ userId })
      .then((res) => {
        successAlert('Usuario eliminado', res);
        setFilters(initialFilters);
      })
      .catch((err) => { errorAlert("Error en la eliminación", err); setLoading(false); });
  }

  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: 1000, margin: '0 auto' }}>
        <Box sx={{ mb: 2, ml: 'auto' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenPopover}
            startIcon={<AddIcon />}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Agregar usuario
          </Button>
        </Box>

        <Popover
          open={open}
          anchorEl={anchorEl}
          onClose={handleClosePopover}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          sx={{ p: 2 }}
        >
          <Box sx={{ p: 2, minWidth: 250 }}>
            <NewUserForm onSubmit={(data) => { registerNewUser(data); handleClosePopover(); setLoading(true); }} roles={roles} title={'Nuevo usuario'} />
          </Box>
        </Popover>

        <FilterUser filters={filters} handleFilterChange={handleFilterChange} roles={roles} />
        <UsersTable
          setLoading={setLoading}
          onDelete={deleteUser}
          onSubmit={updateUser}
          roles={roles}
          users={users}
          loading={loading}
          page={filters.page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </Box>
    </>
  )
}