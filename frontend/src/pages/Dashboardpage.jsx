import React, { useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";

const Dashboard = () => {
  const { authState } = useContext(AuthContext);

  useEffect(() => {
    console.log("User data in authState:", authState.user);
  }, [authState.user]);

  if (authState.loading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1>Dashboard</h1>
      {authState.isAuthenticated && authState.user ? (
        <div>
          <h2>Welcome, {authState.user.username || "user"}!</h2>
          <p><strong>User ID:</strong> {authState.user.id}</p>
          <p><strong>Role:</strong> {authState.user.role}</p>
          <p><strong>Validated:</strong> {authState.user.isValidated ? "Yes" : "No"}</p>
          <p><strong>Profile Picture:</strong></p>
          <img src={authState.user.profilePicture} alt="Profile" width="100" />
        </div>
      ) : (
        <p>Please log in to see your information.</p>
      )}
    </div>
  );
};

export default Dashboard;
