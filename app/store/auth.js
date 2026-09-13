import { defineStore } from "pinia";

const roleMap = {
  admin: { label: "مدير", role: "admin" },
  branch: { label: "فرع", role: "branch" },
  social: { label: "اجتماعي", role: "social" },
};

export const useAuthStore = defineStore("authStore", {
  state: () => ({
    user: {},
    token: null,
    loggedIn: false,
    loading: false,
    baseURL: useRuntimeConfig()?.public?.baseUrl || "/api",
  }),
  getters: {
    getUser: (state) => state.user,
    isLoggedIn: (state) => state.loggedIn,
    getRole: (state) => state.user?.role || "admin",
  },
  actions: {
    inferRole(email, password) {
      const normalized = `${email || ""} ${password || ""}`.toLowerCase();
      if (normalized.includes("admin")) return "admin";
      if (normalized.includes("branch")) return "branch";
      if (normalized.includes("social")) return "social";
      return "admin";
    },
    async login(data) {
      this.loading = true;
      const role = this.inferRole(data?.email, data?.password);
      const user = {
        id: `demo-${role}`,
        name: roleMap[role]?.label || "مدير",
        email: data?.email || "admin@library.local",
        role,
        branch_id: role === "branch" ? "branch-01" : null,
      };

      this.setUser(user);
      this.loading = false;
      await navigateTo("/");
      return { data: user, message: "نجح تسجيل الدخول" };
    },
    async setUser(data) {
      this.user = data;
      this.token = `demo-token-${data?.role || "admin"}`;
      this.loggedIn = true;

      const roleCookie = useCookie("dashboard_role");
      roleCookie.value = data?.role || "admin";

      const userCookie = useCookie("dashboard_user");
      userCookie.value = JSON.stringify(data);
    },
    removeUser() {
      this.user = {};
      this.token = null;
      this.loggedIn = false;
      useCookie("dashboard_role").value = null;
      useCookie("dashboard_user").value = null;
    },
    async logout() {
      this.removeUser();
      await navigateTo("/login");
    },
    hydrateFromStorage() {
      const dashboardRole = useCookie("dashboard_role");
      const dashboardUser = useCookie("dashboard_user");

      if (!dashboardRole.value || !dashboardUser.value) return;

      try {
        const parsed = JSON.parse(dashboardUser.value);
        this.user = parsed;
        this.token = `demo-token-${parsed?.role || "admin"}`;
        this.loggedIn = true;
      } catch (error) {
        this.removeUser();
      }
    },
  },
});
