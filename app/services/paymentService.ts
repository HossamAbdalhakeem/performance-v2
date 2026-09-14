import { apiFetch } from "~/utils/apiFetch";

export const paymentService = {
  async getPayments(params = {}) {
    return await apiFetch("/payments", {
      method: "GET",
      params,
    });
  },
};
