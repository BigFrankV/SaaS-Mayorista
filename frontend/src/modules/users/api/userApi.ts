import { httpClient } from '../../../shared/api/httpClient';
import type { UserResponse, CreateUserPayload, UpdateUserPayload } from '../../../shared/api/types';

export const userApi = {
  list: async (page = 0, size = 20, activo?: boolean) => {
    const { data } = await httpClient.get<{ content: UserResponse[]; totalElements: number }>('/users', {
      params: { page, size, ...(activo !== undefined ? { activo } : {}) },
    });
    return data;
  },
  create: async (payload: CreateUserPayload) => {
    const { data } = await httpClient.post<UserResponse>('/users', payload);
    return data;
  },
  getById: async (id: string) => {
    const { data } = await httpClient.get<UserResponse>(`/users/${id}`);
    return data;
  },
  update: async (id: string, payload: UpdateUserPayload) => {
    const { data } = await httpClient.put<UserResponse>(`/users/${id}`, payload);
    return data;
  },
  delete: async (id: string) => {
    await httpClient.delete(`/users/${id}`);
  },
};
