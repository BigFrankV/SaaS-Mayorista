import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../../shared/api/authApi';
import { useAuthStore } from '../../../shared/store/authStore';

export function LoginPage() {
  const navigate = useNavigate();
  const setTokens = useAuthStore((s) => s.setTokens);

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
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'No fue posible autenticar');
    }
  };

  return (
    <div className="container" style={{ maxWidth: 520, paddingTop: '4rem' }}>
      <div className="card">
        <h1>SaaS Mayorista</h1>
        <p>Acceso seguro con Access Token + Refresh Token</p>

        <div className="row">
          <button type="button" onClick={() => setMode('login')}>Login</button>
          <button type="button" className="secondary" onClick={() => setMode('bootstrap')}>
            Bootstrap Empresa
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ marginTop: '1rem', display: 'grid', gap: '0.75rem' }}>
          {mode === 'bootstrap' && (
            <>
              <input value={tenantName} onChange={(e) => setTenantName(e.target.value)} placeholder="Nombre empresa" />
              <input value={rut} onChange={(e) => setRut(e.target.value)} placeholder="RUT empresa" />
              <input value={giro} onChange={(e) => setGiro(e.target.value)} placeholder="Giro" />
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre admin" />
            </>
          )}
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Correo" />
          <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contrasena" type="password" />
          <button type="submit">Continuar</button>
          {error && <p style={{ color: '#b91c1c' }}>{error}</p>}
        </form>
      </div>
    </div>
  );
}
