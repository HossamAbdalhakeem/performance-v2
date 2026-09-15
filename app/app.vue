<template>
  <Toast position="top-center" />
  <NuxtRouteAnnouncer />
  <NuxtLayout :name="layoutName">
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
import Toast from "primevue/toast";
import { useAuthStore } from "~/store/auth.js";

const route = useRoute();
const authStore = useAuthStore();

const layoutName = computed(() => {
  if (!authStore.isLoggedIn) return "login";

  const role = authStore.user?.role || "admin";
  if (role === "branch") return "branch";
  if (role === "social") return "social";
  return "admin";
});
</script>

