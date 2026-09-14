import { apiFetch, firstRow } from "~/utils/apiFetch";

const saleBody = (payload: Record<string, any>) => ({
  student: {
    name: payload.student?.name || payload.student_name,
    phone: payload.student?.phone || payload.phone,
  },
  study_year_id: payload.study_year_id || payload.stage,
  items: payload.items || [
    {
      product_id: payload.product_id,
      quantity: payload.quantity || 1,
    },
  ],
  paid_amount: payload.paid_amount ?? payload.amount,
  payment_method: payload.payment_method,
  payment_proof_path: payload.payment_proof_path ?? payload.receipt_image ?? null,
});

export const saleService = {
  async getSales(params: Record<string, any> = {}) {
    return await apiFetch("/sales", { method: "GET", params });
  },

  async getSale(id: string) {
    return firstRow(await apiFetch(`/sales/${id}`, { method: "GET" }));
  },

  async createSale(payload: Record<string, any>) {
    return firstRow(
      await apiFetch("/sales", {
        method: "POST",
        body: saleBody(payload),
      })
    );
  },
};
