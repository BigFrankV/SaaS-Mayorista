import { FormEvent, useEffect, useState } from 'react';
import { productsApi } from '../../../shared/api/productsApi';
import type { Product } from '../../../shared/api/types';

export function ProductListPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [form, setForm] = useState({
    codigoBarras: '',
    nombre: '',
    stockActual: 0,
    stockMinimo: 10,
    precioNeto: 1000
  });

  const load = async () => {
    const data = await productsApi.list();
    setItems(data);
  };

  useEffect(() => {
    void load();
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    await productsApi.create(form);
    setForm({ codigoBarras: '', nombre: '', stockActual: 0, stockMinimo: 10, precioNeto: 1000 });
    await load();
  };

  return (
    <div className="row">
      <div className="card" style={{ flex: 1, minWidth: 300 }}>
        <h2>Nuevo producto</h2>
        <form onSubmit={submit} style={{ display: 'grid', gap: '0.5rem' }}>
          <input placeholder="Codigo barras" value={form.codigoBarras} onChange={(e) => setForm({ ...form, codigoBarras: e.target.value })} />
          <input placeholder="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
          <input type="number" placeholder="Stock actual" value={form.stockActual} onChange={(e) => setForm({ ...form, stockActual: Number(e.target.value) })} />
          <input type="number" placeholder="Stock minimo" value={form.stockMinimo} onChange={(e) => setForm({ ...form, stockMinimo: Number(e.target.value) })} />
          <input type="number" placeholder="Precio neto" value={form.precioNeto} onChange={(e) => setForm({ ...form, precioNeto: Number(e.target.value) })} />
          <button>Guardar</button>
        </form>
      </div>

      <div className="card" style={{ flex: 2, minWidth: 400 }}>
        <h2>Inventario</h2>
        <table>
          <thead>
            <tr>
              <th>Codigo</th>
              <th>Nombre</th>
              <th>Stock</th>
              <th>Minimo</th>
              <th>Precio</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id}>
                <td>{p.codigoBarras}</td>
                <td>{p.nombre}</td>
                <td>{p.stockActual}</td>
                <td>{p.stockMinimo}</td>
                <td>${p.precioNeto}</td>
                <td>
                  {p.stockBajo ? <span className="badge warn">Stock bajo</span> : 'OK'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
