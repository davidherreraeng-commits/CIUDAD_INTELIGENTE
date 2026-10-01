import { createContext } from 'react';

export const AuthContext = createContext({
  isAuth: Boolean(localStorage.getItem("token")),
  token: localStorage.getItem("token") || null,
  login: () => { },
  logout: () => { },
});
