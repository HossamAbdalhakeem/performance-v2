import { apiFetch } from "~/utils/apiFetch";

export const userService = {
  async getUsers(params = {}) {
    return await apiFetch("/users", {
      method: "GET",
      params,
    });
  },

  async getUser(id: string) {
    const rows = await apiFetch<any>("/users", {
      method: "GET",
      params: { id: `eq.${id}` },
    });
    return Array.isArray(rows) ? rows[0] : rows;
  },

  async createUser(payload: Record<string, any>) {
    return await apiFetch("/users", {
      method: "POST",
      body: payload,
    });
  },
};
