import { apiFetch, firstRow, asList } from "~/utils/apiFetch";

const PAYMENT_METHODS = new Set(["CASH", "WALLET", "INSTAPAY"]);

const normalizeMethod = (value?: string) => {
  const method = String(value || "CASH").toUpperCase();
  return PAYMENT_METHODS.has(method) ? method : "CASH";
};

export const exchangeService = {
  async getExchanges() {
    return asList(await apiFetch("/exchanges", { method: "GET" }));
  },

  async getExchange(id: string) {
    return firstRow(await apiFetch(`/exchanges/${id}`, { method: "GET" }));
  },

  async createExchange(payload: Record<string, any>) {
    const body: Record<string, any> = {
      saleId: payload.saleId ?? payload.sale_id,
      saleItemId: payload.saleItemId ?? payload.sale_item_id,
      newProductId: payload.newProductId ?? payload.new_product_id,
      quantity: Number(payload.quantity || 1),
    };

    if (payload.paymentMethod || payload.payment_method) {
      body.paymentMethod = normalizeMethod(
        payload.paymentMethod ?? payload.payment_method,
      );
    }

    if (payload.refundMethod || payload.refund_method) {
      body.refundMethod = normalizeMethod(
        payload.refundMethod ?? payload.refund_method,
      );
    }

    const proof =
      payload.proofReference ??
      payload.proof_reference ??
      payload.payment_proof_path;

    if (proof) body.proofReference = proof;

    return firstRow(
      await apiFetch("/exchanges", {
        method: "POST",
        body,
      }),
    );
  },
};
