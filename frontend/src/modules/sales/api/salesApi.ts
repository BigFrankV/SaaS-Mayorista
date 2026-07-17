import { httpClient } from '../../../shared/api/httpClient';
import type { PageResponse, SalePayload, SaleResponse } from '../../../shared/api/types';

export const salesApi = {
  create: async (payload: SalePayload): Promise<SaleResponse> => {
    const { data } = await httpClient.post<SaleResponse>('/sales', payload);
    return data;
  },
  list: async (page = 0, size = 20): Promise<PageResponse<SaleResponse>> => {
    const { data } = await httpClient.get<PageResponse<SaleResponse>>('/sales', {
      params: { page, size }
    });
    return data;
  }
};
