export const studentService = {
  async getStudents(params = {}) {
    return await $fetch('/students', {
      method: 'GET',
      baseURL: useRuntimeConfig().public.baseUrl || '/api',
      params,
    });
  },

  async getStudent(id: string) {
    return await $fetch(`/students/${id}`, {
      method: 'GET',
      baseURL: useRuntimeConfig().public.baseUrl || '/api',
    });
  },
};
