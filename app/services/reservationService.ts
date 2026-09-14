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

import { apiFetch } from "~/utils/apiFetch";

export const reservationService = {
  async getReservations(params = {}) {
    try {
      return await apiFetch("/reservations", {
        method: "GET",
        params,
      });
    } catch {
      return fallbackReservations;
    }
  },

  async getReservation(id: string) {
    try {
      const rows = await apiFetch<any>("/reservations", {
        method: "GET",
        params: { id: `eq.${id}` },
      });
      return Array.isArray(rows) ? rows[0] : rows;
    } catch {
      return null;
    }
  },

  async createReservation(payload: Record<string, any>) {
    try {
      return await apiFetch("/reservations", {
        method: "POST",
        body: payload,
      });
    } catch {
      return await fallbackReservation(payload);
    }
  },

  async deliverReservation(id: string) {
    try {
      return await apiFetch("/reservations", {
        method: "PATCH",
        params: { id: `eq.${id}` },
        body: { status: "delivered" },
      });
    } catch {
      return { id, delivered: true };
    }
  },

  async cancelReservation(id: string, payload = {}) {
    try {
      return await apiFetch("/reservations", {
        method: "PATCH",
        params: { id: `eq.${id}` },
        body: { status: "cancelled", ...payload },
      });
    } catch {
      return { id, status: "cancelled", ...payload };
    }
  },

  async exchangeReservation(id: string, payload: Record<string, any>) {
    try {
      return await apiFetch("/reservations", {
        method: "PATCH",
        params: { id: `eq.${id}` },
        body: payload,
      });
    } catch {
      return { id, ...payload, exchanged: true };
    }
  },
};
