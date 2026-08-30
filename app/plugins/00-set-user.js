import { useAuthStore } from "~/store/Auth.js";

export default defineNuxtPlugin(async () => {
  const nuxtApp = useNuxtApp();
  const authStore = useAuthStore(nuxtApp.$pinia);
  console.log("authStoreauthStore", authStore);

  const token = useCookie("token");

  console.log("Token in plugin:", token.value);
  if (token.value) {
    authStore.token = token.value;
    await authStore.fetchUser();
  }
});
