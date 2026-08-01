import { useReducer, useState } from 'react';
import type { Product } from '../../../shared/api/types';
import type { CartItem } from '../../../shared/api/types';
import { salesApi } from '../api/salesApi';
import { ProductSearch } from '../components/ProductSearch';
import { CartItemRow } from '../components/CartItem';
import { NotificationBanner } from '../../../shared/ui/NotificationBanner';

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
  const [nombreCliente, setNombreCliente] = useState('');
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
        ...(tipoDocumento === 'FACTURA' ? { rutCliente, giroCliente, nombreCliente: nombreCliente || undefined } : {}),
        items: cart.map((i) => ({
          productoId: i.producto.id,
          cantidad: i.cantidad
        }))
      });

      dispatch({ type: 'CLEAR' });
      setRutCliente('');
      setGiroCliente('');
      setNombreCliente('');
      setNotification({ type: 'success', message: 'Venta registrada exitosamente' });
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
      {notification && (
        <div style={{ marginBottom: '1rem' }}>
          <NotificationBanner
            type={notification.type}
            message={notification.message}
            onClose={clearNotification}
            autoCloseMs={notification.type === 'success' ? 4000 : undefined}
          />
        </div>
      )}

      <div className="pos-layout">
        {/* Left panel — Search */}
        <div className="pos-left">
          <ProductSearch onAdd={handleAdd} />
        </div>

        {/* Right panel — Cart */}
        <div className="pos-right">
          <div className="pos-cart">
            <div className="pos-cart-header">
              <h3>Carrito de Compra</h3>
              <span className="badge badge-info">{cart.length}</span>
            </div>

            <div style={{ padding: '0 1.25rem', paddingTop: '0.75rem' }}>
              {/* Document type selector */}
              <div className="pos-doc-selector">
                <button
                  type="button"
                  className={`doc-btn${tipoDocumento === 'BOLETA' ? ' active' : ''}`}
                  onClick={() => setTipoDocumento('BOLETA')}
                >
                  Boleta
                </button>
                <button
                  type="button"
                  className={`doc-btn${tipoDocumento === 'FACTURA' ? ' active' : ''}`}
                  onClick={() => setTipoDocumento('FACTURA')}
                >
                  Factura
                </button>
              </div>

              {/* Factura fields (mock — datos estáticos en el form) */}
              {tipoDocumento === 'FACTURA' && (
                <div className="pos-factura-fields">
                  <input
                    type="text"
                    className="input"
                    placeholder="RUT Cliente"
                    value={rutCliente}
                    onChange={(e) => setRutCliente(e.target.value)}
                  />
                  <input
                    type="text"
                    className="input"
                    placeholder="Giro Cliente"
                    value={giroCliente}
                    onChange={(e) => setGiroCliente(e.target.value)}
                  />
                  <input
                    type="text"
                    className="input"
                    placeholder="Nombre Cliente"
                    value={nombreCliente}
                    onChange={(e) => setNombreCliente(e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* Cart body */}
            <div className="pos-cart-body">
              {cart.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="9" cy="21" r="1" />
                      <circle cx="20" cy="21" r="1" />
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                    </svg>
                  </div>
                  <p className="empty-title">Carrito vacío</p>
                  <p className="empty-desc">Busca y agrega productos desde el panel izquierdo.</p>
                </div>
              ) : (
                <div className="pos-cart-items">
                  {cart.map((item) => (
                    <CartItemRow
                      key={item.producto.id}
                      item={item}
                      onUpdateCantidad={handleUpdateCantidad}
                      onRemove={handleRemove}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Cart footer with summary */}
            {cart.length > 0 && (
              <>
                <div className="pos-cart-summary">
                  <div className="summary-row">
                    <span>Neto</span>
                    <span>{formatCurrency(totalNeto)}</span>
                  </div>
                  <div className="summary-row">
                    <span>IVA (19%)</span>
                    <span>{formatCurrency(iva)}</span>
                  </div>
                  <div className="summary-row total">
                    <span>Total</span>
                    <span className="amount">{formatCurrency(total)}</span>
                  </div>
                </div>

                <div className="pos-cart-footer">
                  <button
                    type="button"
                    className="btn btn-primary btn-block btn-lg"
                    onClick={handleConfirm}
                    disabled={submitting}
                  >
                    {submitting ? 'Registrando...' : 'Confirmar Venta'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
