import { apiFetch, firstRow } from "~/utils/apiFetch";

const reservationBody = (payload: Record<string, any>) => ({
  student_name: payload.student_name || payload.student?.name,
  phone: payload.phone || payload.student?.phone,
  study_year_id: payload.stage || payload.study_year_id,
  teacher_id: payload.teacher_id,
  product_id: payload.product_id || payload.items?.[0]?.product_id,
  quantity: payload.quantity || payload.items?.[0]?.quantity || 1,
  paid_amount: payload.amount ?? payload.paid_amount,
  payment_method: payload.payment_method,
  receipt_image: payload.receipt_image ?? payload.payment_proof_path ?? null,
  status: "pending",
});

export const reservationService = {
  async getReservations(params: Record<string, any> = {}) {
    return await apiFetch("/reservations", { method: "GET", params });
  },

  async getReservation(id: string) {
    return firstRow(await apiFetch("/reservations", { method: "GET", params: { id } }));
  },

  async createReservation(payload: Record<string, any>) {
    return firstRow(
      await apiFetch("/reservations", {
        method: "POST",
        body: reservationBody(payload),
      })
    );
  },

  async deliverReservation(id: string) {
    return firstRow(
      await apiFetch("/reservations", {
        method: "PATCH",
        params: { id },
        body: { status: "delivered" },
      })
    );
  },

  async cancelReservation(id: string, payload: Record<string, any> = {}) {
    return firstRow(
      await apiFetch("/reservations", {
        method: "PATCH",
        params: { id },
        body: {
          status: "cancelled",
          refund_amount: payload.refund_amount,
          reason: payload.reason,
        },
      })
    );
  },

  async exchangeReservation(id: string, payload: Record<string, any>) {
    return firstRow(
      await apiFetch("/reservations", {
        method: "PATCH",
        params: { id },
        body: {
          product_id: payload.items?.[0]?.product_id || payload.product_id,
          quantity: payload.items?.[0]?.quantity || payload.quantity,
        },
      })
    );
  },
};
