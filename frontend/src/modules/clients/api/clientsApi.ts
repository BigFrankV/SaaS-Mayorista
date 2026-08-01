import { httpClient } from '../../../shared/api/httpClient';
import type { Client, CreateClientPayload, UpdateClientPayload, PageResponse } from '../../../shared/api/types';

export const clientsApi = {
  list: async (page = 0, size = 20) => {
    const { data } = await httpClient.get<PageResponse<Client>>('/clients', {
      params: { page, size },
    });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await httpClient.get<Client>(`/clients/${id}`);
    return data;
  },

  create: async (payload: CreateClientPayload) => {
    const { data } = await httpClient.post<Client>('/clients', payload);
    return data;
  },

  update: async (id: string, payload: UpdateClientPayload) => {
    const { data } = await httpClient.put<Client>(`/clients/${id}`, payload);
    return data;
  },

  delete: async (id: string) => {
    await httpClient.delete(`/clients/${id}`);
  },
};
