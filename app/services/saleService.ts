import { apiFetch, firstRow } from "~/utils/apiFetch";

const saleBody = (payload: Record<string, any>) => ({
  student_name: payload.student_name || payload.student?.name,
  phone: payload.phone || payload.student?.phone,
  study_year_id: payload.stage || payload.study_year_id,
  teacher_id: payload.teacher_id,
  product_id: payload.product_id || payload.items?.[0]?.product_id,
  quantity: payload.quantity || payload.items?.[0]?.quantity || 1,
  paid_amount: payload.amount ?? payload.paid_amount,
  payment_method: payload.payment_method,
  receipt_image: payload.receipt_image ?? payload.payment_proof_path ?? null,
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
