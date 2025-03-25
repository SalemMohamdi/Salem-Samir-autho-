import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const UnauthorizedRedirect = () => {
  const { authState } = useContext(AuthContext);

  if (authState.loading) return <h2>Loading...</h2>;

  return authState.isAuthenticated ? <Navigate to="/propage" /> : <Outlet />;
};

export default UnauthorizedRedirect;