const fallbackReservation = async (payload: Record<string, any>) => ({
  ...payload,
  id: `local-${Date.now()}`,
  created_at: new Date().toISOString(),
});

export const reservationService = {
  async getReservations(params = {}) {
    try {
      return await $fetch('/reservations', {
        method: 'GET',
        baseURL: useRuntimeConfig().public.baseUrl || '/api',
        params,
      });
    } catch {
      return [];
    }
  },

  async getReservation(id: string) {
    try {
      return await $fetch(`/reservations/${id}`, {
        method: 'GET',
        baseURL: useRuntimeConfig().public.baseUrl || '/api',
      });
    } catch {
      return null;
    }
  },

  async createReservation(payload: Record<string, any>) {
    try {
      return await $fetch('/reservations', {
        method: 'POST',
        baseURL: useRuntimeConfig().public.baseUrl || '/api',
        body: payload,
      });
    } catch {
      return await fallbackReservation(payload);
    }
  },

  async deliverReservation(id: string) {
    try {
      return await $fetch(`/reservations/${id}/deliver`, {
        method: 'PATCH',
        baseURL: useRuntimeConfig().public.baseUrl || '/api',
      });
    } catch {
      return { id, delivered: true };
    }
  },

  async cancelReservation(id: string, payload = {}) {
    try {
      return await $fetch(`/reservations/${id}/cancel`, {
        method: 'PATCH',
        baseURL: useRuntimeConfig().public.baseUrl || '/api',
        body: payload,
      });
    } catch {
      return { id, status: 'cancelled', ...payload };
    }
  },

  async exchangeReservation(id: string, payload: Record<string, any>) {
    try {
      return await $fetch(`/reservations/${id}/exchange`, {
        method: 'PATCH',
        baseURL: useRuntimeConfig().public.baseUrl || '/api',
        body: payload,
      });
    } catch {
      return { id, ...payload, exchanged: true };
    }
  },
};
