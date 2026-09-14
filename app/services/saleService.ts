import { apiFetch } from "~/utils/apiFetch";

export const saleService = {
  async getSales(params = {}) {
    try {
      return await apiFetch("/sales", {
        method: "GET",
        params,
      });
    } catch {
      return [];
    }
  },

  async getSale(id: string) {
    try {
      const rows = await apiFetch<any>("/sales", {
        method: "GET",
        params: { id: `eq.${id}` },
      });
      return Array.isArray(rows) ? rows[0] : rows;
    } catch {
      return null;
    }
  },

  async createSale(payload: Record<string, any>) {
    try {
      return await apiFetch("/sales", {
        method: "POST",
        body: payload,
      });
    } catch {
      return {
        ...payload,
        id: `sale-${Date.now()}`,
        created_at: new Date().toISOString(),
      };
    }
  },
};
