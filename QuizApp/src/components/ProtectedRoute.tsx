import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { isAdmin } from "../utils/roleUtils";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAdmin = false 
}) => {
  const { user, token, isLoggingOut } = useAuth();

  if (isLoggingOut) {
      return null;
  }

  // Not logged in at all
  if (!token || !user) {
    return <Navigate to="/LoginPage" replace state={{ message: "Please login to access this page." }} />;
  }

  // Logged in but not admin when admin is required
  if (requireAdmin && !isAdmin(user)) {
    return <Navigate to="/forbidden" replace />;
  }

  // Authorized - render the protected component
  return <>{children}</>;
};

export default ProtectedRoute;