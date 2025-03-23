import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const ProtectedRoute = () => {
  const { authState } = useContext(AuthContext);

  if (authState.loading) return <h2>Loading...</h2>;

  return authState.isAuthenticated ? <Outlet /> : <Navigate to="/" />;
};

export default ProtectedRoute;