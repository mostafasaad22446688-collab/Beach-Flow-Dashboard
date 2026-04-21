import { Navigate } from 'react-router';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

  if (!isAuthenticated) {
    // إعادة التوجيه إلى صفحة تسجيل الدخول
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}