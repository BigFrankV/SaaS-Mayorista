import { useEffect, useState } from 'react';
import { dashboardApi } from '../api/dashboardApi';
import type { DashboardKPI, VentaResumen } from '../../../shared/api/types';

function formatCurrency(n: number): string {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n);
}

type DashboardState = {
  kpi: DashboardKPI | null;
  recentSales: VentaResumen[];
  loading: boolean;
  error: string | null;
};

export function DashboardPage() {
  const [state, setState] = useState<DashboardState>({
    kpi: null,
    recentSales: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const [kpiData, salesData] = await Promise.all([
          dashboardApi.getKpis(),
          dashboardApi.getRecentSales(5),
        ]);
        if (!cancelled) {
          setState({
            kpi: kpiData,
            recentSales: salesData,
            loading: false,
            error: null,
          });
        }
      } catch {
        if (!cancelled) {
          setState((prev) => ({ ...prev, loading: false, error: 'Error al cargar datos del dashboard' }));
        }
      }
    };

    void load();
    return () => { cancelled = true; };
  }, []);

  if (state.loading) return <p>Cargando dashboard...</p>;
  if (state.error) return <p style={{ color: '#b91c1c' }}>{state.error}</p>;
  if (!state.kpi) return <p>No hay datos disponibles</p>;

  const { kpi, recentSales } = state;

  return (
    <div className="dashboard-page">
      {/* KPI Cards */}
      <div className="stats-grid mb-6">
        <div className="kpi-card">
          <div className="kpi-row">
            <div>
              <div className="kpi-label">Total Ventas Hoy</div>
              <div className="kpi-value">{formatCurrency(kpi.totalVentasHoy)}</div>
              <div className={`kpi-change ${kpi.cambioVsAyer >= 0 ? 'up' : ''}`}>
                {kpi.cambioVsAyer >= 0 ? '▲' : '▼'} {Math.abs(kpi.cambioVsAyer)}% vs ayer
              </div>
            </div>
            <div className="kpi-icon teal">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-row">
            <div>
              <div className="kpi-label">Productos Bajos Stock</div>
              <div className="kpi-value" style={{ color: 'var(--color-warning)' }}>{kpi.productosBajoStock}</div>
              <div className="kpi-change" style={{ color: 'var(--color-warning)' }}>⚠️ Requieren reposición</div>
            </div>
            <div className="kpi-icon orange">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-row">
            <div>
              <div className="kpi-label">Usuarios Activos</div>
              <div className="kpi-value" style={{ color: 'var(--color-info)' }}>{kpi.usuariosActivos}</div>
              <div className="kpi-change up">▲ 2 esta semana</div>
            </div>
            <div className="kpi-icon blue">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-row">
            <div>
              <div className="kpi-label">Ventas del Mes</div>
              <div className="kpi-value">{kpi.ventasDelMes}</div>
              <div className={`kpi-change ${kpi.cambioVsMesAnterior >= 0 ? 'up' : ''}`}>
                {kpi.cambioVsMesAnterior >= 0 ? '▲' : '▼'} {Math.abs(kpi.cambioVsMesAnterior)}% vs mes anterior
              </div>
            </div>
            <div className="kpi-icon green">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Últimas Ventas */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Últimas Ventas</span>
          <a href="/sales" className="text-sm" style={{ color: 'var(--color-primary)' }}>Ver todas →</a>
        </div>
        <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Folio</th>
                <th>Cliente</th>
                <th>RUT</th>
                <th className="text-right">Total</th>
                <th>Tipo</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {recentSales.map((venta) => (
                <tr key={venta.folio}>
                  <td className="font-medium">{venta.folio}</td>
                  <td>{venta.cliente}</td>
                  <td className="text-muted text-sm">{venta.rut}</td>
                  <td className="text-right font-semibold">{formatCurrency(venta.total)}</td>
                  <td>
                    <span className={`badge ${venta.tipo === 'FACTURA' ? 'badge-info' : 'badge-secondary'}`}>
                      {venta.tipo}
                    </span>
                  </td>
                  <td className="text-muted text-sm">{venta.fecha}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
