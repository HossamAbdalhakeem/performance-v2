import { apiFetch, firstRow, asList } from "~/utils/apiFetch";

const studentBody = (payload: Record<string, any>) => {
  const body: Record<string, any> = {
    name: payload.name,
  };

  if (payload.phone != null && payload.phone !== "") {
    body.phone = payload.phone;
  }

  return body;
};

export const studentService = {
  async getStudents(params: Record<string, any> = {}) {
    return asList(await apiFetch("/students", { method: "GET", params }));
  },

  async getStudent(id: string) {
    return firstRow(await apiFetch(`/students/${id}`, { method: "GET" }));
  },

  async createStudent(payload: Record<string, any>) {
    return firstRow(
      await apiFetch("/students", {
        method: "POST",
        body: studentBody(payload),
      }),
    );
  },

  async updateStudent(id: string, payload: Record<string, any>) {
    return firstRow(
      await apiFetch(`/students/${id}`, {
        method: "PATCH",
        body: studentBody(payload),
      }),
    );
  },

  async deleteStudent(id: string) {
    return firstRow(await apiFetch(`/students/${id}`, { method: "DELETE" }));
  },
};
