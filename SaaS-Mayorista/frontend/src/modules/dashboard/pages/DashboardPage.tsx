import { useEffect, useState } from 'react';
import { authApi } from '../../../shared/api/authApi';

export function DashboardPage() {
  const [me, setMe] = useState<any>(null);

  useEffect(() => {
    authApi.me().then(setMe).catch(() => setMe(null));
  }, []);

  return (
    <div className="card">
      <h2>Dashboard</h2>
      <p>Autenticacion activa y tenant aislado en backend.</p>
      <pre>{JSON.stringify(me, null, 2)}</pre>
    </div>
  );
}
