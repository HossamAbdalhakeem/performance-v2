const fallbackTeachers = [
  { id: 'ahmed', name: 'أحمد محمد', subject: 'اللغة العربية', branch: 'riyadh', status: 'active' },
  { id: 'sara', name: 'سارة علي', subject: 'الرياضيات', branch: 'jeddah', status: 'pending' },
  { id: 'mahmoud', name: 'محمود فهد', subject: 'العلوم', branch: 'madina', status: 'left' },
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
