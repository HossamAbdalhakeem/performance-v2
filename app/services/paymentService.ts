export const paymentService = {
  async getPayments(params = {}) {
    return await $fetch('/payments', {
      method: 'GET',
      baseURL: useRuntimeConfig().public.baseUrl || '/api',
      params,
    });
  },
};
