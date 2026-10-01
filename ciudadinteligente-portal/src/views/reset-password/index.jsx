import { useState } from 'react';

import { useNavigate } from "react-router-dom";
import { authResetPassword } from '../../api/auth';

import { useErrorAlert, useSuccessAlert } from '../../hooks/errorAlert';
import AuthPageShell from '../../components/Common/AuthPageShell';
import AuthDocumentForm from '../../components/Common/AuthDocumentForm';

export default function ResetPasswordPage () {
  const { errorAlert } = useErrorAlert();
  const { successAlert } = useSuccessAlert();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [dataForm, setDataForm] = useState({ username: '' });

  const handleReset = (e) => {
    e.preventDefault();
    setLoading(true);
    authResetPassword(dataForm)
      .then((res) => {
        successAlert('Correo enviado', res);
        setLoading(false);
        navigate('/login')
      })
      .catch((err) => { errorAlert("Error en la eliminación", err); setLoading(false); });
  };

  const submitDisabled = dataForm.username.length < 3 || loading;

  return (
    <AuthPageShell
      title="Recuperar contrasena"
      subtitle="Ingresa tu numero de documento para continuar"
    >
      <AuthDocumentForm
        dataForm={dataForm}
        setDataForm={setDataForm}
        onSubmit={handleReset}
        loading={loading}
        submitLabel="Enviar solicitud"
        submitDisabled={submitDisabled}
        secondaryLabel="Volver al inicio de sesion"
        onSecondaryClick={() => navigate('/login')}
      />
    </AuthPageShell>
  );
};
