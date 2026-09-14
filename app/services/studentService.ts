const fallbackStudents = [
  { id: 's1', name: 'سارة أحمد', grade: 'الثالثة', branch: 'riyadh', status: 'active' },
  { id: 's2', name: 'خالد حسن', grade: 'الرابعة', branch: 'jeddah', status: 'pending' },
  { id: 's3', name: 'لينا سالم', grade: 'الأولى', branch: 'madina', status: 'blocked' },
];

import { apiFetch } from "~/utils/apiFetch";

export const studentService = {
  async getStudents(params = {}) {
    try {
      return await apiFetch("/students", {
        method: "GET",
        params,
      });
    } catch {
      return fallbackStudents;
    }
  },

  async getStudent(id: string) {
    const rows = await apiFetch<any>("/students", {
      method: "GET",
      params: { id: `eq.${id}` },
    });
    return Array.isArray(rows) ? rows[0] : rows;
  },

  async createStudent(payload: Record<string, any>) {
    try {
      return await apiFetch("/students", {
        method: "POST",
        body: payload,
      });
    } catch {
      return {
        ...payload,
        id: `student-${Date.now()}`,
      };
    }
  },
};
