export const authService = {
  async login(payload: { email: string; password: string; remember?: boolean }) {
    return await $fetch('/auth/login', {
      method: 'POST',
      baseURL: useRuntimeConfig().public.baseUrl || '/api',
      body: payload,
    });
  },

  async logout() {
    return await $fetch('/auth/logout', {
      method: 'POST',
      baseURL: useRuntimeConfig().public.baseUrl || '/api',
    });
  },

  async me() {
    return await $fetch('/auth/me', {
      method: 'GET',
      baseURL: useRuntimeConfig().public.baseUrl || '/api',
    });
  },
};
