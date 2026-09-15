import { apiFetch, firstRow, asList } from "~/utils/apiFetch";

const PAYMENT_METHODS = new Set(["CASH", "WALLET", "INSTAPAY"]);

const normalizeMethod = (value?: string) => {
  const method = String(value || "CASH").toUpperCase();
  return PAYMENT_METHODS.has(method) ? method : "CASH";
};

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
          method: normalizeMethod(payload.method ?? payload.refundMethod),
        },
      }),
    );
  },
};
