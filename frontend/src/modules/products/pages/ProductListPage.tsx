import { useEffect, useState } from 'react';
import { productsApi, type CreateProductPayload } from '../../../shared/api/productsApi';
import type { PageResponse, Product, UpdateProductPayload } from '../../../shared/api/types';

export function ProductListPage() {
  const [page, setPage] = useState<PageResponse<Product>>({ content: [], totalElements: 0, totalPages: 0, number: 0, size: 20 });
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const load = async (p = currentPage) => {
    setLoading(true);
    try {
      const data = await productsApi.list(p, 20);
      setPage(data);
      setCurrentPage(data.number);
    } catch {
      setError('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(0); }, []);

  const handleCreate = async (payload: CreateProductPayload) => {
    await productsApi.create(payload);
    setModalMode(null);
    await load(0);
  };

  const handleUpdate = async (id: string, payload: UpdateProductPayload) => {
    await productsApi.update(id, payload);
    setModalMode(null);
    setEditingProduct(null);
    await load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este producto?')) return;
    await productsApi.delete(id);
    await load();
  };

  const openCreate = () => {
    setEditingProduct(null);
    setModalMode('create');
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setModalMode('edit');
  };

  const closeModal = () => {
    setModalMode(null);
    setEditingProduct(null);
  };

  if (loading && page.content.length === 0) return <p>Cargando...</p>;
  if (error) return <p style={{ color: '#b91c1c' }}>{error}</p>;

  return (
    <div>
      <div className="row">
        <h2>Inventario ({page.totalElements} productos)</h2>
        <button onClick={openCreate}>Nuevo Producto</button>
      </div>

      {modalMode && (
        <Modal onClose={closeModal}>
          <ProductForm
            mode={modalMode}
            initial={editingProduct ?? undefined}
            onSubmit={modalMode === 'create'
              ? (data) => handleCreate(data as CreateProductPayload)
              : (data) => handleUpdate(editingProduct!.id, data as UpdateProductPayload)
            }
            onCancel={closeModal}
          />
        </Modal>
      )}

      <table>
        <thead>
          <tr>
            <th>Código</th>
            <th>Nombre</th>
            <th>Stock</th>
            <th>Mínimo</th>
            <th>Precio</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {page.content.map((p) => (
            <tr key={p.id}>
              <td>{p.codigoBarras}</td>
              <td>{p.nombre}</td>
              <td>{p.stockActual}</td>
              <td>{p.stockMinimo}</td>
              <td>${p.precioNeto.toLocaleString()}</td>
              <td>
                {p.stockBajo
                  ? <span className="badge warn">Stock bajo</span>
                  : <span className="badge success">OK</span>
                }
              </td>
              <td>
                <button onClick={() => openEdit(p)}>Editar</button>
                <button className="secondary" onClick={() => handleDelete(p.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="row" style={{ marginTop: '1rem', alignItems: 'center', gap: '1rem' }}>
        <button disabled={page.number === 0} onClick={() => load(page.number - 1)}>Anterior</button>
        <span>Página {page.number + 1} de {page.totalPages}</span>
        <button disabled={page.number >= page.totalPages - 1} onClick={() => load(page.number + 1)}>Siguiente</button>
      </div>
    </div>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>
        {children}
      </div>
    </div>
  );
}

function ProductForm({
  mode,
  initial,
  onSubmit,
  onCancel,
}: {
  mode: 'create' | 'edit';
  initial?: Product;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}) {
  const [codigoBarras, setCodigoBarras] = useState(initial?.codigoBarras ?? '');
  const [nombre, setNombre] = useState(initial?.nombre ?? '');
  const [stockActual, setStockActual] = useState(initial?.stockActual ?? 0);
  const [stockMinimo, setStockMinimo] = useState(initial?.stockMinimo ?? 10);
  const [precioNeto, setPrecioNeto] = useState(initial?.precioNeto ?? 1000);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = mode === 'create'
        ? { codigoBarras, nombre, stockActual, stockMinimo, precioNeto }
        : { nombre, stockActual, stockMinimo, precioNeto };
      await onSubmit(payload);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.75rem', minWidth: 340 }}>
      <h3 style={{ marginTop: 0 }}>{mode === 'edit' ? 'Editar Producto' : 'Nuevo Producto'}</h3>
      {mode === 'create' && (
        <input value={codigoBarras} onChange={(e) => setCodigoBarras(e.target.value)} placeholder="Código de barras" required />
      )}
      <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre" required />
      <input type="number" value={stockActual} onChange={(e) => setStockActual(Number(e.target.value))} placeholder="Stock actual" required />
      <input type="number" value={stockMinimo} onChange={(e) => setStockMinimo(Number(e.target.value))} placeholder="Stock mínimo" required />
      <input type="number" value={precioNeto} onChange={(e) => setPrecioNeto(Number(e.target.value))} placeholder="Precio neto" required />
      <div className="row" style={{ marginTop: '0.5rem' }}>
        <button type="submit" disabled={submitting}>{submitting ? 'Guardando...' : 'Guardar'}</button>
        <button type="button" className="secondary" onClick={onCancel}>Cancelar</button>
      </div>
    </form>
  );
}
