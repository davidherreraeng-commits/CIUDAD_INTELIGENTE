import { Box, Button, Popover, Typography } from '@mui/material';

import PropTypes from "prop-types";
export default function ConfirmActionPopover({
  open,
  anchorEl,
  onClose,
  title,
  onConfirm,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar'
}) {
  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      transformOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Box sx={{ p: 2, maxWidth: 250 }}>
        <Typography sx={{ mb: 1 }}>
          {title}
        </Typography>
        <Button variant="contained" color="error" onClick={onConfirm}>
          {confirmLabel}
        </Button>
        <Button sx={{ ml: 1 }} onClick={onClose}>
          {cancelLabel}
        </Button>
      </Box>
    </Popover>
  );
}

ConfirmActionPopover.propTypes = {
    open: PropTypes.any,
    anchorEl: PropTypes.any,
    onClose: PropTypes.func,
    title: PropTypes.string,
    onConfirm: PropTypes.func,
    confirmLabel: PropTypes.string,
    cancelLabel: PropTypes.bool,
};
