import { apiFetch } from "~/utils/apiFetch";
import { useSupabase } from "~/composables/useSupabase";

export const paymentService = {
  async getPayments(params: Record<string, any> = {}) {
    return await apiFetch("/payments", {
      method: "GET",
      params,
    });
  },

  async uploadPaymentProof(file: File) {
    const supabase = useSupabase();
    const path = `payments/${crypto.randomUUID()}/${file.name}`;
    const { error } = await supabase.storage.from("payments").upload(path, file);

    if (error) {
      throw error;
    }

    return path;
  },
};
