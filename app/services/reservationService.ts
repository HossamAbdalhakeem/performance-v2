const fallbackReservations = [
  {
    id: "1024",
    code: "B-2025-00124",
    student: "أحمد محمد",
    student_name: "أحمد محمد",
    phone: "01012845678",
    book: "كتاب Y",
    product: "كتاب Y",
    teacher: "أ. خالد",
    teacher_id: "khaled",
    branch: "فرع الرياض",
    branch_name: "فرع الرياض",
    amount: 500,
    status: "pending",
  },
  {
    id: "1025",
    code: "B-2025-00125",
    student: "سارة علي",
    student_name: "سارة علي",
    phone: "01123456789",
    book: "ملزمة",
    product: "ملزمة",
    teacher: "أ. عمر",
    teacher_id: "omar",
    branch: "فرع جدة",
    branch_name: "فرع جدة",
    amount: 250,
    status: "pending",
  },
];

const fallbackReservation = async (payload: Record<string, any>) => {
  const stamp = String(Date.now()).slice(-5);
  return {
    ...payload,
    id: stamp,
    code: `B-${new Date().getFullYear()}-${stamp}`,
    created_at: new Date().toISOString(),
  };
};

export const reservationService = {
  async getReservations(params = {}) {
    try {
      return await $fetch('/reservations', {
        method: 'GET',
        baseURL: useRuntimeConfig().public.baseUrl || '/api',
        params,
      });
    } catch {
      return fallbackReservations;
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
