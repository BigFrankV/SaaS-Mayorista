import { httpClient } from '../../../shared/api/httpClient';
import type { DashboardKPI, VentaResumen } from '../../../shared/api/types';

export const dashboardApi = {
  getKpis: async (): Promise<DashboardKPI> => {
    const { data } = await httpClient.get<DashboardKPI>('/dashboard/kpis');
    return data;
  },

  getRecentSales: async (limit = 5): Promise<{ content: VentaResumen[] }> => {
    const { data } = await httpClient.get<{ content: VentaResumen[] }>('/dashboard/recent-sales', {
      params: { limit },
    });
    return data;
  },
};