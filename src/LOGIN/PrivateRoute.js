// PrivateRoute.js
import React from "react";
import { Route, Navigate } from "react-router-dom";

const PrivateRoute = ({ element, roles }) => {
  const isAuthenticated = localStorage.getItem("authenticated") === "true";
  const userRole = localStorage.getItem("userRole");

  if (isAuthenticated && roles.includes(userRole)) {
    return element;
  } else {
    return <Navigate to="/" replace />;
  }
};

export default PrivateRoute;
