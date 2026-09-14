const fallbackBranches = [
  { id: 'riyadh', name: 'فرع الرياض', manager: 'أحمد سالم', city: 'الرياض', status: 'active' },
  { id: 'jeddah', name: 'فرع جدة', manager: 'سارة علي', city: 'جدة', status: 'review' },
  { id: 'madina', name: 'فرع المدينة', manager: 'إبراهيم فهد', city: 'المدينة', status: 'closed' },
];

import { apiFetch } from "~/utils/apiFetch";

export const branchService = {
  async getBranches(params = {}) {
    try {
      return await apiFetch("/branches", {
        method: "GET",
        params,
      });
    } catch {
      return fallbackBranches;
    }
  },

  async createBranch(payload: Record<string, any>) {
    try {
      return await apiFetch("/branches", {
        method: "POST",
        body: payload,
      });
    } catch {
      return {
        ...payload,
        id: `branch-${Date.now()}`,
      };
    }
  },
};
