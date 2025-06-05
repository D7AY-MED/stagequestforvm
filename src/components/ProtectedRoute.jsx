import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { studentSupabase, getUserRole } from "../lib/supabaseClient";

const ProtectedRoute = ({ children, requiredRole, redirectPath = '/login' }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        const { data: { session } } = await studentSupabase.auth.getSession();
        if (isMounted) {
          setIsAuthenticated(!!session);
          
          if (session) {
            const role = await getUserRole();
            setUserRole(role);
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        if (isMounted) {
          setIsAuthenticated(false);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (isMounted) {
        setIsAuthenticated(!!session);
        if (session) {
          const role = await getUserRole();
          setUserRole(role);
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);  // Remove navigate and requiredRole from dependencies

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    // Redirect to login page but save the attempted location for redirecting back after login
    return <Navigate to={redirectPath} state={{ from: location.pathname }} replace />;
  }

  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/" />;
  }

  // If authenticated, render the child routes
  return children ? children : <Outlet />;
};

export default ProtectedRoute;