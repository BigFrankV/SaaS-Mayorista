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
