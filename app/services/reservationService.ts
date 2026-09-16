import {
  apiFetch,
  firstRow,
  asPaginated,
  type PaginatedResponse,
} from "~/utils/apiFetch";
import {
  PaymentMethod,
  normalizePaymentMethod,
} from "~/utils/paymentMethods";

const reservationBody = (payload: Record<string, any>) => {
  const method = normalizePaymentMethod(
    payload.method || payload.payment_method || PaymentMethod.CASH,
  );

  const body: Record<string, any> = {
    studentId: payload.studentId ?? payload.student_id,
    productId: payload.productId ?? payload.product_id,
    quantity: Number(payload.quantity || 1),
    deposit: Number(payload.deposit ?? payload.paid_amount ?? payload.amount),
    method,
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
  async getReservations(
    params: Record<string, any> = {},
  ): Promise<PaginatedResponse> {
    return asPaginated(
      await apiFetch("/reservations", { method: "GET", params }),
    );
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
      body.method = normalizePaymentMethod(methodRaw);
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

  async cancelReservation(id: string, payload: Record<string, any> = {}) {
    const body: Record<string, any> = {};

    const refundMethodRaw = payload.refundMethod ?? payload.refund_method;
    if (refundMethodRaw != null && String(refundMethodRaw).trim() !== "") {
      body.refundMethod = normalizePaymentMethod(refundMethodRaw);
    }

    const proofReference =
      payload.proofReference ||
      payload.proof_reference ||
      payload.payment_proof_path;
    if (proofReference) body.proofReference = proofReference;

    return firstRow(
      await apiFetch(`/reservations/${id}/cancel`, {
        method: "POST",
        body,
      }),
    );
  },

  async changeProduct(id: string, payload: Record<string, any>) {
    const body: Record<string, any> = {
      newProductId:
        payload.newProductId ??
        payload.new_product_id ??
        payload.productId ??
        payload.product_id,
    };

    const refundMethodRaw = payload.refundMethod ?? payload.refund_method;
    if (refundMethodRaw != null && String(refundMethodRaw).trim() !== "") {
      body.refundMethod = normalizePaymentMethod(refundMethodRaw);
    }

    const proofReference =
      payload.proofReference || payload.proof_reference || payload.payment_proof_path;
    if (proofReference) body.proofReference = proofReference;

    return firstRow(
      await apiFetch(`/reservations/${id}/change-product`, {
        method: "POST",
        body,
      }),
    );
  },

  async exchangeReservation(id: string, payload: Record<string, any>) {
    return this.changeProduct(id, payload);
  },
};
