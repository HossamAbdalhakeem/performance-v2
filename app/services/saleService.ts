import { apiFetch, firstRow } from "~/utils/apiFetch";

const saleBody = (payload: Record<string, any>) => ({
  student_name: payload.student?.name || payload.student_name,
  phone: payload.student?.phone || payload.phone,
  study_year_id: payload.study_year_id,
  product_id: payload.items?.[0]?.product_id || payload.product_id,
  quantity: payload.items?.[0]?.quantity || payload.quantity || 1,
  paid_amount: payload.paid_amount,
  payment_method: payload.payment_method,
  payment_proof_path: payload.payment_proof_path ?? null,
});

export const saleService = {
  async getSales(params: Record<string, any> = {}) {
    return await apiFetch("/sales", { method: "GET", params });
  },

  async getSale(id: string) {
    return firstRow(await apiFetch("/sales", { method: "GET", params: { id } }));
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
