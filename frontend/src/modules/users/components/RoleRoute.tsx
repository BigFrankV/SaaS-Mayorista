import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../../shared/store/authStore';

type RoleRouteProps = {
  roles: string[];
  children: JSX.Element;
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
