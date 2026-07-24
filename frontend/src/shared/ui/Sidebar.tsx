import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import type { MeResponse } from '../api/types';

type SidebarProps = {
  user: MeResponse | null;
  isAdmin: boolean;
};

const navItems = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    label: 'Productos',
    path: '/products',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
    badge: '342',
  },
  {
    label: 'POS',
    path: '/pos',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
  },
  {
    label: 'Usuarios',
    path: '/users',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    badge: 'Admin',
    adminOnly: true,
  },
];

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function Sidebar({ user, isAdmin }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNav = (path: string) => {
    navigate(path);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">S</div>
        <div className="logo-text-block">
          <div className="logo-text">SaaS Mayorista</div>
          <div className="logo-sub">Panel de Control</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-label">Navegación</div>
        {navItems.map((item) => {
          if (item.adminOnly && !isAdmin) return null;

          const isActive = location.pathname === item.path ||
            (item.path === '/dashboard' && location.pathname === '/');

          return (
            <a
              key={item.path}
              className={`nav-item${isActive ? ' active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                handleNav(item.path);
              }}
              href={item.path}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
              {item.badge && (
                <span className={`badge ${item.adminOnly ? 'badge-info' : 'badge-secondary'} nav-badge`}>
                  {item.badge}
                </span>
              )}
            </a>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="avatar" style={{ background: 'var(--color-primary)' }}>
          {user ? getInitials(user.nombre) : '?'}
        </div>
        <div className="user-info">
          <div className="user-name">{user?.nombre ?? 'Sin sesión'}</div>
          <div className="user-role">
            {user?.rol === 'ADMIN' ? 'Administrador' : user?.rol === 'VENDEDOR' ? 'Vendedor' : ''}
          </div>
        </div>
      </div>
    </aside>
  );
}
