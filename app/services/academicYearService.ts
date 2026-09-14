import { apiFetch } from "~/utils/apiFetch";

export const academicYearService = {
  async getAcademicYears(params: Record<string, any> = {}) {
    return await apiFetch("/academic-years", {
      method: "GET",
      params,
    });
  },

  async getActiveAcademicYear() {
    return await apiFetch("/academic-years/active", {
      method: "GET",
    });
  },
};
