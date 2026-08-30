import { useAuthStore } from "~/store/Auth";
export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore();
  const user = authStore.user;
  const token = authStore.token;
  if (!user?._id && !token) {
    return navigateTo("/login");
  }
  return;
});
