export type TokenResponse = {
  accessToken: string;
  refreshToken: string;
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

export type MeResponse = {
  userId: string;
  tenantId: string;
  email: string;
  nombre: string;
  rol: 'ADMIN' | 'VENDEDOR';
};

export type UserResponse = {
  id: string;
  email: string;
  nombre: string;
  rol: 'ADMIN' | 'VENDEDOR';
  activo: boolean;
  creadoEn: string;
};

export type CreateUserPayload = {
  email: string;
  password: string;
  nombre: string;
  rol: 'ADMIN' | 'VENDEDOR';
};

export type UpdateUserPayload = {
  email?: string;
  nombre?: string;
  rol?: 'ADMIN' | 'VENDEDOR';
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

export type SalePayload = {
  tipoDocumento: 'BOLETA' | 'FACTURA';
  rutCliente?: string;
  giroCliente?: string;
  items: Array<{ productoId: string; cantidad: number }>;
};

export type SaleResponse = {
  id: string;
  tenantId: string;
  usuarioId: string;
  tipoDocumento: string;
  rutCliente?: string;
  giroCliente?: string;
  totalNeto: number;
  iva: number;
  total: number;
  fechaVenta: string;
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
