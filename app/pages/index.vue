<template>
  <div>
    <landing v-if="!isLoggedIn" />
    <index v-else />
  </div>
</template>
<script setup>
import { computed } from "vue";
import index from "~/components/home/index.vue";
import landing from "~/components/non-loggedin/landing/index.vue";
import { useAuthStore } from "~/store/auth.js";

const authStore = useAuthStore();
const isLoggedIn = computed(() => authStore.isLoggedIn);



useDynamicSeo({
  title: () => "my home v2",
  description: () =>
    "Discover creators, products and exclusive video experiences. Browse the latest content and support your favorite creators.",
});
</script>

<style lang="scss" scoped>
</style>