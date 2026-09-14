const fallbackAvailability = {
  chem: 44,
  phys: 5,
  math: 18,
  "book-code": 20,
};

export const inventoryService = {
  async getInventory(params = {}) {
    try {
      return await $fetch("/inventory", {
        method: "GET",
        baseURL: useRuntimeConfig().public.baseUrl || "/api",
        params,
      });
    } catch {
      return [];
    }
  },

  async addStock(payload: Record<string, any>) {
    try {
      return await $fetch("/inventory/add", {
        method: "POST",
        baseURL: useRuntimeConfig().public.baseUrl || "/api",
        body: payload,
      });
    } catch {
      return { ...payload, id: `stock-add-${Date.now()}` };
    }
  },

  async removeStock(payload: Record<string, any>) {
    try {
      return await $fetch("/inventory/remove", {
        method: "POST",
        baseURL: useRuntimeConfig().public.baseUrl || "/api",
        body: payload,
      });
    } catch {
      return { ...payload, id: `stock-remove-${Date.now()}` };
    }
  },

  async getMovements(params = {}) {
    try {
      return await $fetch("/inventory/movements", {
        method: "GET",
        baseURL: useRuntimeConfig().public.baseUrl || "/api",
        params,
      });
    } catch {
      return [];
    }
  },

  async getAvailability(params = {}) {
    try {
      return await $fetch("/inventory/availability", {
        method: "GET",
        baseURL: useRuntimeConfig().public.baseUrl || "/api",
        params,
      });
    } catch {
      const productId = params?.product_id || params?.product;
      return {
        available: fallbackAvailability[productId] ?? 20,
        quantity: fallbackAvailability[productId] ?? 20,
      };
    }
  },
};
