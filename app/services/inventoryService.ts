import { apiFetch, asData, asList } from "~/utils/apiFetch";

export const inventoryService = {
  async getInventory(params: Record<string, any> = {}) {
    return asList(await apiFetch("/inventory", { method: "GET", params }));
  },

  async getBranchInventory(branchId: string) {
    return asList(await apiFetch(`/inventory/${branchId}`, { method: "GET" }));
  },

  async getStockItem(branchId: string, productId: string) {
    return asData(
      await apiFetch(`/inventory/${branchId}/${productId}`, { method: "GET" }),
    );
  },

  async addStock(payload: Record<string, any>) {
    const branchId = payload.branchId || payload.branch_id;
    const productId = payload.productId || payload.product_id;

    return asData(
      await apiFetch(`/inventory/${branchId}/${productId}/add`, {
        method: "POST",
        body: {
          quantity: Number(payload.quantity),
          ...(payload.note || payload.notes
            ? { note: payload.note || payload.notes }
            : {}),
        },
      }),
    );
  },

  async removeStock(payload: Record<string, any>) {
    const branchId = payload.branchId || payload.branch_id;
    const productId = payload.productId || payload.product_id;

    return asData(
      await apiFetch(`/inventory/${branchId}/${productId}/remove`, {
        method: "POST",
        body: {
          quantity: Number(payload.quantity),
          ...(payload.note || payload.notes || payload.reason
            ? { note: payload.note || payload.notes || payload.reason }
            : {}),
        },
      }),
    );
  },

  async getAvailability(params: Record<string, any> = {}) {
    const branchId = params.branchId || params.branch_id;
    const productId = params.productId || params.product_id;

    if (!branchId || !productId) {
      return { availableQuantity: 0, physicalQuantity: 0, reservedQuantity: 0 };
    }

    try {
      const item = await this.getStockItem(branchId, productId);
      return {
        availableQuantity: item?.availableQuantity ?? 0,
        physicalQuantity: item?.physicalQuantity ?? 0,
        reservedQuantity: item?.reservedQuantity ?? 0,
        available: item?.availableQuantity ?? 0,
        quantity: item?.availableQuantity ?? 0,
      };
    } catch {
      return { availableQuantity: 0, physicalQuantity: 0, reservedQuantity: 0, available: 0, quantity: 0 };
    }
  },

  async getInventoryMovements(branchId: string, productId: string) {
    return asList(
      await apiFetch(`/inventory/${branchId}/${productId}/movements`, {
        method: "GET",
      }),
    );
  },

  async getMovements(branchId: string, productId: string) {
    return this.getInventoryMovements(branchId, productId);
  },
};
