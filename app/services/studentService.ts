import { apiFetch, firstRow } from "~/utils/apiFetch";

const studentBody = (payload: Record<string, any>) => ({
  name: payload.name,
  phone: payload.phone,
  study_year_id: payload.study_year_id,
});

export const studentService = {
  async getStudents(params: Record<string, any> = {}) {
    return await apiFetch("/students", { method: "GET", params });
  },

  async getStudent(id: string) {
    return firstRow(await apiFetch(`/students/${id}`, { method: "GET" }));
  },

  async createStudent(payload: Record<string, any>) {
    return firstRow(
      await apiFetch("/students", {
        method: "POST",
        body: studentBody(payload),
      })
    );
  },

  async updateStudent(id: string, payload: Record<string, any>) {
    return firstRow(
      await apiFetch(`/students/${id}`, {
        method: "PATCH",
        body: studentBody(payload),
      })
    );
  },

  async getStudentHistory(id: string) {
    return await apiFetch(`/students/${id}/history`, { method: "GET" });
  },
};
