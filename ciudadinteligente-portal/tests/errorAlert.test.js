import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn()
  }
}));

import Swal from 'sweetalert2';
import { useErrorAlert, useSuccessAlert } from '../src/hooks/errorAlert.jsx';

describe('errorAlert hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('useErrorAlert muestra mensaje del backend cuando existe', () => {
    const { errorAlert } = useErrorAlert();

    errorAlert('Fallo', { response: { data: { message: 'Detalle backend' } } });

    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({
      icon: 'error',
      title: 'Fallo',
      text: 'Detalle backend'
    }));
  });

  it('useErrorAlert usa fallback cuando no hay detalle', () => {
    const { errorAlert } = useErrorAlert();

    errorAlert('Fallo', {});

    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({
      text: 'Error inesperado'
    }));
  });

  it('useSuccessAlert muestra mensaje de exito', () => {
    const { successAlert } = useSuccessAlert();

    successAlert('Listo', { message: 'Operacion exitosa' });

    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({
      icon: 'success',
      title: 'Listo',
      text: 'Operacion exitosa'
    }));
  });
});
