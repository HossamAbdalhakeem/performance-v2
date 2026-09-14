import { apiFetch, firstRow } from "~/utils/apiFetch";

const branchBody = (payload: Record<string, any>) => ({
  name: payload.name,
  address: payload.address,
  phone: payload.phone,
});

export const branchService = {
  async getBranches(params: Record<string, any> = {}) {
    return await apiFetch("/branches", { method: "GET", params });
  },

  async createBranch(payload: Record<string, any>) {
    return firstRow(
      await apiFetch("/branches", {
        method: "POST",
        body: branchBody(payload),
      })
    );
  },

  async updateBranch(id: string, payload: Record<string, any>) {
    return firstRow(
      await apiFetch(`/branches/${id}`, {
        method: "PATCH",
        body: branchBody(payload),
      })
    );
  },

  async updateBranchStatus(id: string, is_active: boolean) {
    return firstRow(
      await apiFetch(`/branches/${id}/status`, {
        method: "PATCH",
        body: { is_active },
      })
    );
  },
};
