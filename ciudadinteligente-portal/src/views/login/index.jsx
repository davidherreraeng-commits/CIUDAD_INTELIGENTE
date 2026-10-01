import { useState } from 'react';

import { useNavigate } from "react-router-dom";
import { useAuth } from '../../provider/useAuth';
import AuthPageShell from '../../components/Common/AuthPageShell';
import AuthDocumentForm from '../../components/Common/AuthDocumentForm';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();

  const [dataForm, setDataForm] = useState({ username: '', password: '' });

  const handleLogin = (e) => {
    e.preventDefault();
    login(dataForm);
  };

  const submitDisabled = Object.values(dataForm).some((value) => String(value).length < 3) || loading;

  return (
    <AuthPageShell
      title="Inicio de Sesion"
      subtitle="Accede a la plataforma Ciudad Inteligente"
    >
      <AuthDocumentForm
        dataForm={dataForm}
        setDataForm={setDataForm}
        onSubmit={handleLogin}
        includePassword
        loading={loading}
        submitLabel="Ingresar"
        submitDisabled={submitDisabled}
        secondaryLabel="Olvide mi contrasena"
        onSecondaryClick={() => navigate('/reset-password')}
      />
    </AuthPageShell>
  );
};
