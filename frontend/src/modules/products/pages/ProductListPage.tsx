import { useEffect, useState, useCallback } from 'react';
import { productsApi, type CreateProductPayload } from '../../../shared/api/productsApi';
import { httpClient } from '../../../shared/api/httpClient';
import type { PageResponse, Product, UpdateProductPayload } from '../../../shared/api/types';
import { Modal } from '../../../shared/ui/Modal';

type CategoryOption = { id: string; nombre: string };

export function ProductListPage() {
  const [page, setPage] = useState<PageResponse<Product>>({
    content: [],
    totalElements: 0,
    totalPages: 0,
    number: 0,
    size: 20,
  });
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [search, setSearch] = useState('');
  const [categoria, setCategoria] = useState('');
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const load = useCallback(
    async (p = currentPage) => {
      setLoading(true);
      try {
        const data = await productsApi.list(p, 20, { search: search || undefined });
        setPage(data);
        setCurrentPage(data.number);
      } catch {
        setError('Error al cargar productos');
      } finally {
        setLoading(false);
      }
    },
    [currentPage, search],
  );

  useEffect(() => {
    void load(0);
    void loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadCategories = async () => {
    try {
      const { data } = await httpClient.get<{ id: string; nombre: string }[]>('/api/v1/categories');
      setCategories(data);
    } catch {
      // fallback to empty list — form dropdown will show nothing useful
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  };

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

  const handleFilter = () => {
    void load(0);
  };

  if (loading && page.content.length === 0) return <p>Cargando...</p>;
  if (error) return <p style={{ color: '#b91c1c' }}>{error}</p>;

  return (
    <div className="products-page">
      <div className="page-header">
        <h1>
          Inventario <span className="header-count">({page.totalElements} productos)</span>
        </h1>
        <button className="btn btn-primary" onClick={openCreate}>
          Nuevo Producto
        </button>
      </div>

      <div className="filter-bar">
        <input
          className="input"
          placeholder="Buscar producto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="select" value={categoria} onChange={(e) => setCategoria(e.target.value)} disabled={categoriesLoading}>
          <option value="">Todas las categorías</option>
          {categories.length === 0 && !categoriesLoading && (
            <option value="" disabled>Sin categorías</option>
          )}
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.nombre}
            </option>
          ))}
        </select>
        <button className="btn btn-primary" onClick={handleFilter}>
          Filtrar
        </button>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Stock</th>
                <th>Stock Mín.</th>
                <th>Precio Venta</th>
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
                    {p.stockBajo ? (
                      <span className="badge badge-warning">Stock bajo</span>
                    ) : (
                      <span className="badge badge-success">OK</span>
                    )}
                  </td>
                  <td>
                    <div className="actions">
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)}>
                        Editar
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(p.id)}>
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="pagination">
        <button
          className="page-btn"
          disabled={page.number === 0}
          onClick={() => load(page.number - 1)}
        >
          ‹ Anterior
        </button>
        <span className="page-info">
          Página {page.number + 1} de {page.totalPages}
        </span>
        <button
          className="page-btn"
          disabled={page.number >= page.totalPages - 1}
          onClick={() => load(page.number + 1)}
        >
          Siguiente ›
        </button>
      </div>

      <Modal
        open={modalMode !== null}
        onClose={closeModal}
        title={modalMode === 'edit' ? 'Editar Producto' : 'Nuevo Producto'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={closeModal}>
              Cancelar
            </button>
            <button className="btn btn-primary" type="submit" form="product-form">
              Guardar
            </button>
          </>
        }
      >
        <ProductForm
          mode={modalMode ?? 'create'}
          initial={editingProduct ?? undefined}
          categories={categories}
          categoriesLoading={categoriesLoading}
          onSubmit={async (data) => {
            if (modalMode === 'create') {
              await handleCreate(data as CreateProductPayload);
            } else if (editingProduct) {
              await handleUpdate(editingProduct.id, data as UpdateProductPayload);
            }
          }}
        />
      </Modal>
    </div>
  );
}

function ProductForm({
  mode,
  initial,
  categories,
  categoriesLoading,
  onSubmit,
}: {
  mode: 'create' | 'edit';
  initial?: Product;
  categories: CategoryOption[];
  categoriesLoading: boolean;
  onSubmit: (data: any) => Promise<void>;
}) {
  const [codigoBarras, setCodigoBarras] = useState(initial?.codigoBarras ?? '');
  const [nombre, setNombre] = useState(initial?.nombre ?? '');
  const [categoria, setCategoria] = useState(initial?.categoria ?? '');
  const [stockActual, setStockActual] = useState(initial?.stockActual ?? 0);
  const [stockMinimo, setStockMinimo] = useState(initial?.stockMinimo ?? 10);
  const [precioNeto, setPrecioNeto] = useState(initial?.precioNeto ?? 1000);
  const [descripcion, setDescripcion] = useState(initial?.descripcion ?? '');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const base = { nombre, stockActual, stockMinimo, precioNeto, categoria, descripcion };
      const payload =
        mode === 'create'
          ? { codigoBarras, ...base }
          : base;
      await onSubmit(payload);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form id="product-form" onSubmit={handleSubmit}>
      <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
        <label htmlFor="prod-nombre">Nombre</label>
        <input
          id="prod-nombre"
          className="input"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre del producto"
          required
        />
      </div>

      {mode === 'create' && (
        <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
          <label htmlFor="prod-codigo">Código de barras</label>
          <input
            id="prod-codigo"
            className="input"
            value={codigoBarras}
            onChange={(e) => setCodigoBarras(e.target.value)}
            placeholder="Código de barras"
            required
          />
        </div>
      )}

      <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
        <label htmlFor="prod-categoria">Categoría</label>
        <select
          id="prod-categoria"
          className="select"
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          disabled={categoriesLoading}
        >
          <option value="">Seleccionar categoría</option>
          {categories.length === 0 && !categoriesLoading && (
            <option value="" disabled>Sin categorías</option>
          )}
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
        <label htmlFor="prod-stock">Stock actual</label>
        <input
          id="prod-stock"
          className="input"
          type="number"
          value={stockActual}
          onChange={(e) => setStockActual(Number(e.target.value))}
          required
        />
      </div>

      <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
        <label htmlFor="prod-stock-min">Stock mínimo</label>
        <input
          id="prod-stock-min"
          className="input"
          type="number"
          value={stockMinimo}
          onChange={(e) => setStockMinimo(Number(e.target.value))}
          required
        />
      </div>

      <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
        <label htmlFor="prod-precio">Precio de venta</label>
        <input
          id="prod-precio"
          className="input"
          type="number"
          value={precioNeto}
          onChange={(e) => setPrecioNeto(Number(e.target.value))}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="prod-desc">Descripción</label>
        <textarea
          id="prod-desc"
          className="textarea"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Descripción del producto (opcional)"
          rows={3}
        />
      </div>

      {/* Hidden submit to allow Enter key */}
      <button type="submit" hidden disabled={submitting} />
    </form>
  );
}
