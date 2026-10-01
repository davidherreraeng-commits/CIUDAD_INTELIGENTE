import { useState } from "react";
import {
  Box,
  TextField,
  Grid,
  Button,
  MenuItem,
  Typography,
  InputAdornment
} from "@mui/material";

import BadgeIcon from "@mui/icons-material/Badge";
import LockIcon from "@mui/icons-material/Lock";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";

import PropTypes from "prop-types";
export default function NewUserForm( { title, onSubmit, roles, data }) {
  const [form, setForm] = useState({
    ...(data && { userId: data.userId }),
    username: data ? data.username : "",
    roleId: data ? data.roleId : "",
    name: data?.UserProfile?.name ?? "",
    lastName: data?.UserProfile?.lastName ?? "",
    email: data?.UserProfile?.email ?? ""
  });

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit(form);
  };

  return (
    <Box sx={{ width: 350, p: 1 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        {title}
      </Typography>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>

          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              required
              label="Número de documento"
              value={form.username}
              onChange={(e) => {
                if (/^\d*$/.test(e.target.value)) {
                  handleChange("username", e.target.value)
                }
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <BadgeIcon />
                    </InputAdornment>
                  )
                }
              }}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              select
              required
              fullWidth
              label="Rol"
              value={form.roleId}
              onChange={(e) => handleChange("roleId", e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <AssignmentIndIcon />
                    </InputAdornment>
                  )
                }
              }}
            >
              {roles?.map((r) => (
                <MenuItem key={r.roleId} value={r.roleId}>{r.name}</MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              required
              label="Nombres"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon />
                    </InputAdornment>
                  )
                }
              }}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              required
              label="Apellidos"
              value={form.lastName}
              onChange={(e) => handleChange("lastName", e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon />
                    </InputAdornment>
                  )
                }
              }}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              type="email"
              fullWidth
              required
              label="Correo electrónico"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon />
                    </InputAdornment>
                  )
                }
              }}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              fullWidth
              sx={{ mt: 1 }}
            >
              Guardar usuario
            </Button>
          </Grid>

        </Grid>
      </form>
    </Box>
  );
}

NewUserForm.propTypes = {
    title: PropTypes.string,
    onSubmit: PropTypes.func,
  roles: PropTypes.array,
  data: PropTypes.object,
};
