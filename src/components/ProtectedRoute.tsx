import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/data/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'cashier';
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, hasRole } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center animate-fade-in">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground text-sm mb-6">
            You need <span className="font-semibold capitalize">{requiredRole}</span> privileges to access this area.
          </p>
          <p className="text-xs text-muted-foreground">
            Demo: login as <span className="font-mono">pinkcity.feni@gmail.com</span> / <span className="font-mono">rihan56</span>
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
