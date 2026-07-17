import type { CartItem as CartItemType } from '../../../shared/api/types';

interface CartItemProps {
  item: CartItemType;
  onUpdateCantidad: (productoId: string, cantidad: number) => void;
  onRemove: (productoId: string) => void;
}

export function CartItemRow({ item, onUpdateCantidad, onRemove }: CartItemProps) {
  return (
    <tr>
      <td>{item.producto.nombre}</td>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <button
            type="button"
            onClick={() => onUpdateCantidad(item.producto.id, item.cantidad - 1)}
            style={{ padding: '0.25rem 0.5rem', minWidth: '2rem' }}
            aria-label="Disminuir cantidad"
          >
            −
          </button>
          <input
            type="number"
            min={1}
            value={item.cantidad}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              if (!isNaN(val) && val >= 0) {
                onUpdateCantidad(item.producto.id, val);
              }
            }}
            style={{ width: '3.5rem', textAlign: 'center', padding: '0.25rem' }}
          />
          <button
            type="button"
            onClick={() => onUpdateCantidad(item.producto.id, item.cantidad + 1)}
            style={{ padding: '0.25rem 0.5rem', minWidth: '2rem' }}
            aria-label="Aumentar cantidad"
          >
            +
          </button>
        </div>
      </td>
      <td style={{ textAlign: 'right' }}>${item.producto.precioNeto.toLocaleString('es-CL')}</td>
      <td style={{ textAlign: 'right' }}>${item.subtotal.toLocaleString('es-CL')}</td>
      <td>
        <button
          type="button"
          className="secondary"
          onClick={() => onRemove(item.producto.id)}
          style={{ padding: '0.25rem 0.5rem' }}
          aria-label="Eliminar producto"
        >
          ✕
        </button>
      </td>
    </tr>
  );
}
