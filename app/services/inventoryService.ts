import { apiFetch, asData } from "~/utils/apiFetch";

export const inventoryService = {
  async getInventory(params: Record<string, any> = {}) {
    return await apiFetch("/inventory", { method: "GET", params });
  },

  async addStock(payload: Record<string, any>) {
    return asData(
      await apiFetch("/inventory/add", {
        method: "POST",
        body: {
          branch_id: payload.branch_id,
          product_id: payload.product_id,
          quantity: payload.quantity,
          notes: payload.notes || "",
        },
      })
    );
  },

  async removeStock(payload: Record<string, any>) {
    return asData(
      await apiFetch("/inventory/remove", {
        method: "POST",
        body: {
          branch_id: payload.branch_id,
          product_id: payload.product_id,
          quantity: payload.quantity,
          reason: payload.reason || "",
          notes: payload.notes || "",
        },
      })
    );
  },

  async getInventoryMovements(params: Record<string, any> = {}) {
    return await apiFetch("/inventory/movements", { method: "GET", params });
  },

  async getMovements(params: Record<string, any> = {}) {
    return this.getInventoryMovements(params);
  },

  async getAvailability(params: Record<string, any> = {}) {
    return await apiFetch("/inventory/availability", {
      method: "GET",
      params: {
        product_id: params.product_id,
      },
    });
  },
};
