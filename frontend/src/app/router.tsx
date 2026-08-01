import { useEffect } from 'react';
import type { ReactElement } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { LandingPage } from '../modules/landing/pages/LandingPage';
import { RegistrationPage } from '../modules/landing/pages/RegistrationPage';
import { LoginPage } from '../modules/auth/pages/LoginPage';
import { ProductListPage } from '../modules/products/pages/ProductListPage';
import { POSPage } from '../modules/sales/pages/POSPage';
import { SalesListPage } from '../modules/sales/pages/SalesListPage';
import { DashboardPage } from '../modules/dashboard/pages/DashboardPage';
import { UserListPage } from '../modules/users/pages/UserListPage';
import { ClientsPage } from '../modules/clients/pages/ClientsPage';
import { RoleRoute } from '../modules/users/components/RoleRoute';
import { useAuthStore } from '../shared/store/authStore';
import { authApi } from '../shared/api/authApi';
import { AppLayout } from '../shared/ui/AppLayout';
import { NotFoundPage } from '../shared/pages/NotFoundPage';
import { ServerErrorPage } from '../shared/pages/ServerErrorPage';
import { ForbiddenPage } from '../shared/pages/ForbiddenPage';

const routeMeta: Record<string, { title: string; breadcrumb: string }> = {
  '/dashboard': { title: 'Resumen General', breadcrumb: 'Dashboard' },
  '/products': { title: 'Inventario', breadcrumb: 'Productos' },
  '/sales': { title: 'Listado de Ventas', breadcrumb: 'Ventas' },
  '/pos': { title: 'Punto de Venta', breadcrumb: 'POS' },
  '/clientes': { title: 'Clientes', breadcrumb: 'Clientes' },
  '/users': { title: 'Gestión de Usuarios', breadcrumb: 'Usuarios' },
};

function deriveRouteMeta(pathname: string) {
  const meta = routeMeta[pathname];
  if (meta) {
    return { title: meta.title, breadcrumb: [{ label: meta.breadcrumb }] };
  }
  return { title: 'SaaS Mayorista', breadcrumb: [] };
}

function ProtectedRoute({ children }: { children: ReactElement }) {
  const status = useAuthStore((s) => s.status);
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const clear = useAuthStore((s) => s.clear);

  useEffect(() => {
    if (status === 'authenticated' && accessToken && !user) {
      authApi.me().then(setUser).catch(() => clear());
    }
  }, [status, accessToken, user, setUser, clear]);

  if (status === 'loading') {
    return <div className="page-loading">Cargando sesión…</div>;
  }

  if (!accessToken || status !== 'authenticated') {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function PageWithLayout({ children, path }: { children: ReactElement; path: string }) {
  const { title, breadcrumb } = deriveRouteMeta(path);
  return (
    <AppLayout title={title} breadcrumb={breadcrumb}>
      {children}
    </AppLayout>
  );
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegistrationPage />} />
      <Route
        path="/products"
        element={
          <ProtectedRoute>
            <PageWithLayout path="/products">
              <ProductListPage />
            </PageWithLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales"
        element={
          <ProtectedRoute>
            <PageWithLayout path="/sales">
              <SalesListPage />
            </PageWithLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/pos"
        element={
          <ProtectedRoute>
            <PageWithLayout path="/pos">
              <POSPage />
            </PageWithLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <PageWithLayout path="/dashboard">
              <DashboardPage />
            </PageWithLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/clientes"
        element={
          <ProtectedRoute>
            <PageWithLayout path="/clientes">
              <ClientsPage />
            </PageWithLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <RoleRoute roles={['ADMIN']}>
              <PageWithLayout path="/users">
                <UserListPage />
              </PageWithLayout>
            </RoleRoute>
          </ProtectedRoute>
        }
      />
      {/* Error pages */}
      <Route path="/403" element={<ForbiddenPage />} />
      <Route path="/500" element={<ServerErrorPage />} />

      {/* Catch-all: 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
