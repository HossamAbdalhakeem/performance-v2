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
    return firstRow(await apiFetch("/students", { method: "GET", params: { id } }));
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
      await apiFetch("/students", {
        method: "PATCH",
        params: { id },
        body: studentBody(payload),
      })
    );
  },

  async getStudentHistory(id: string) {
    const [sales, reservations] = await Promise.all([
      apiFetch("/sales", { method: "GET", params: { student_id: id } }),
      apiFetch("/reservations", { method: "GET", params: { student_id: id } }),
    ]);

    return { sales, reservations };
  },
};
