import { httpClient } from '../../../shared/api/httpClient';

export type RegisterTenantPayload = {
  nombreEmpresa: string;
  rut: string;
  giro?: string;
  direccion?: string;
  adminNombre: string;
  adminEmail: string;
  adminPassword: string;
};

export type RegisterTenantResponse = {
  tenantId: string;
  adminUserId: string;
  mensaje: string;
};

export const tenantApi = {
  register: async (payload: RegisterTenantPayload): Promise<RegisterTenantResponse> => {
    const { data } = await httpClient.post<RegisterTenantResponse>('/tenants/register', payload);
    return data;
  },
};
