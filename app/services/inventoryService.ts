import { apiFetch, firstRow } from "~/utils/apiFetch";

export const inventoryService = {
  async getInventory(params: Record<string, any> = {}) {
    return await apiFetch("/inventory", { method: "GET", params });
  },

  async addStock(payload: Record<string, any>) {
    return firstRow(
      await apiFetch("/inventory", {
        method: "POST",
        body: {
          branch_id: payload.branch_id,
          product_id: payload.product_id,
          quantity: payload.quantity,
          notes: payload.notes || "",
          type: "stock_in",
        },
      })
    );
  },

  async removeStock(payload: Record<string, any>) {
    return firstRow(
      await apiFetch("/inventory", {
        method: "POST",
        body: {
          branch_id: payload.branch_id,
          product_id: payload.product_id,
          quantity: payload.quantity,
          reason: payload.reason,
          notes: payload.notes || "",
          type: "stock_out",
        },
      })
    );
  },

  async getInventoryMovements(params: Record<string, any> = {}) {
    return await apiFetch("/inventory_movements", { method: "GET", params });
  },

  async getMovements(params: Record<string, any> = {}) {
    return this.getInventoryMovements(params);
  },

  async getAvailability(params: Record<string, any> = {}) {
    return await apiFetch("/inventory", {
      method: "GET",
      params: {
        product_id: params.product_id,
        ...(params.branch_id ? { branch_id: params.branch_id } : {}),
      },
    });
  },
};
