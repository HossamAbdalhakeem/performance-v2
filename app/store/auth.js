import { defineStore } from "pinia";
import { authService } from "~/services/authService";

const pickUser = (response) => {
  if (!response) return {};
  if (response.data?.user) return response.data.user;
  if (response.user) return response.user;
  if (response.data?.email || response.data?.role || response.data?.id) return response.data;
  if (response.email || response.role || response.id) return response;
  return {};
};

const pickToken = (response) =>
  response?.data?.token ||
  response?.data?.access_token ||
  response?.token ||
  response?.access_token ||
  null;

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
    async login(data) {
      this.loading = true;

      try {
        const response = await authService.login({
          email: data?.email,
          password: data?.password,
          remember: data?.remember,
        });

        this.setUser(pickUser(response), pickToken(response));
        await navigateTo("/");
        return response;
      } finally {
        this.loading = false;
      }
    },
    async fetchUser() {
      const response = await authService.me();
      const user = pickUser(response);

      if (user?.id || user?.email) {
        this.setUser(user, this.token);
      }

      return user;
    },
    async setUser(data, token) {
      this.user = data || {};
      this.token = token || this.token || null;
      this.loggedIn = Boolean(this.user?.id || this.user?.email || this.user?.role);

      useCookie("token").value = this.token;
      useCookie("dashboard_role").value = this.user?.role || "admin";
      useCookie("dashboard_user").value = JSON.stringify(this.user);
    },
    removeUser() {
      this.user = {};
      this.token = null;
      this.loggedIn = false;
      useCookie("token").value = null;
      useCookie("dashboard_role").value = null;
      useCookie("dashboard_user").value = null;
    },
    async logout() {
      try {
        await authService.logout();
      } catch (error) {
        console.error("Logout request failed", error);
      }

      this.removeUser();
      await navigateTo("/login");
    },
    hydrateFromStorage() {
      const dashboardRole = useCookie("dashboard_role");
      const dashboardUser = useCookie("dashboard_user");
      const token = useCookie("token");

      if (!dashboardRole.value || !dashboardUser.value) return;

      try {
        const parsed = JSON.parse(dashboardUser.value);
        this.user = parsed;
        this.token = token.value || null;
        this.loggedIn = true;
      } catch (error) {
        this.removeUser();
      }
    },
  },
});
