import { httpClient } from '../../../shared/api/httpClient';
import type { PageResponse, SalePayload, SaleResponse } from '../../../shared/api/types';

export type SaleFilters = {
  fechaDesde?: string;
  fechaHasta?: string;
  search?: string;
  tipoDocumento?: string;
  anulada?: boolean;
};

export const salesApi = {
  create: async (payload: SalePayload): Promise<SaleResponse> => {
    const { data } = await httpClient.post<SaleResponse>('/sales', payload);
    return data;
  },
  list: async (page = 0, size = 20, filters?: SaleFilters): Promise<PageResponse<SaleResponse>> => {
    const { data } = await httpClient.get<PageResponse<SaleResponse>>('/sales', {
      params: { page, size, ...filters }
    });
    return data;
  },
  getById: async (id: string): Promise<SaleResponse> => {
    const { data } = await httpClient.get<SaleResponse>(`/sales/${id}`);
    return data;
  },
  deleteSale: async (id: string): Promise<void> => {
    await httpClient.delete(`/sales/${id}`);
  }
};
