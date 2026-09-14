const fallbackTeachers = [
  { id: "khaled", name: "أ. خالد", subject: "الكيمياء", branch: "riyadh", status: "active" },
  { id: "omar", name: "أ. عمر", subject: "الفيزياء", branch: "jeddah", status: "active" },
  { id: "sara", name: "أ. سارة", subject: "الرياضيات", branch: "madina", status: "active" },
  { id: "salah", name: "مستر محمد صلاح", subject: "اللغة العربية", branch: "riyadh", status: "active" },
];

export const teacherService = {
  async getTeachers(params = {}) {
    try {
      return await $fetch('/teachers', {
        method: 'GET',
        baseURL: useRuntimeConfig().public.baseUrl || '/api',
        params,
      });
    } catch {
      return fallbackTeachers;
    }
  },

  async getTeacher(id: string) {
    try {
      return await $fetch(`/teachers/${id}`, {
        method: 'GET',
        baseURL: useRuntimeConfig().public.baseUrl || '/api',
      });
    } catch {
      return fallbackTeachers.find((teacher) => teacher.id === id) || null;
    }
  },

  async createTeacher(payload: Record<string, any>) {
    try {
      return await $fetch('/teachers', {
        method: 'POST',
        baseURL: useRuntimeConfig().public.baseUrl || '/api',
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
