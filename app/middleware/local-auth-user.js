import { useAuthStore } from "~/store/Auth";
export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore();
  const user = authStore.user;
  if (user?._id) {
    return navigateTo("/");
  }
  return;
});
