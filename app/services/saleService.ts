export const saleService = {
  async getSales(params = {}) {
    return await $fetch('/sales', {
      method: 'GET',
      baseURL: useRuntimeConfig().public.baseUrl || '/api',
      params,
    });
  },

  async getSale(id: string) {
    return await $fetch(`/sales/${id}`, {
      method: 'GET',
      baseURL: useRuntimeConfig().public.baseUrl || '/api',
    });
  },

  async createSale(payload: Record<string, any>) {
    return await $fetch('/sales', {
      method: 'POST',
      baseURL: useRuntimeConfig().public.baseUrl || '/api',
      body: payload,
    });
  },
};
