import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import Loading from "./Loading";

function ProtectedRoute({ children, requiredRole = null }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Wait for auth context to initialize from localStorage
  if (loading) {
    return <Loading message="Verifying session..." />;
  }

  // Redirect unauthenticated users to login while preserving intended URL
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Enforce role-based access control if requiredRole is specified
  if (requiredRole && user.role !== requiredRole) {
    if (user.role === "admin") {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;

