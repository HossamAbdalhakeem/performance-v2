import { useAuthStore } from "~/store/auth.js";

export default defineNuxtPlugin(async () => {
  const nuxtApp = useNuxtApp();
  const authStore = useAuthStore(nuxtApp.$pinia);
  const token = useCookie("token");

  // Restore cached session first for fast UI, then refresh from API.
  authStore.hydrateFromStorage();

  if (!token.value) {
    return;
  }

  authStore.token = token.value;

  try {
    await authStore.fetchUser();
  } catch (error) {
    console.error("Failed to restore user session:", error);
    authStore.removeUser();
  }
});
