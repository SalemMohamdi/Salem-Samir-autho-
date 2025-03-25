import { Navigate, Outlet, useLocation } from "react-router-dom"; 
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const ProtectedRoute = () => {
  const { authState } = useContext(AuthContext);
  const location = useLocation();

  if (authState.loading) return <h2>Loading...</h2>;

  // Allow unauthenticated users to go to login
  if (!authState.isAuthenticated) {
    return <Navigate to="/" />;
  }

  // Allow unvalidated users to access /logout, but restrict other protected routes
  if (!authState.user?.is_validated && location.pathname !== "/logout") {
    return   <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#EDE8DD] text-gray-800 p-6">
    <div className="bg-white shadow-lg rounded-2xl p-10 text-center max-w-md">
      <h2 className="text-3xl font-bold text-[#7C5C41] mb-4">
        Account Pending Validation
      </h2>
      <p className="text-lg text-gray-600 mb-6">
        Your account is awaiting admin approval. Please check back later or
        contact support for more information.
      </p>

     
     
    </div>
  </div>;   
  }

  return <Outlet />;
};

export default ProtectedRoute;
