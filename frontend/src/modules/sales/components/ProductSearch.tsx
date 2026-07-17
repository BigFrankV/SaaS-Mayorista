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

  return (
    <div className="card">
      <h3>Buscar Producto</h3>
      <input
        type="text"
        placeholder="Nombre o código de barras..."
        value={search}
        onChange={handleChange}
        autoFocus
        style={{ width: '100%', marginBottom: '0.75rem' }}
      />

      {loading && <p style={{ color: '#64748b' }}>Buscando...</p>}

      {!loading && searched && results.length === 0 && (
        <p style={{ color: '#64748b' }}>Sin resultados</p>
      )}

      {results.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Código</th>
              <th>Stock</th>
              <th>Precio</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {results.map((product) => (
              <tr key={product.id}>
                <td>{product.nombre}</td>
                <td>{product.codigoBarras}</td>
                <td>
                  <span className={`badge ${product.stockBajo ? 'warn' : 'success'}`}>
                    {product.stockActual}
                  </span>
                </td>
                <td>${product.precioNeto.toLocaleString('es-CL')}</td>
                <td>
                  <button
                    type="button"
                    onClick={() => onAdd(product)}
                    disabled={product.stockActual <= 0}
                    title={product.stockActual <= 0 ? 'Sin stock disponible' : 'Agregar al carrito'}
                  >
                    {product.stockActual <= 0 ? 'Sin stock' : 'Agregar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
