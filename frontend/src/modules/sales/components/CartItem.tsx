import type { CartItem as CartItemType } from '../../../shared/api/types';

interface CartItemProps {
  item: CartItemType;
  onUpdateCantidad: (productoId: string, cantidad: number) => void;
  onRemove: (productoId: string) => void;
}

export function CartItemRow({ item, onUpdateCantidad, onRemove }: CartItemProps) {
  return (
    <div className="pos-cart-item">
      <div className="item-name">{item.producto.nombre}</div>
      <div className="item-qty">
        <button
          type="button"
          onClick={() => onUpdateCantidad(item.producto.id, item.cantidad - 1)}
          aria-label="Disminuir cantidad"
        >
          −
        </button>
        <span className="qty-value">{item.cantidad}</span>
        <button
          type="button"
          onClick={() => onUpdateCantidad(item.producto.id, item.cantidad + 1)}
          aria-label="Aumentar cantidad"
        >
          +
        </button>
      </div>
      <div className="item-price">${item.subtotal.toLocaleString('es-CL')}</div>
      <button
        type="button"
        className="item-remove"
        onClick={() => onRemove(item.producto.id)}
        aria-label="Eliminar producto"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}
