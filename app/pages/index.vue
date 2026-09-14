<template>
  <div />
</template>

<script setup>
import { useAuthStore } from "~/store/auth.js";

const authStore = useAuthStore();

const roleFirstPageMap = {
  admin: "/products",
  branch: "/sales/direct",
  social: "/books",
};

definePageMeta({
  middleware: ["local-pages"],
});

onMounted(async () => {
  if (!authStore.isLoggedIn) {
    await navigateTo("/login");
    return;
  }

  const role = authStore.user?.role || "admin";
  await navigateTo(roleFirstPageMap[role] || "/products");
});
</script>
