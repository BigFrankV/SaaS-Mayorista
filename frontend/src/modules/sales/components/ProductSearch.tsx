import { useState, useEffect, type ChangeEvent } from 'react';
import { productsApi } from '../../../shared/api/productsApi';
import type { Product } from '../../../shared/api/types';

interface ProductSearchProps {
  onAdd: (product: Product) => void;
}

export function ProductSearch({ onAdd }: ProductSearchProps) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (!search.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const page = await productsApi.list(0, 10, { search: search.trim() });
        setResults(page.content);
        setSearched(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleSearch = () => {
    // Force a search even if already searching (triggers useEffect re-evaluation)
    if (search.trim()) {
      setSearched(true);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Buscar Producto</h3>
      </div>
      <div className="card-body">
        <div className="search-bar">
          <span className="search-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            type="text"
            className="search-input"
            placeholder="Nombre o código de barras..."
            value={search}
            onChange={handleChange}
            autoFocus
          />
          <button type="button" className="search-btn" onClick={handleSearch}>
            Buscar
          </button>
        </div>

        {loading && (
          <div className="empty-state" style={{ padding: '2rem 0' }}>
            <p className="text-muted">Buscando...</p>
          </div>
        )}

        {!loading && searched && results.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <p className="empty-title">Sin resultados</p>
            <p className="empty-desc">No se encontraron productos para "{search}"</p>
          </div>
        )}

        {results.length > 0 && (
          <div className="table-wrapper" style={{ marginTop: '0.75rem' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Producto</th>
                  <th>Stock</th>
                  <th>Precio</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {results.map((product) => (
                  <tr key={product.id}>
                    <td>{product.codigoBarras}</td>
                    <td>{product.nombre}</td>
                    <td>
                      <span className={`badge ${product.stockBajo ? 'badge-warning' : 'badge-success'}`}>
                        {product.stockActual}
                      </span>
                    </td>
                    <td>${product.precioNeto.toLocaleString('es-CL')}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => onAdd(product)}
                        disabled={product.stockActual <= 0}
                        title={product.stockActual <= 0 ? 'Sin stock disponible' : 'Agregar al carrito'}
                      >
                        +
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
