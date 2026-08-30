import { defineStore } from "pinia";
export const useAuthStore = defineStore("authStore", {
  state: () => ({
    user: {},
    token: null,
    loggedIn: false,
    loading: false,
    baseURL: useRuntimeConfig()?.public?.baseUrl || "",
    organizationId: useRuntimeConfig()?.public?.organizationId || "",
  }),
  getters: {
    getUser: (state) => state.user,
    isLoggedIn: (state) => state.loggedIn,
    getOrganizationId: (state) => state.user?.organization_id,
    getFundraiserId: (state) => useRuntimeConfig()?.public?.fundraiserId,
  },
  actions: {
    async login(data) {
      console.log("Login data:aaaaaaaaaa", data);
      console.log("Base URL:", this.baseURL);
      this.loading = true;
      const response = await $fetch(`/app-api/users/login`, {
        method: "POST",
        baseURL: this.baseURL,
        body: { ...data, organization_id: this.organizationId },
      });
      this.loading = false;
      console.log("Login response:bbbbbbbbb", response.data);
      await this.setUser(response.data);
      return response;
    },

    async fetchUser() {
      console.log("Fetching user with token: 22");
      const token = this.token;
      console.log("Token in fetchUser:", token);
      if (!token) return;

      const { data, error } = await useFetch(`/app-api/users/profile`, {
        key: `auth-profile-${token}`,
        method: "GET",
        baseURL: this.baseURL,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (error.value) {
        console.error("Fetch user failed:", error.value);
        return;
      }

      const responseData = data.value;
      const user = responseData?.data;
      console.log("Fetch user response:ccccccccc1112", responseData);
      if (!user?._id) return;

      await this.setUser(user);
      return user;
    },
    async setUser(data) {
      this.user = data;
      if (data?.api_token || data?.access_token) {
        this.setUserToken(data.api_token || data?.access_token);
      }

      if (data?.refresh_token) {
        this.setUserRefreshToken({ refresh_token: data?.refresh_token });
      }
      this.loggedIn = true;
    },
    setUserToken(token) {
      this.token = token;
      const tokenCookie = useCookie("token", token);
      tokenCookie.value = token;
    },
    setUserRefreshToken({ refresh_token }) {
      const refreshTokenCookie = useCookie("refresh_token", refresh_token);
      refreshTokenCookie.value = refresh_token;
    },
    async logoutCurrent() {
      const response = await $fetch(`/app-api/users/logout-current`, {
        method: "POST",
        baseURL: this.baseURL,
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
        body: {
          access_token: this.token,
        },
      });
      return response;
    },
    async logoutAll() {
      await logoutCurrent();
      removeUser();
      removeTokens();
    },
    removeUser() {
      this.user = {};
      this.loggedIn = false;
    },
    removeTokens() {
      this.token = null;
      const tokenCookie = useCookie("token");
      tokenCookie.value = null;
      const refreshTokenCookie = useCookie("refresh_token");
      refreshTokenCookie.value = null;
    },
  },
});
