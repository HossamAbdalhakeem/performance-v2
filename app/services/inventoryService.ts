export const inventoryService = {
  async getInventory(params = {}) {
    return await $fetch('/inventory', {
      method: 'GET',
      baseURL: useRuntimeConfig().public.baseUrl || '/api',
      params,
    });
  },

  async addStock(payload: Record<string, any>) {
    return await $fetch('/inventory/add', {
      method: 'POST',
      baseURL: useRuntimeConfig().public.baseUrl || '/api',
      body: payload,
    });
  },

  async removeStock(payload: Record<string, any>) {
    return await $fetch('/inventory/remove', {
      method: 'POST',
      baseURL: useRuntimeConfig().public.baseUrl || '/api',
      body: payload,
    });
  },

  async getMovements(params = {}) {
    return await $fetch('/inventory/movements', {
      method: 'GET',
      baseURL: useRuntimeConfig().public.baseUrl || '/api',
      params,
    });
  },

  async getAvailability(params = {}) {
    return await $fetch('/inventory/availability', {
      method: 'GET',
      baseURL: useRuntimeConfig().public.baseUrl || '/api',
      params,
    });
  },
};
