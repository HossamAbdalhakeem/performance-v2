import { useAuthStore } from "~/store/auth";

export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore();
  authStore.hydrateFromStorage();

  if (!authStore.isLoggedIn && to.path !== "/login") {
    return navigateTo("/login");
  }

  if (authStore.isLoggedIn && to.path === "/login") {
    return navigateTo("/");
  }
});
