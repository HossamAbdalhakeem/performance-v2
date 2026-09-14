import { apiFetch } from "~/utils/apiFetch";

export const reportService = {
  async getSalesReport(params: Record<string, any> = {}) {
    return await apiFetch("/reports/sales", { method: "GET", params });
  },

  async getProfitReport(params: Record<string, any> = {}) {
    return await apiFetch("/reports/profit", { method: "GET", params });
  },

  async getReservationReport(params: Record<string, any> = {}) {
    return await apiFetch("/reports/reservations", { method: "GET", params });
  },

  async getInventoryReport(params: Record<string, any> = {}) {
    return await apiFetch("/reports/inventory", { method: "GET", params });
  },

  async getStudentsReport(params: Record<string, any> = {}) {
    return await apiFetch("/reports/students", { method: "GET", params });
  },

  async getTeacherStudents(params: Record<string, any> = {}) {
    return await apiFetch("/reports/teacher-students", { method: "GET", params });
  },

  async exportReport(params: Record<string, any> = {}) {
    return await apiFetch("/reports/export", {
      method: "GET",
      params: {
        type: params.type || "sales",
        branch_id: params.branch_id,
        date_from: params.date_from,
        date_to: params.date_to,
        format: params.format || "xlsx",
      },
    });
  },
};
