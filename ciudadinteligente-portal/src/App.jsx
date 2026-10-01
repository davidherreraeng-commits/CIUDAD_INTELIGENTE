import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from './provider/useAuth';
import runDefaultApi from './api/default';
import LoginPage from "./views/login/index";
import HomeComponent from "./views/layout";
import ResetPasswordPage from "./views/reset-password";
import PublicInventory from "./views/public-inventory";

function App () {
  const { isAuth, logout, authUser } = useAuth();
  runDefaultApi({ logout: () => logout(authUser.userId) });

  return (
    <Routes>
      <Route path="/*" element={isAuth ? <HomeComponent /> : <Navigate to="/login" />} />
      <Route path="/login" element={!isAuth ? <LoginPage /> : <Navigate to="/projects"/>} />
      <Route path="/reset-password" element={!isAuth ? <ResetPasswordPage /> : <Navigate to="/projects"/>} />
      <Route path="/visor-datos" element={<PublicInventory />} />
    </Routes>
  )
}

export default App;
