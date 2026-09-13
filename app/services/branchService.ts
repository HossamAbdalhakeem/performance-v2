export const branchService = {
  async getBranches(params = {}) {
    return await $fetch('/branches', {
      method: 'GET',
      baseURL: useRuntimeConfig().public.baseUrl || '/api',
      params,
    });
  },
};
