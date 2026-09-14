const fallbackTeachers = [
  { id: "khaled", name: "أ. خالد", subject: "الكيمياء", branch: "riyadh", status: "active" },
  { id: "omar", name: "أ. عمر", subject: "الفيزياء", branch: "jeddah", status: "active" },
  { id: "sara", name: "أ. سارة", subject: "الرياضيات", branch: "madina", status: "active" },
  { id: "salah", name: "مستر محمد صلاح", subject: "اللغة العربية", branch: "riyadh", status: "active" },
];

import { apiFetch } from "~/utils/apiFetch";

export const teacherService = {
  async getTeachers(params = {}) {
    try {
      return await apiFetch("/teachers", {
        method: "GET",
        params,
      });
    } catch {
      return fallbackTeachers;
    }
  },

  async getTeacher(id: string) {
    try {
      const rows = await apiFetch<any>("/teachers", {
        method: "GET",
        params: { id: `eq.${id}` },
      });
      return Array.isArray(rows) ? rows[0] : rows;
    } catch {
      return fallbackTeachers.find((teacher) => teacher.id === id) || null;
    }
  },

  async createTeacher(payload: Record<string, any>) {
    try {
      return await apiFetch("/teachers", {
        method: "POST",
        body: payload,
      });
    } catch {
      return {
        ...payload,
        id: `teacher-${Date.now()}`,
      };
    }
  },
};
