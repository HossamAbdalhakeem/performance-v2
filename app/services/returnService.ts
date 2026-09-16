import { apiFetch, firstRow, asList } from "~/utils/apiFetch";
import { normalizePaymentMethod } from "~/utils/paymentMethods";

export const returnService = {
  async getReturns() {
    return asList(await apiFetch("/returns", { method: "GET" }));
  },

  async getReturn(id: string) {
    return firstRow(await apiFetch(`/returns/${id}`, { method: "GET" }));
  },

  async createReturn(payload: Record<string, any>) {
    const items = Array.isArray(payload.items)
      ? payload.items.map((item: Record<string, any>) => ({
          saleItemId: item.saleItemId ?? item.sale_item_id,
          quantity: Number(item.quantity || 1),
        }))
      : [
          {
            saleItemId: payload.saleItemId ?? payload.sale_item_id,
            quantity: Number(payload.quantity || 1),
          },
        ];

    return firstRow(
      await apiFetch("/returns", {
        method: "POST",
        body: {
          saleId: payload.saleId ?? payload.sale_id,
          items,
          method: normalizePaymentMethod(payload.method ?? payload.refundMethod),
        },
      }),
    );
  },
};
