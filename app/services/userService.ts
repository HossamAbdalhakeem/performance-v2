import { apiFetch, firstRow } from "~/utils/apiFetch";

const userBody = (payload: Record<string, any>) => ({
  email: payload.email,
  full_name: payload.full_name || payload.name,
  phone: payload.phone,
  role: payload.role,
  branch_ids: payload.branch_ids || [],
});

export const userService = {
  async getUsers(params: Record<string, any> = {}) {
    return await apiFetch("/users", { method: "GET", params });
  },

  async getUser(id: string) {
    return firstRow(await apiFetch(`/users/${id}`, { method: "GET" }));
  },

  async createUser(payload: Record<string, any>) {
    return firstRow(
      await apiFetch("/users", {
        method: "POST",
        body: userBody(payload),
      })
    );
  },

  async updateUser(id: string, payload: Record<string, any>) {
    return firstRow(
      await apiFetch(`/users/${id}`, {
        method: "PATCH",
        body: userBody(payload),
      })
    );
  },

  async updateUserStatus(id: string, is_active: boolean) {
    return firstRow(
      await apiFetch(`/users/${id}/status`, {
        method: "PATCH",
        body: { is_active },
      })
    );
  },
};
