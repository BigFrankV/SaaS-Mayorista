import { useNavigate } from 'react-router-dom';

type ErrorPageVariant = '400' | '403' | '404' | '500';

type ErrorPageConfig = {
  code: string;
  title: string;
  description: string;
  icon: 'shield' | 'search' | 'bug' | 'lock';
};

const variants: Record<ErrorPageVariant, ErrorPageConfig> = {
  '400': {
    code: '400',
    title: 'Solicitud inválida',
    description: 'La solicitud no pudo ser procesada. Verifica los datos e intenta nuevamente.',
    icon: 'bug',
  },
  '403': {
    code: '403',
    title: 'Acceso denegado',
    description: 'No tienes permisos para acceder a esta sección. Contacta al administrador si crees que esto es un error.',
    icon: 'lock',
  },
  '404': {
    code: '404',
    title: 'Página no encontrada',
    description: 'La página que buscas no existe o fue movida. Revisa la URL o vuelve al inicio.',
    icon: 'search',
  },
  '500': {
    code: '500',
    title: 'Error del servidor',
    description: 'Ocurrió un error interno. Ya lo estamos revisando. Intenta de nuevo en unos minutos.',
    icon: 'bug',
  },
};

function ErrorIcon({ icon }: { icon: ErrorPageConfig['icon'] }) {
  return (
    <div className={`error-icon error-icon--${icon} animate-float`}>
      {icon === 'search' && (
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
          <line x1="8" y1="11" x2="14" y2="11" />
        </svg>
      )}
      {icon === 'bug' && (
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="8" y="2" width="8" height="4" rx="1" />
          <path d="M4 10h16" />
          <path d="M4 14h16" />
          <path d="M4 18h16" />
          <path d="M8 6v12" />
          <path d="M16 6v12" />
        </svg>
      )}
      {icon === 'lock' && (
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          <circle cx="12" cy="16" r="1" />
        </svg>
      )}
      {icon === 'shield' && (
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      )}
    </div>
  );
}

type ErrorPageProps = {
  variant?: ErrorPageVariant;
  code?: string;
  title?: string;
  description?: string;
  icon?: ErrorPageConfig['icon'];
  showHome?: boolean;
  showBack?: boolean;
  showReload?: boolean;
  extraActions?: React.ReactNode;
};

export function ErrorPage({
  variant,
  code,
  title,
  description,
  icon,
  showHome = true,
  showBack = true,
  showReload = true,
  extraActions,
}: ErrorPageProps) {
  const navigate = useNavigate();
  const config = variant ? variants[variant] : null;

  const displayCode = code ?? config?.code ?? 'Error';
  const displayTitle = title ?? config?.title ?? 'Algo salió mal';
  const displayDescription = description ?? config?.description ?? 'Ocurrió un error inesperado.';
  const displayIcon = icon ?? config?.icon ?? 'bug';

  return (
    <div className="error-page">
      <div className="error-page-container animate-fade-in">
        <ErrorIcon icon={displayIcon} />

        <h1 className="error-code animate-slide-up">{displayCode}</h1>
        <p className="error-title animate-slide-up-delay">{displayTitle}</p>
        <p className="error-message animate-slide-up-delay-2">{displayDescription}</p>

        <div className="error-actions animate-slide-up-delay-2">
          {showReload && (
            <button className="btn btn-primary" onClick={() => window.location.reload()}>
              Recargar página
            </button>
          )}
          {showBack && (
            <button className="btn btn-secondary" onClick={() => navigate(-1)}>
              Volver atrás
            </button>
          )}
          {showHome && (
            <button className="btn btn-ghost" onClick={() => navigate('/')}>
              Ir al inicio
            </button>
          )}
          {extraActions}
        </div>
      </div>
    </div>
  );
}