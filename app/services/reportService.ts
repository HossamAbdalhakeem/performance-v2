import { apiFetch } from "~/utils/apiFetch";

export const reportService = {
  async getSalesReport(params: Record<string, any> = {}) {
    return await apiFetch("/sales", { method: "GET", params });
  },

  async getProfitReport(params: Record<string, any> = {}) {
    return await apiFetch("/sales", { method: "GET", params });
  },

  async getReservationReport(params: Record<string, any> = {}) {
    return await apiFetch("/reservations", { method: "GET", params });
  },

  async getInventoryReport(params: Record<string, any> = {}) {
    return await apiFetch("/inventory", { method: "GET", params });
  },

  async getStudentsReport(params: Record<string, any> = {}) {
    return await apiFetch("/students", { method: "GET", params });
  },

  async getTeacherStudents(params: Record<string, any> = {}) {
    return await apiFetch("/students", { method: "GET", params });
  },

  async exportReport(params: Record<string, any> = {}) {
    const type = params.type || "sales";
    const table =
      type === "reservations" ? "/reservations" :
      type === "inventory" ? "/inventory" :
      type === "students" ? "/students" :
      "/sales";

    return await apiFetch(table, {
      method: "GET",
      params: {
        branch_id: params.branch_id,
        date_from: params.date_from,
        date_to: params.date_to,
      },
    });
  },
};
