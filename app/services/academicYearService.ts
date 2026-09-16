import { apiFetch, firstRow, asList } from "~/utils/apiFetch";

export const academicYearService = {
  async getAcademicYears(params: Record<string, any> = {}) {
    return asList(await apiFetch("/academic-years", { method: "GET", params }));
  },

  async getAcademicYear(id: string) {
    return firstRow(await apiFetch(`/academic-years/${id}`, { method: "GET" }));
  },

  async createAcademicYear(payload: Record<string, any>) {
    return firstRow(
      await apiFetch("/academic-years", {
        method: "POST",
        body: { name: payload.name },
      }),
    );
  },

  /** Backend PATCH will be available soon */
  async updateAcademicYear(id: string, payload: Record<string, any>) {
    return firstRow(
      await apiFetch(`/academic-years/${id}`, {
        method: "PATCH",
        body: { name: payload.name },
      }),
    );
  },
};
