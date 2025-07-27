
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { 
    resendEmailVerification, 
    user, 
    isLoading, 
    pendingVerification 
  } = useAuth();
  
  if (!user) return <Navigate to="/cadastro" replace />;
  if (!user?.isVerified) return <Navigate to="/login" replace />;

  return <>{children}</>;
};

export default ProtectedRoute;