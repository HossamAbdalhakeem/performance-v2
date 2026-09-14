import { apiFetch, asData, asList } from "~/utils/apiFetch";

const resolveId = (value: unknown) => {
  if (value == null || value === "") return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    const nested = record.value ?? record.id ?? record.productId ?? record.branchId;
    return nested == null ? "" : String(nested);
  }
  return "";
};

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
    console.log('payload',payload);
    const branchId = resolveId(payload.branchId ?? payload.branch_id);
    const productId = resolveId(payload.productId ?? payload.product_id);

    if (!branchId || !productId) {
      throw new Error("branchId and productId are required to add stock.");
    }

    return asData(
      await apiFetch(`/inventory/${encodeURIComponent(branchId)}/${encodeURIComponent(productId)}/add`, {
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
    const branchId = resolveId(payload.branchId ?? payload.branch_id);
    const productId = resolveId(payload.productId ?? payload.product_id);

    if (!branchId || !productId) {
      throw new Error("branchId and productId are required to remove stock.");
    }

    return asData(
      await apiFetch(`/inventory/${encodeURIComponent(branchId)}/${encodeURIComponent(productId)}/remove`, {
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
    const branchId = resolveId(params.branchId ?? params.branch_id);
    const productId = resolveId(params.productId ?? params.product_id);

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
