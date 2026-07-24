import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../../shared/api/authApi';
import { useAuthStore } from '../../../shared/store/authStore';

export function LoginPage() {
  const navigate = useNavigate();
  const setTokens = useAuthStore((s) => s.setTokens);
  const setUser = useAuthStore((s) => s.setUser);

  const [mode, setMode] = useState<'login' | 'bootstrap'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tenantName, setTenantName] = useState('Distribuidora Demo');
  const [rut, setRut] = useState('76123456-7');
  const [giro, setGiro] = useState('Comercializacion de alimentos');
  const [name, setName] = useState('Administrador');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const tokenData = mode === 'login'
        ? await authApi.login(email, password)
        : await authApi.bootstrap({
            nombreEmpresa: tenantName,
            rutEmpresa: rut,
            giroEmpresa: giro,
            nombreAdmin: name,
            emailAdmin: email,
            passwordAdmin: password
          });

      setTokens(tokenData.accessToken, tokenData.refreshToken);
      try {
        const me = await authApi.me();
        setUser(me);
      } catch { /* ignora error de perfil post-login */ }
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'No fue posible autenticar');
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="logo-icon">S</div>
          <div className="logo-text-block">
            <div className="logo-name">SaaS Mayorista</div>
            <div className="logo-sub">Plataforma de gestión comercial</div>
          </div>
        </div>

        <div className="login-tabs">
          <button
            type="button"
            className={`login-tab${mode === 'login' ? ' active' : ''}`}
            onClick={() => setMode('login')}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            className={`login-tab${mode === 'bootstrap' ? ' active' : ''}`}
            onClick={() => setMode('bootstrap')}
          >
            Registrar Empresa
          </button>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {mode === 'bootstrap' && (
            <>
              <div className="form-group">
                <label htmlFor="tenantName">Nombre de la empresa</label>
                <input
                  id="tenantName"
                  className="input"
                  value={tenantName}
                  onChange={(e) => setTenantName(e.target.value)}
                  placeholder="Ej: Distribuidora Demo"
                />
              </div>
              <div className="form-group">
                <label htmlFor="rut">RUT empresa</label>
                <input
                  id="rut"
                  className="input"
                  value={rut}
                  onChange={(e) => setRut(e.target.value)}
                  placeholder="Ej: 76123456-7"
                />
              </div>
              <div className="form-group">
                <label htmlFor="giro">Giro</label>
                <input
                  id="giro"
                  className="input"
                  value={giro}
                  onChange={(e) => setGiro(e.target.value)}
                  placeholder="Ej: Comercialización de alimentos"
                />
              </div>
              <div className="form-group">
                <label htmlFor="adminName">Nombre del administrador</label>
                <input
                  id="adminName"
                  className="input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Administrador"
                />
              </div>
              <hr className="form-divider" />
            </>
          )}

          <div className="form-group">
            <label htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block btn-lg">
            {mode === 'login' ? 'Iniciar Sesión' : 'Crear Empresa'}
          </button>

          {error && <p className="text-danger text-sm" style={{ textAlign: 'center' }}>{error}</p>}
        </form>

        <p className="login-footer-text">
          Acceso seguro con autenticación JWT
        </p>
      </div>
    </div>
  );
}
