export const studyYearService = {
  async getStudyYears(params = {}) {
    return await $fetch('/study-years', {
      method: 'GET',
      baseURL: useRuntimeConfig().public.baseUrl || '/api',
      params,
    });
  },
};
