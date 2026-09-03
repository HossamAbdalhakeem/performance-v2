<template>
  <div>
    <landing v-if="!isLoggedIn" />
    <index v-else />
  </div>
</template>
<script setup>
import { computed } from "vue";
import index from "~/components/home/index.vue";
import landing from "~/components/landing/index.vue";
import { useAuthStore } from "~/store/auth.js";

const authStore = useAuthStore();
const isLoggedIn = computed(() => authStore.isLoggedIn);
</script>

<style lang="scss" scoped>
</style>