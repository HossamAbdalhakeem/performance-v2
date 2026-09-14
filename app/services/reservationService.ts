import { apiFetch, firstRow } from "~/utils/apiFetch";

const reservationBody = (payload: Record<string, any>) => ({
  student: {
    name: payload.student?.name || payload.student_name,
    phone: payload.student?.phone || payload.phone,
  },
  study_year_id: payload.study_year_id || payload.stage,
  branch_id: payload.branch_id,
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

const exchangeBody = (payload: Record<string, any>) => ({
  items: payload.items || [
    {
      product_id: payload.product_id,
      quantity: payload.quantity || 1,
    },
  ],
});

export const reservationService = {
  async getReservations(params: Record<string, any> = {}) {
    return await apiFetch("/reservations", { method: "GET", params });
  },

  async getReservation(id: string) {
    return firstRow(await apiFetch(`/reservations/${id}`, { method: "GET" }));
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
      await apiFetch(`/reservations/${id}/deliver`, {
        method: "POST",
        body: {},
      })
    );
  },

  async cancelReservation(id: string, payload: Record<string, any> = {}) {
    return firstRow(
      await apiFetch(`/reservations/${id}/cancel`, {
        method: "POST",
        body: {
          refund_amount: payload.refund_amount,
          reason: payload.reason,
        },
      })
    );
  },

  async exchangeReservation(id: string, payload: Record<string, any>) {
    return firstRow(
      await apiFetch(`/reservations/${id}/exchange`, {
        method: "POST",
        body: exchangeBody(payload),
      })
    );
  },
};
