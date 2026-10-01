import { useEffect, useMemo, useState } from "react";
import { authLogin, authLogout } from "../api/auth";
import { jwtDecode } from "jwt-decode";
import Swal from 'sweetalert2'
import PropTypes from "prop-types";
import { AuthContext } from './AuthContext';

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [isAuth, setIsAuth] = useState(localStorage.getItem("token") ? true : false);
  const [loading, setLoading] = useState(false);
  const [authUser, setAuthUser] = useState({
    userId: 0,
    roleId: 0,
    roleName: null,
    userProfile: {
      email: null,
      name: null,
      lastName: null,
    }
  })

  useEffect(() => {
    if (!token) {
      localStorage.removeItem("token");
      return;
    }

    localStorage.setItem("token", token);
  }, [token])

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      setUserDecode(token);
    }
  }, []);

  const setUserDecode = (token) => {
    const decoded = jwtDecode(token);
    setAuthUser(decoded);
    setToken(token);
    setIsAuth(true);
  }

  const login = useMemo(() => async (dataForm) => {
    try {
      setLoading(true);
      const res = await authLogin(dataForm);
      const data = res.data;

      Swal.fire({
        icon: "success",
        title: "Ingreso",
        text: res.message,
        timer: 2000,
        showConfirmButton: false,
        timerProgressBar: true,
      });

      if (data?.token) {
        setUserDecode(data.token);
      }

      setIsAuth(true);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "No se pudo iniciar sesión",
        text: err.response?.data?.message || "Error inesperado",
        timer: 2000,
        showConfirmButton: false,
        timerProgressBar: true,
      });

      setIsAuth(false);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useMemo(() => async (userId) => {
    try {
      setLoading(true);
      await authLogout(userId);
    } catch {
      // Ignore logout errors, cleanup state in finally
    } finally {
      setToken(null);
      setLoading(false);
      setIsAuth(false);
    }
  }, []);

  const contextValue = useMemo(() =>
    ({ token, loading, isAuth, authUser }),
    [token, loading, isAuth, authUser]
  );

  return (
    <AuthContext.Provider
      value={{ ...contextValue, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
    children: PropTypes.node,
};
