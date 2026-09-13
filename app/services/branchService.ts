const fallbackBranches = [
  { id: 'riyadh', name: 'فرع الرياض', manager: 'أحمد سالم', city: 'الرياض', status: 'active' },
  { id: 'jeddah', name: 'فرع جدة', manager: 'سارة علي', city: 'جدة', status: 'review' },
  { id: 'madina', name: 'فرع المدينة', manager: 'إبراهيم فهد', city: 'المدينة', status: 'closed' },
];

export const branchService = {
  async getBranches(params = {}) {
    try {
      return await $fetch('/branches', {
        method: 'GET',
        baseURL: useRuntimeConfig().public.baseUrl || '/api',
        params,
      });
    } catch {
      return fallbackBranches;
    }
  },

  async createBranch(payload: Record<string, any>) {
    try {
      return await $fetch('/branches', {
        method: 'POST',
        baseURL: useRuntimeConfig().public.baseUrl || '/api',
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
