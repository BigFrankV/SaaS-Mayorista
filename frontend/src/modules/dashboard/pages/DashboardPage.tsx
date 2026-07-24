import type { DashboardKPI, VentaResumen } from '../../../shared/api/types';

function formatCurrency(n: number): string {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n);
}

const MOCK_KPI: DashboardKPI = {
  totalVentasHoy: 2340500,
  productosBajoStock: 12,
  usuariosActivos: 8,
  ventasDelMes: 156,
  cambioVsAyer: 12.5,
  cambioVsMesAnterior: 8.3,
};

const MOCK_VENTAS: VentaResumen[] = [
  { folio: 'FAC-001', cliente: 'Distribuidora Norte', rut: '76543210-1', total: 458900, tipo: 'FACTURA', fecha: '2026-07-17' },
  { folio: 'BOL-001', cliente: 'Almacén San Pablo', rut: '12345678-5', total: 15200, tipo: 'BOLETA', fecha: '2026-07-17' },
  { folio: 'BOL-002', cliente: 'Minimarket Central', rut: '98765432-0', total: 34500, tipo: 'BOLETA', fecha: '2026-07-17' },
  { folio: 'FAC-002', cliente: 'Comercial del Sur', rut: '11122333-4', total: 782300, tipo: 'FACTURA', fecha: '2026-07-16' },
  { folio: 'FAC-003', cliente: 'Mayorista Los Andes', rut: '55667788-2', total: 1200500, tipo: 'FACTURA', fecha: '2026-07-16' },
  { folio: 'BOL-003', cliente: 'Botillería Express', rut: '22233444-1', total: 28700, tipo: 'BOLETA', fecha: '2026-07-16' },
];

export function DashboardPage() {
  return (
    <div className="dashboard-page">
      {/* KPI Cards */}
      <div className="stats-grid mb-6">
        <div className="kpi-card">
          <div className="kpi-row">
            <div>
              <div className="kpi-label">Total Ventas Hoy</div>
              <div className="kpi-value">{formatCurrency(MOCK_KPI.totalVentasHoy)}</div>
              <div className="kpi-change up">▲ {MOCK_KPI.cambioVsAyer}% vs ayer</div>
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
              <div className="kpi-value" style={{ color: 'var(--color-warning)' }}>{MOCK_KPI.productosBajoStock}</div>
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
              <div className="kpi-value" style={{ color: 'var(--color-info)' }}>{MOCK_KPI.usuariosActivos}</div>
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
              <div className="kpi-value">{MOCK_KPI.ventasDelMes}</div>
              <div className="kpi-change up">▲ {MOCK_KPI.cambioVsMesAnterior}% vs mes anterior</div>
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
          <a href="/pos" className="text-sm" style={{ color: 'var(--color-primary)' }}>Ver todas →</a>
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
              {MOCK_VENTAS.map((venta) => (
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
