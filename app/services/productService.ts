export const productService = {
  async getProducts(params = {}) {
    return await $fetch('/products', {
      method: 'GET',
      baseURL: useRuntimeConfig().public.baseUrl || '/api',
      params,
    });
  },

  async getProduct(id: string) {
    return await $fetch(`/products/${id}`, {
      method: 'GET',
      baseURL: useRuntimeConfig().public.baseUrl || '/api',
    });
  },

  async createProduct(payload: Record<string, any>) {
    return await $fetch('/products', {
      method: 'POST',
      baseURL: useRuntimeConfig().public.baseUrl || '/api',
      body: payload,
    });
  },
};
