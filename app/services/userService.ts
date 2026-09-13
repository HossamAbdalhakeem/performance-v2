export const userService = {
  async getUsers(params = {}) {
    return await $fetch('/users', {
      method: 'GET',
      baseURL: useRuntimeConfig().public.baseUrl || '/api',
      params,
    });
  },

  async getUser(id: string) {
    return await $fetch(`/users/${id}`, {
      method: 'GET',
      baseURL: useRuntimeConfig().public.baseUrl || '/api',
    });
  },

  async createUser(payload: Record<string, any>) {
    return await $fetch('/users', {
      method: 'POST',
      baseURL: useRuntimeConfig().public.baseUrl || '/api',
      body: payload,
    });
  },
};
