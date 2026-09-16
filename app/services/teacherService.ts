import { apiFetch, firstRow } from "~/utils/apiFetch";

const teacherBody = (payload: Record<string, any>) => ({
  name: payload.name,
});

const statusBody = (payload: Record<string, any> | string | boolean) => {
  if (typeof payload === "string") {
    return { status: payload };
  }
  if (typeof payload === "boolean") {
    return { status: payload ? "ACTIVE" : "INACTIVE" };
  }
  if (payload?.status) return { status: payload.status };
  if (typeof payload?.is_active === "boolean") {
    return { status: payload.is_active ? "ACTIVE" : "INACTIVE" };
  }
  return payload;
};

export const teacherService = {
  async getTeachers(params: Record<string, any> = {}) {
    return await apiFetch("/teachers", { method: "GET", params });
  },

  async getTeacher(id: string) {
    return firstRow(await apiFetch(`/teachers/${id}`, { method: "GET" }));
  },

  async createTeacher(payload: Record<string, any>) {
    return firstRow(
      await apiFetch("/teachers", {
        method: "POST",
        body: teacherBody(payload),
      }),
    );
  },

  async updateTeacher(id: string, payload: Record<string, any>) {
    return firstRow(
      await apiFetch(`/teachers/${id}`, {
        method: "PATCH",
        body: teacherBody(payload),
      }),
    );
  },

  async updateTeacherStatus(
    id: string,
    payload: Record<string, any> | string | boolean,
  ) {
    return firstRow(
      await apiFetch(`/teachers/${id}/status`, {
        method: "PATCH",
        body: statusBody(payload),
      }),
    );
  },
};
