
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface ProtectedRouteProps {
  requireAuth?: boolean;
  requireAdmin?: boolean;
}

const ProtectedRoute = ({ 
  requireAuth = true, 
  requireAdmin = false 
}: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();
  
  // Show nothing while checking auth status
  if (isLoading) {
    return null;
  }
  
  // Redirect to login if not authenticated and auth is required
  if (requireAuth && !user) {
    return <Navigate to="/login" replace />;
  }
  
  // Redirect to home if not admin and admin is required
  if (requireAdmin && (!user || !user.isAdmin)) {
    return <Navigate to="/" replace />;
  }
  
  // Redirect to home if already logged in and trying to access login/register
  if (!requireAuth && user) {
    return <Navigate to="/" replace />;
  }
  
  return <Outlet />;
};

export default ProtectedRoute;
