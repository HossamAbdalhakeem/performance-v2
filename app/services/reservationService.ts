import { apiFetch, firstRow, asList } from "~/utils/apiFetch";

const PAYMENT_METHODS = new Set(["CASH", "WALLET", "INSTAPAY"]);

const reservationBody = (payload: Record<string, any>) => {
  const method = String(payload.method || payload.payment_method || "CASH").toUpperCase();

  const body: Record<string, any> = {
    studentId: payload.studentId ?? payload.student_id,
    productId: payload.productId ?? payload.product_id,
    quantity: Number(payload.quantity || 1),
    deposit: Number(payload.deposit ?? payload.paid_amount ?? payload.amount),
    method: PAYMENT_METHODS.has(method) ? method : "CASH",
  };

  const branchId = payload.branchId ?? payload.branch_id;
  if (branchId) body.branchId = branchId;

  if (payload.proofReference || payload.proof_reference || payload.payment_proof_path) {
    body.proofReference =
      payload.proofReference || payload.proof_reference || payload.payment_proof_path;
  }

  return body;
};

export const reservationService = {
  async getReservations(params: Record<string, any> = {}) {
    return asList(await apiFetch("/reservations", { method: "GET", params }));
  },

  async getReservation(id: string) {
    return firstRow(await apiFetch(`/reservations/${id}`, { method: "GET" }));
  },

  async createReservation(payload: Record<string, any>) {
    return firstRow(
      await apiFetch("/reservations", {
        method: "POST",
        body: reservationBody(payload),
      }),
    );
  },

  async deliverReservation(id: string, payload: Record<string, any> = {}) {
    const body: Record<string, any> = {};

    const methodRaw = payload.method ?? payload.payment_method;
    if (methodRaw != null && String(methodRaw).trim() !== "") {
      const method = String(methodRaw).toUpperCase();
      body.method = PAYMENT_METHODS.has(method) ? method : "CASH";
    }

    const proofReference =
      payload.proofReference || payload.proof_reference || payload.note;
    if (proofReference) body.proofReference = proofReference;

    return firstRow(
      await apiFetch(`/reservations/${id}/deliver`, {
        method: "POST",
        body,
      }),
    );
  },

  async cancelReservation(id: string) {
    return firstRow(
      await apiFetch(`/reservations/${id}/cancel`, {
        method: "POST",
        body: {},
      }),
    );
  },

  async changeProduct(id: string, payload: Record<string, any>) {
    return firstRow(
      await apiFetch(`/reservations/${id}/change-product`, {
        method: "POST",
        body: {
          newProductId: payload.newProductId ?? payload.new_product_id ?? payload.productId ?? payload.product_id,
        },
      }),
    );
  },

  async exchangeReservation(id: string, payload: Record<string, any>) {
    return this.changeProduct(id, payload);
  },
};
