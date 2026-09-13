const fallbackTeachers = [
  { id: 'ahmed', name: 'أحمد محمد' },
  { id: 'sara', name: 'سارة علي' },
  { id: 'mahmoud', name: 'محمود فهد' },
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
};
