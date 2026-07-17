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
};
