import type { MeResponse, UserRol } from '../api/types';

const ROLE_LABELS: Record<UserRol, string> = {
  ADMIN: 'Administrador',
  VENDEDOR: 'Vendedor',
  BODEGUERO: 'Bodeguero',
  CONTADOR: 'Contador',
};

type TopbarProps = {
  title: string;
  breadcrumb: Array<{ label: string; path?: string }>;
  user: MeResponse | null;
  onLogout: () => void;
  onToggleSidebar?: () => void;
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function Topbar({ title, breadcrumb, user, onLogout, onToggleSidebar }: TopbarProps) {
  return (
    <header className="topbar">
      <button className="mobile-toggle" onClick={onToggleSidebar} aria-label="Toggle sidebar">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      <div className="topbar-breadcrumb">
        {breadcrumb.map((crumb, i) => (
          <span key={i}>
            {i > 0 && <span style={{ margin: '0 0.25rem' }}>/</span>}
            {crumb.label}
          </span>
        ))}
      </div>

      <div className="topbar-title">{title}</div>

      <div className="topbar-right">
        <div className="topbar-user">
          <div className="user-details">
            <div className="name">{user?.nombre ?? ''}</div>
            <div className="role">
              {user ? ROLE_LABELS[user.rol as UserRol] ?? user.rol : ''}
            </div>
          </div>
          <div className="avatar" style={{ background: 'var(--color-primary)' }}>
            {user ? getInitials(user.nombre) : '?'}
          </div>
        </div>

        <button className="btn btn-ghost btn-sm" onClick={onLogout}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Salir
        </button>
      </div>
    </header>
  );
}
