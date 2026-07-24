import { httpClient } from './httpClient';
import type { PageResponse, Product, UpdateProductPayload } from './types';

export type CreateProductPayload = {
  codigoBarras: string;
  nombre: string;
  categoria?: string;
  descripcion?: string;
  stockActual: number;
  stockMinimo: number;
  precioNeto: number;
};

export const productsApi = {
  list: async (page = 0, size = 20, params?: { stockBajo?: boolean; search?: string }): Promise<PageResponse<Product>> => {
    const { data } = await httpClient.get<PageResponse<Product>>('/products', {
      params: { page, size, ...params }
    });
    return data;
  },
  create: async (payload: CreateProductPayload): Promise<Product> => {
    const { data } = await httpClient.post<Product>('/products', payload);
    return data;
  },
  update: async (id: string, payload: UpdateProductPayload): Promise<Product> => {
    const { data } = await httpClient.put<Product>(`/products/${id}`, payload);
    return data;
  },
  delete: async (id: string): Promise<void> => {
    await httpClient.delete(`/products/${id}`);
  }
};
