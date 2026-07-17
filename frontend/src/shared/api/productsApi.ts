import { httpClient } from './httpClient';
import type { Product } from './types';

export type CreateProductPayload = {
  codigoBarras: string;
  nombre: string;
  stockActual: number;
  stockMinimo: number;
  precioNeto: number;
};

export const productsApi = {
  list: async (): Promise<Product[]> => {
    const { data } = await httpClient.get<Product[]>('/products');
    return data;
  },
  create: async (payload: CreateProductPayload): Promise<Product> => {
    const { data } = await httpClient.post<Product>('/products', payload);
    return data;
  }
};
