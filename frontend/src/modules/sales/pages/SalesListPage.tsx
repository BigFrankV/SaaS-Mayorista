import { useEffect, useState, useCallback } from 'react';
import { salesApi, type SaleFilters } from '../api/salesApi';
import type { PageResponse, SaleResponse } from '../../../shared/api/types';

function formatCurrency(n: number): string {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n);
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function SalesListPage() {
  const [page, setPage] = useState(0);
  const [size] = useState(20);
  const [filters, setFilters] = useState<SaleFilters>({});
  const [data, setData] = useState<PageResponse<SaleResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelId, setCancelId] = useState<string | null>(null);

  // Local filter state (applied on button click)
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [search, setSearch] = useState('');
  const [tipoDocumento, setTipoDocumento] = useState('');
  const [soloAnuladas, setSoloAnuladas] = useState(false);

  const load = useCallback(async (p: number, f: SaleFilters) => {
    setLoading(true);
    setError(null);
    try {
      const result = await salesApi.list(p, size, f);
      setData(result);
    } catch {
      setError('Error al cargar ventas');
    } finally {
      setLoading(false);
    }
  }, [size]);

  useEffect(() => {
    void load(page, filters);
  }, [page, filters, load]);

  const applyFilters = () => {
    const f: SaleFilters = {};
    if (fechaDesde) f.fechaDesde = fechaDesde;
    if (fechaHasta) f.fechaHasta = fechaHasta;
    if (search.trim()) f.search = search.trim();
    if (tipoDocumento) f.tipoDocumento = tipoDocumento;
    if (soloAnuladas) f.anulada = true;
    setFilters(f);
    setPage(0);
  };

  const clearFilters = () => {
    setFechaDesde('');
    setFechaHasta('');
    setSearch('');
    setTipoDocumento('');
    setSoloAnuladas(false);
    setFilters({});
    setPage(0);
  };

  const handleCancel = async (id: string) => {
    if (!confirm('¿Anular esta venta? Se restaurará el stock de los productos.')) return;
    setCancelId(id);
    try {
      await salesApi.deleteSale(id);
      void load(page, filters);
    } catch {
      alert('Error al anular la venta');
    } finally {
      setCancelId(null);
    }
  };

  return (
    <div className="sales-list-page">
      {/* Filter bar */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="grid grid-cols-6 gap-3" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'end' }}>
            <div style={{ flex: '1 1 140px', minWidth: 0 }}>
              <label className="form-label">Desde</label>
              <input type="date" className="form-input" value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)} />
            </div>
            <div style={{ flex: '1 1 140px', minWidth: 0 }}>
              <label className="form-label">Hasta</label>
              <input type="date" className="form-input" value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)} />
            </div>
            <div style={{ flex: '2 1 200px', minWidth: 0 }}>
              <label className="form-label">Buscar (RUT / Cliente)</label>
              <input type="text" className="form-input" placeholder="RUT o nombre del cliente..."
                value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div style={{ flex: '1 1 120px', minWidth: 0 }}>
              <label className="form-label">Documento</label>
              <select className="form-input" value={tipoDocumento}
                onChange={(e) => setTipoDocumento(e.target.value)}>
                <option value="">Todos</option>
                <option value="BOLETA">Boleta</option>
                <option value="FACTURA">Factura</option>
              </select>
            </div>
            <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', paddingTop: '18px' }}>
              <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input type="checkbox" checked={soloAnuladas}
                  onChange={(e) => setSoloAnuladas(e.target.checked)} />
                Solo anuladas
              </label>
            </div>
            <div style={{ flex: '0 0 auto', display: 'flex', gap: '8px', paddingTop: '18px' }}>
              <button className="btn btn-primary" onClick={applyFilters}>Filtrar</button>
              <button className="btn btn-secondary" onClick={clearFilters}>Limpiar</button>
            </div>
          </div>
        </div>
      </div>

      {/* Data table */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Ventas {data ? `(${data.totalElements})` : ''}</span>
        </div>
        {loading ? (
          <div className="card-body"><p className="text-muted">Cargando ventas...</p></div>
        ) : error ? (
          <div className="card-body"><p style={{ color: '#b91c1c' }}>{error}</p></div>
        ) : data && data.content.length === 0 ? (
          <div className="card-body">
            <p className="text-muted">No se encontraron ventas{Object.keys(filters).length > 0 ? ' con los filtros aplicados' : ''}.</p>
          </div>
        ) : (
          <>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Folio</th>
                    <th>Cliente</th>
                    <th>RUT</th>
                    <th>Total</th>
                    <th>Documento</th>
                    <th>Vendedor</th>
                    <th>Fecha</th>
                    <th>Estado</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.content.map((venta) => (
                    <tr key={venta.id} className={venta.anulada ? 'row-anulada' : ''}>
                      <td className="font-medium">{venta.id.slice(0, 8)}</td>
                      <td>{venta.nombreCliente || venta.rutCliente || '-'}</td>
                      <td className="text-muted text-sm">{venta.rutCliente || '-'}</td>
                      <td className="text-right font-semibold">{formatCurrency(venta.total)}</td>
                      <td>
                        <span className={`badge ${venta.tipoDocumento === 'FACTURA' ? 'badge-info' : 'badge-secondary'}`}>
                          {venta.tipoDocumento}
                        </span>
                      </td>
                      <td className="text-sm">{venta.usuarioNombre || 'Desconocido'}</td>
                      <td className="text-muted text-sm">{formatDate(venta.fechaVenta)}</td>
                      <td>
                        {venta.anulada ? (
                          <span className="badge badge-danger">Anulada</span>
                        ) : (
                          <span className="badge badge-success">Activa</span>
                        )}
                      </td>
                      <td>
                        {!venta.anulada && (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleCancel(venta.id)}
                            disabled={cancelId === venta.id}
                          >
                            {cancelId === venta.id ? '...' : 'Anular'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {data && data.totalPages > 1 && (
              <div className="card-footer" style={{ display: 'flex', justifyContent: 'center', gap: '8px', padding: '12px' }}>
                <button className="btn btn-sm btn-secondary"
                  disabled={page === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}>
                  Anterior
                </button>
                <span style={{ display: 'flex', alignItems: 'center', padding: '0 12px' }}>
                  Página {data.number + 1} de {data.totalPages}
                </span>
                <button className="btn btn-sm btn-secondary"
                  disabled={page >= data.totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}>
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}