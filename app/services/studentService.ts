const fallbackStudents = [
  { id: 's1', name: 'سارة أحمد', grade: 'الثالثة', branch: 'riyadh', status: 'active' },
  { id: 's2', name: 'خالد حسن', grade: 'الرابعة', branch: 'jeddah', status: 'pending' },
  { id: 's3', name: 'لينا سالم', grade: 'الأولى', branch: 'madina', status: 'blocked' },
];

export const studentService = {
  async getStudents(params = {}) {
    try {
      return await $fetch('/students', {
        method: 'GET',
        baseURL: useRuntimeConfig().public.baseUrl || '/api',
        params,
      });
    } catch {
      return fallbackStudents;
    }
  },

  async getStudent(id: string) {
    return await $fetch(`/students/${id}`, {
      method: 'GET',
      baseURL: useRuntimeConfig().public.baseUrl || '/api',
    });
  },

  async createStudent(payload: Record<string, any>) {
    try {
      return await $fetch('/students', {
        method: 'POST',
        baseURL: useRuntimeConfig().public.baseUrl || '/api',
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
