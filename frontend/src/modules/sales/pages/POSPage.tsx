import { useReducer, useState } from 'react';
import type { Product } from '../../../shared/api/types';
import type { CartItem } from '../../../shared/api/types';
import { salesApi } from '../api/salesApi';
import { ProductSearch } from '../components/ProductSearch';
import { CartItemRow } from '../components/CartItem';

// ── Reducer ──────────────────────────────────────────────

type CartAction =
  | { type: 'ADD'; producto: Product }
  | { type: 'REMOVE'; productoId: string }
  | { type: 'UPDATE_CANTIDAD'; productoId: string; cantidad: number }
  | { type: 'CLEAR' };

function cartReducer(state: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case 'ADD': {
      const existing = state.find((i) => i.producto.id === action.producto.id);
      if (existing) {
        return state.map((i) =>
          i.producto.id === action.producto.id
            ? {
                ...i,
                cantidad: i.cantidad + 1,
                subtotal: (i.cantidad + 1) * i.producto.precioNeto
              }
            : i
        );
      }
      return [
        ...state,
        { producto: action.producto, cantidad: 1, subtotal: action.producto.precioNeto }
      ];
    }
    case 'REMOVE':
      return state.filter((i) => i.producto.id !== action.productoId);
    case 'UPDATE_CANTIDAD': {
      if (action.cantidad <= 0) {
        return state.filter((i) => i.producto.id !== action.productoId);
      }
      return state.map((i) =>
        i.producto.id === action.productoId
          ? {
              ...i,
              cantidad: action.cantidad,
              subtotal: action.cantidad * i.producto.precioNeto
            }
          : i
      );
    }
    case 'CLEAR':
      return [];
    default:
      return state;
  }
}

// ── Helpers ──────────────────────────────────────────────

function formatCurrency(n: number): string {
  return '$' + n.toLocaleString('es-CL');
}

// ── Page ─────────────────────────────────────────────────

type Notification = { type: 'success' | 'error'; message: string };

export function POSPage() {
  const [cart, dispatch] = useReducer(cartReducer, []);
  const [tipoDocumento, setTipoDocumento] = useState<'BOLETA' | 'FACTURA'>('BOLETA');
  const [rutCliente, setRutCliente] = useState('');
  const [giroCliente, setGiroCliente] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(null);

  // ── Computed ───────────────────────────────────────────

  const totalNeto = cart.reduce((sum, i) => sum + i.subtotal, 0);
  const iva = Math.round(totalNeto * 0.19);
  const total = totalNeto + iva;

  // ── Handlers ───────────────────────────────────────────

  const handleAdd = (producto: Product) => {
    dispatch({ type: 'ADD', producto });
    setNotification(null);
  };

  const handleUpdateCantidad = (productoId: string, cantidad: number) => {
    dispatch({ type: 'UPDATE_CANTIDAD', productoId, cantidad });
  };

  const handleRemove = (productoId: string) => {
    dispatch({ type: 'REMOVE', productoId });
  };

  const clearNotification = () => setNotification(null);

  const handleConfirm = async () => {
    if (cart.length === 0) {
      setNotification({ type: 'error', message: 'Carrito vacío. Agrega productos antes de confirmar.' });
      return;
    }

    setSubmitting(true);
    setNotification(null);

    try {
      await salesApi.create({
        tipoDocumento,
        ...(tipoDocumento === 'FACTURA' ? { rutCliente, giroCliente } : {}),
        items: cart.map((i) => ({
          productoId: i.producto.id,
          cantidad: i.cantidad
        }))
      });

      dispatch({ type: 'CLEAR' });
      setRutCliente('');
      setGiroCliente('');
      setNotification({ type: 'success', message: '✅ Venta registrada exitosamente' });
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response: { data: { message?: string } } }).response?.data?.message ??
            'Error al registrar la venta'
          : 'Error al conectar con el servidor';

      setNotification({ type: 'error', message: msg });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render ─────────────────────────────────────────────

  return (
    <div>
      {/* Notification banner */}
      {notification && (
        <div
          className={`card`}
          style={{
            marginBottom: '1rem',
            backgroundColor: notification.type === 'success' ? '#d1fae5' : '#fee2e2',
            color: notification.type === 'success' ? '#065f46' : '#991b1b',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <span>{notification.message}</span>
          <button
            type="button"
            onClick={clearNotification}
            style={{
              background: 'none',
              border: 'none',
              color: 'inherit',
              cursor: 'pointer',
              fontSize: '1.25rem',
              padding: '0 0.25rem'
            }}
            aria-label="Cerrar notificación"
          >
            ✕
          </button>
        </div>
      )}

      <div className="pos-layout">
        {/* Left panel — Search */}
        <div className="pos-left">
          <ProductSearch onAdd={handleAdd} />
        </div>

        {/* Right panel — Cart */}
        <div className="pos-right">
          <div className="card">
            <h3>Carrito ({cart.length} {cart.length === 1 ? 'producto' : 'productos'})</h3>

            {/* Document type */}
            <div style={{ marginBottom: '0.75rem' }}>
              <label style={{ marginRight: '0.5rem', fontWeight: 600 }}>Tipo Documento:</label>
              <select
                value={tipoDocumento}
                onChange={(e) => setTipoDocumento(e.target.value as 'BOLETA' | 'FACTURA')}
              >
                <option value="BOLETA">BOLETA</option>
                <option value="FACTURA">FACTURA</option>
              </select>
            </div>

            {/* Customer fields for FACTURA */}
            {tipoDocumento === 'FACTURA' && (
              <div style={{ marginBottom: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  placeholder="RUT Cliente"
                  value={rutCliente}
                  onChange={(e) => setRutCliente(e.target.value)}
                  style={{ flex: 1 }}
                />
                <input
                  type="text"
                  placeholder="Giro Cliente"
                  value={giroCliente}
                  onChange={(e) => setGiroCliente(e.target.value)}
                  style={{ flex: 1 }}
                />
              </div>
            )}

            {/* Cart items table */}
            {cart.length === 0 ? (
              <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem 0' }}>
                Carrito vacío. Busca y agrega productos desde el panel izquierdo.
              </p>
            ) : (
              <>
                <table>
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Cantidad</th>
                      <th style={{ textAlign: 'right' }}>P. Unitario</th>
                      <th style={{ textAlign: 'right' }}>Subtotal</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map((item) => (
                      <CartItemRow
                        key={item.producto.id}
                        item={item}
                        onUpdateCantidad={handleUpdateCantidad}
                        onRemove={handleRemove}
                      />
                    ))}
                  </tbody>
                </table>

                {/* Summary */}
                <div
                  style={{
                    marginTop: '1rem',
                    paddingTop: '0.75rem',
                    borderTop: '2px solid #e2e8f0'
                  }}
                >
                  <div className="row" style={{ justifyContent: 'flex-end', gap: '2rem' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: '#64748b', fontSize: '0.875rem' }}>Neto</div>
                      <div style={{ fontWeight: 600 }}>{formatCurrency(totalNeto)}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: '#64748b', fontSize: '0.875rem' }}>IVA (19%)</div>
                      <div style={{ fontWeight: 600 }}>{formatCurrency(iva)}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: '#64748b', fontSize: '0.875rem' }}>Total</div>
                      <div style={{ fontWeight: 700, fontSize: '1.25rem', color: '#0f766e' }}>
                        {formatCurrency(total)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Confirm button */}
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={submitting}
                  style={{
                    width: '100%',
                    marginTop: '1rem',
                    padding: '0.75rem',
                    fontSize: '1.1rem',
                    fontWeight: 700
                  }}
                >
                  {submitting ? 'Registrando...' : 'Confirmar Venta'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
