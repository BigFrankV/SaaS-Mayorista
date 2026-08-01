import { Navigate } from 'react-router-dom';
import type { ReactElement } from 'react';
import { useAuthStore } from '../../../shared/store/authStore';

type RoleRouteProps = {
  roles: string[];
  children: ReactElement;
};

export function RoleRoute({ roles, children }: RoleRouteProps) {
  const user = useAuthStore((s) => s.user);
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (!roles.includes(user.rol)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}
