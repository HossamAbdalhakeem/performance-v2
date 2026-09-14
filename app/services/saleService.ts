export const saleService = {
  async getSales(params = {}) {
    try {
      return await $fetch("/sales", {
        method: "GET",
        baseURL: useRuntimeConfig().public.baseUrl || "/api",
        params,
      });
    } catch {
      return [];
    }
  },

  async getSale(id: string) {
    try {
      return await $fetch(`/sales/${id}`, {
        method: "GET",
        baseURL: useRuntimeConfig().public.baseUrl || "/api",
      });
    } catch {
      return null;
    }
  },

  async createSale(payload: Record<string, any>) {
    try {
      return await $fetch("/sales", {
        method: "POST",
        baseURL: useRuntimeConfig().public.baseUrl || "/api",
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
