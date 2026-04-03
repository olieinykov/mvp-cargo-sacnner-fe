import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../../lib/utils/useAuthStore";

export const ProtectedRoute = () => {
  const { isLoggedIn } = useAuthStore();
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export const PublicRoute = () => {
  const { isLoggedIn } = useAuthStore();
  
  if (isLoggedIn) {
    return <Navigate to="/audits" replace />;
  }

  return <Outlet />;
};