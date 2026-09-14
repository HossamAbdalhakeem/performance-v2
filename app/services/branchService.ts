import { apiFetch, firstRow } from "~/utils/apiFetch";

export const branchService = {
  async getBranches(params: Record<string, any> = {}) {
    return await apiFetch("/branches", { method: "GET", params });
  },

  async createBranch(payload: Record<string, any>) {
    return firstRow(
      await apiFetch("/branches", {
        method: "POST",
        body: {
          name: payload.name,
          address: payload.address,
          phone: payload.phone,
        },
      })
    );
  },

  async updateBranch(id: string, payload: Record<string, any>) {
    return firstRow(
      await apiFetch("/branches", {
        method: "PATCH",
        params: { id },
        body: {
          name: payload.name,
          address: payload.address,
          phone: payload.phone,
        },
      })
    );
  },

  async updateBranchStatus(id: string, is_active: boolean) {
    return firstRow(
      await apiFetch("/branches", {
        method: "PATCH",
        params: { id },
        body: { is_active },
      })
    );
  },
};
