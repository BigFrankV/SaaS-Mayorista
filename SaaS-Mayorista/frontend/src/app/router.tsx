import { useEffect } from 'react';
import { Navigate, Route, Routes, Link } from 'react-router-dom';
import { LoginPage } from '../modules/auth/pages/LoginPage';
import { ProductListPage } from '../modules/products/pages/ProductListPage';
import { POSPage } from '../modules/sales/pages/POSPage';
import { DashboardPage } from '../modules/dashboard/pages/DashboardPage';
import { UserListPage } from '../modules/users/pages/UserListPage';
import { RoleRoute } from '../modules/users/components/RoleRoute';
import { useAuthStore } from '../shared/store/authStore';
import { authApi } from '../shared/api/authApi';

function Layout({ children }: { children: React.ReactNode }) {
  const clear = useAuthStore((s) => s.clear);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const user = useAuthStore((s) => s.user);
  const isAdmin = useAuthStore((s) => s.isAdmin);

  return (
    <div className="container">
      <div className="nav">
        <Link className="card" to="/dashboard">Dashboard</Link>
        <Link className="card" to="/products">Productos</Link>
        <Link className="card" to="/pos">POS</Link>
        {isAdmin() && <Link className="card" to="/users">Usuarios</Link>}
        <span style={{ marginLeft: 'auto', padding: '0.5rem' }}>
          {user?.nombre ?? ''} ({user?.rol ?? ''})
        </span>
        <button
          className="secondary"
          onClick={() => {
            if (refreshToken) {
              void fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/logout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken })
              });
            }
            clear();
          }}
        >
          Cerrar sesion
        </button>
      </div>
      {children}
    </div>
  );
}

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const clear = useAuthStore((s) => s.clear);

  useEffect(() => {
    if (accessToken && !user) {
      authApi.me().then(setUser).catch(() => clear());
    }
  }, [accessToken, user]);

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/products"
        element={
          <ProtectedRoute>
            <Layout><ProductListPage /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/pos"
        element={
          <ProtectedRoute>
            <Layout><POSPage /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout><DashboardPage /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <RoleRoute roles={['ADMIN']}>
              <Layout><UserListPage /></Layout>
            </RoleRoute>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
