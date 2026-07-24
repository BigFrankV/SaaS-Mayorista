import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tenantApi } from '../api/tenantApi';

export function RegistrationPage() {
  const navigate = useNavigate();

  const [nombreEmpresa, setNombreEmpresa] = useState('');
  const [rut, setRut] = useState('');
  const [giro, setGiro] = useState('');
  const [direccion, setDireccion] = useState('');
  const [adminNombre, setAdminNombre] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ mensaje: string; email: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const result = await tenantApi.register({
        nombreEmpresa,
        rut,
        giro: giro || undefined,
        direccion: direccion || undefined,
        adminNombre,
        adminEmail,
        adminPassword,
      });
      setSuccess({ mensaje: result.mensaje, email: adminEmail });
    } catch (err: any) {
      const message = err?.response?.data?.message ?? 'Error al registrar la empresa';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="login-logo">
            <div className="logo-icon">S</div>
            <div className="logo-text-block">
              <div className="logo-name">SaaS Mayorista</div>
              <div className="logo-sub">Registro exitoso</div>
            </div>
          </div>
          <div style={{ textAlign: 'center', padding: 'var(--space-6) 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>✅</div>
            <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)', marginBottom: 'var(--space-3)' }}>
              {success.mensaje}
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-2)' }}>
              Tu empresa ha sido registrada correctamente.
            </p>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)' }}>
              Puedes iniciar sesión con <strong>{success.email}</strong> y la contraseña que elegiste.
            </p>
            <button
              className="btn btn-primary btn-block btn-lg"
              onClick={() => navigate('/login')}
            >
              Ir a Iniciar Sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="logo-icon">S</div>
          <div className="logo-text-block">
            <div className="logo-name">SaaS Mayorista</div>
            <div className="logo-sub">Registra tu empresa</div>
          </div>
        </div>

        <p className="login-subtitle">
          Completa los datos para crear tu empresa y administrador
        </p>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="nombreEmpresa">Nombre de la empresa</label>
            <input
              id="nombreEmpresa"
              className="input"
              value={nombreEmpresa}
              onChange={(e) => setNombreEmpresa(e.target.value)}
              placeholder="Ej: Distribuidora del Sur Ltda."
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="rut">RUT empresa</label>
            <input
              id="rut"
              className="input"
              value={rut}
              onChange={(e) => setRut(e.target.value)}
              placeholder="Ej: 76.123.456-7"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="giro">Giro (opcional)</label>
            <input
              id="giro"
              className="input"
              value={giro}
              onChange={(e) => setGiro(e.target.value)}
              placeholder="Ej: Comercialización de alimentos"
            />
          </div>

          <div className="form-group">
            <label htmlFor="direccion">Dirección (opcional)</label>
            <input
              id="direccion"
              className="input"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              placeholder="Ej: Av. Siempre Viva 123"
            />
          </div>

          <hr className="form-divider" />

          <div className="form-group">
            <label htmlFor="adminNombre">Nombre del administrador</label>
            <input
              id="adminNombre"
              className="input"
              value={adminNombre}
              onChange={(e) => setAdminNombre(e.target.value)}
              placeholder="Ej: Juan Pérez"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="adminEmail">Correo electrónico</label>
            <input
              id="adminEmail"
              className="input"
              type="email"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              placeholder="admin@miempresa.cl"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="adminPassword">Contraseña</label>
            <input
              id="adminPassword"
              className="input"
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              minLength={6}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={loading}
          >
            {loading ? 'Registrando...' : 'Crear Empresa'}
          </button>

          {error && <p className="text-danger text-sm" style={{ textAlign: 'center' }}>{error}</p>}
        </form>

        <p className="login-footer-text">
          ¿Ya tienes cuenta?{' '}
          <a href="/login" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>
            Inicia sesión
          </a>
        </p>
      </div>
    </div>
  );
}
