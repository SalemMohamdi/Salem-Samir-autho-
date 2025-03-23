import React from "react";
import Button from "../ui/Components/button"; 
import Placeholder from "../ui/Components/placeholder"; 
import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export const Logout = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      alert("Logged out successfully!");
      navigate("/"); // Redirect to login page
    } catch (error) {
      alert("Logout failed! " + error.message);
    }
  };

  return ( 
    <button
      onClick={handleLogout}
      className="bg-red-600 text-black px-4 py-2 rounded-md hover:bg-red-700"
    >
      Logout
    </button>
    
  );
};


