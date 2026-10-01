import { TextField, Stack, InputAdornment, Button } from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import AccountCircle from '@mui/icons-material/AccountCircle';
import LockOutlined from '@mui/icons-material/LockOutlined';

import PropTypes from "prop-types";
const secondaryButtonSx = {
  mt: 1,
  textTransform: 'none',
  fontWeight: 'medium',
  color: '#1976d2',
  fontSize: '0.95rem',
  transition: 'all 0.25s ease',
  '&:hover': {
    color: '#0d47a1',
    textDecoration: 'underline',
    backgroundColor: 'transparent'
  }
};

export default function AuthDocumentForm({
  dataForm,
  setDataForm,
  onSubmit,
  includePassword = false,
  loading = false,
  submitLabel,
  submitDisabled,
  secondaryLabel,
  onSecondaryClick
}) {
  return (
    <form onSubmit={onSubmit}>
      <Stack spacing={3} sx={{ mt: 2 }}>
        <TextField
          autoComplete='off'
          name='username'
          label="Número de documento"
          variant="outlined"
          size="medium"
          fullWidth
          margin="normal"
          required
          type='text'
          value={dataForm.username}
          onChange={(event) => {
            if (/^\d*$/.test(event.target.value)) {
              setDataForm((prevDataForm) => ({ ...prevDataForm, username: event.target.value }));
            }
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <AccountCircle />
                </InputAdornment>
              ),
            },
          }}
        />

        {includePassword && (
          <TextField
            name='password'
            label="Contraseña"
            type="password"
            variant="outlined"
            size="medium"
            fullWidth
            margin="normal"
            required
            onChange={(event) => setDataForm((prevDataForm) => ({ ...prevDataForm, password: event.target.value }))}
            value={dataForm.password}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlined />
                  </InputAdornment>
                ),
              }
            }}
          />
        )}

        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={submitDisabled}
          loading={loading}
          loadingPosition="end"
          startIcon={<LoginIcon fontSize="medium" />}
          sx={{ mt: 3, py: 1.5, fontWeight: 'bold', borderRadius: 3, fontSize: '1rem', textTransform: 'none' }}
        >
          {submitLabel}
        </Button>

        <Button
          variant="text"
          color="secondary"
          onClick={onSecondaryClick}
          sx={secondaryButtonSx}
        >
          {secondaryLabel}
        </Button>
      </Stack>
    </form>
  );
}

AuthDocumentForm.propTypes = {
    dataForm: PropTypes.array,
    setDataForm: PropTypes.array,
    onSubmit: PropTypes.func,
    includePassword: PropTypes.object,
    loading: PropTypes.any,
    submitLabel: PropTypes.string,
    submitDisabled: PropTypes.any,
    secondaryLabel: PropTypes.string,
    onSecondaryClick: PropTypes.func,
};
