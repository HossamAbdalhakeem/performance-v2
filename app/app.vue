<template>
  <NuxtRouteAnnouncer />
  <NuxtLayout :name="layoutName">
    <NuxtPage />
  </NuxtLayout>
</template>
<script setup>
import { useAuthStore } from "~/store/auth.js";

const route = useRoute();
const authStore = useAuthStore();

const layoutName = computed(() => {
  // Home routes dynamically between the authenticated layout and the
  // public landing layout- depending on whether user is loggedgedgedged in.
  if (route.path === "/") {
    return authStore.isLoggedIn ? "default" : "non-loggedin";
  }

  const metaLayout = route.meta?.layout;
  return metaLayout || "default";
});
</script>

