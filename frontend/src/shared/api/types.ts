export type TokenResponse = {
  accessToken: string;
  // The backend never returns the refresh token in the body anymore: it is
  // delivered exclusively via the httpOnly cookie. This field is kept for
  // response-shape compatibility and is always null.
  refreshToken: string | null;
  tokenType: string;
  accessTokenExpiresIn: number;
};

export type Product = {
  id: string;
  codigoBarras: string;
  nombre: string;
  categoria?: string;
  descripcion?: string;
  stockActual: number;
  stockMinimo: number;
  precioNeto: number;
  stockBajo: boolean;
};

export type UserRol = 'ADMIN' | 'VENDEDOR' | 'BODEGUERO' | 'CONTADOR';

export type MeResponse = {
  userId: string;
  tenantId: string;
  email: string;
  nombre: string;
  rol: UserRol;
};

export type UserResponse = {
  id: string;
  email: string;
  nombre: string;
  rol: UserRol;
  activo: boolean;
  creadoEn: string;
};

export type CreateUserPayload = {
  email: string;
  password: string;
  nombre: string;
  rol: UserRol;
};

export type UpdateUserPayload = {
  email?: string;
  nombre?: string;
  rol?: UserRol;
  password?: string;
};

export type PageResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};

export type UpdateProductPayload = {
  nombre?: string;
  categoria?: string;
  descripcion?: string;
  stockActual?: number;
  stockMinimo?: number;
  precioNeto?: number;
};

export type Client = {
  id: string;
  rut: string;
  nombre: string;
  giro?: string;
  direccion?: string;
  email?: string;
  telefono?: string;
  activo: boolean;
  creadoEn: string;
};

export type CreateClientPayload = {
  rut: string;
  nombre: string;
  giro?: string;
  direccion?: string;
  email?: string;
  telefono?: string;
};

export type UpdateClientPayload = {
  nombre?: string;
  giro?: string;
  direccion?: string;
  email?: string;
  telefono?: string;
};

export type SalePayload = {
  tipoDocumento: 'BOLETA' | 'FACTURA';
  clienteId?: string;
  rutCliente?: string;
  giroCliente?: string;
  nombreCliente?: string;
  items: Array<{ productoId: string; cantidad: number }>;
};

export type SaleResponse = {
  id: string;
  tenantId: string;
  usuarioId: string;
  usuarioNombre?: string;
  tipoDocumento: string;
  rutCliente?: string;
  giroCliente?: string;
  nombreCliente?: string;
  totalNeto: number;
  iva: number;
  total: number;
  fechaVenta: string;
  anulada: boolean;
  detalles: Array<{
    id: string;
    productoId: string;
    nombreProducto: string;
    cantidad: number;
    precioNetoHistorico: number;
  }>;
};

export type CartItem = {
  producto: Product;
  cantidad: number;
  subtotal: number;
};

export type DashboardKPI = {
  totalVentasHoy: number;
  productosBajoStock: number;
  usuariosActivos: number;
  ventasDelMes: number;
  cambioVsAyer: number;
  cambioVsMesAnterior: number;
};

export type VentaResumen = {
  folio: string;
  cliente: string;
  rut: string;
  total: number;
  tipo: 'BOLETA' | 'FACTURA';
  fecha: string;
};
