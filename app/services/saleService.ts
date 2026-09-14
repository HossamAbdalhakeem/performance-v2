import { apiFetch, firstRow, asList } from "~/utils/apiFetch";

const PAYMENT_METHODS = new Set(["CASH", "WALLET", "INSTAPAY"]);

const saleBody = (payload: Record<string, any>) => {
  const method = String(payload.method || payload.payment_method || "CASH").toUpperCase();
console.log(payload);
  const body: Record<string, any> = {
    studentId: payload.studentId ?? payload.student_id,
    productId: payload.productId ?? payload.product_id,
    quantity: Number(payload.quantity || 1),
    method: PAYMENT_METHODS.has(method) ? method : "CASH",
  };

  const proof =
    payload.proofReference ??
    payload.proof_reference ??
    payload.payment_proof_path ??
    payload.receipt_image;

  if (proof) body.proofReference = proof;

  return body;
};

export const saleService = {
  async getSales(params: Record<string, any> = {}) {
    return asList(await apiFetch("/sales", { method: "GET", params }));
  },

  async getSale(id: string) {
    return firstRow(await apiFetch(`/sales/${id}`, { method: "GET" }));
  },

  async createSale(payload: Record<string, any>) {
    return firstRow(
      await apiFetch("/sales", {
        method: "POST",
        body: saleBody(payload),
      }),
    );
  },
};
