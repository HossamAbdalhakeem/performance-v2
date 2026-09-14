const fallbackAvailability = {
  chem: 44,
  phys: 5,
  math: 18,
  "book-code": 20,
};

import { apiFetch } from "~/utils/apiFetch";

export const inventoryService = {
  async getInventory(params = {}) {
    try {
      return await apiFetch("/inventory", {
        method: "GET",
        params,
      });
    } catch {
      return [];
    }
  },

  async addStock(payload: Record<string, any>) {
    try {
      return await apiFetch("/inventory", {
        method: "POST",
        body: payload,
      });
    } catch {
      return { ...payload, id: `stock-add-${Date.now()}` };
    }
  },

  async removeStock(payload: Record<string, any>) {
    try {
      return await apiFetch("/inventory", {
        method: "POST",
        body: { ...payload, type: "remove" },
      });
    } catch {
      return { ...payload, id: `stock-remove-${Date.now()}` };
    }
  },

  async getMovements(params = {}) {
    try {
      return await apiFetch("/inventory_movements", {
        method: "GET",
        params,
      });
    } catch {
      return [];
    }
  },

  async getAvailability(params = {}) {
    try {
      return await apiFetch("/inventory", {
        method: "GET",
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
