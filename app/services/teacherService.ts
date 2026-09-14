import { apiFetch, firstRow } from "~/utils/apiFetch";

const teacherBody = (payload: Record<string, any>) => ({
  name: payload.name,
  phone: payload.phone,
  description: payload.description || "",
});

export const teacherService = {
  async getTeachers(params: Record<string, any> = {}) {
    return await apiFetch("/teachers", { method: "GET", params });
  },

  async getTeacher(id: string) {
    return firstRow(await apiFetch("/teachers", { method: "GET", params: { id } }));
  },

  async createTeacher(payload: Record<string, any>) {
    return firstRow(
      await apiFetch("/teachers", {
        method: "POST",
        body: teacherBody(payload),
      })
    );
  },

  async updateTeacher(id: string, payload: Record<string, any>) {
    return firstRow(
      await apiFetch("/teachers", {
        method: "PATCH",
        params: { id },
        body: teacherBody(payload),
      })
    );
  },

  async updateTeacherStatus(id: string, is_active: boolean) {
    return firstRow(
      await apiFetch("/teachers", {
        method: "PATCH",
        params: { id },
        body: { is_active },
      })
    );
  },
};
