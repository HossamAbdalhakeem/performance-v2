import { apiFetch } from "~/utils/apiFetch";

export type PaymentScreenshotUploadResult = {
  file_url: string;
  mime_type: string;
};

export const paymentService = {
  async getPayments(params: Record<string, any> = {}) {
    return await apiFetch("/payments", {
      method: "GET",
      params,
    });
  },

  /**
   * Upload a payment proof image through the Nest API
   * (Nest stores it in Neon Object Storage — never upload from the browser directly).
   */
  async uploadPaymentProof(file: File): Promise<PaymentScreenshotUploadResult> {
    const body = new FormData();
    body.append("file", file);

    const result = await apiFetch<PaymentScreenshotUploadResult>(
      "/uploads/payment-screenshot",
      {
        method: "POST",
        body,
      },
    );

    if (!result?.file_url) {
      throw new Error("تعذر رفع صورة الإثبات.");
    }

    return result;
  },
};
