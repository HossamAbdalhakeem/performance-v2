<template>
  <div class="min-h-screen bg-ink text-mint">
    <SideMenu v-if="isLoggedIn" :open="menuOpen" @close="menuOpen = false" />

    <div
      :class="[
        'min-h-screen transition-[padding] duration-200',
        isLoggedIn ? 'lg:pl-72' : '',
      ]"
    >
      <Navbar v-if="isLoggedIn" @toggle-menu="menuOpen = !menuOpen" />
      <main class="min-h-[calc(100vh-5rem)]">
        <slot />
      </main>
      <Footer v-if="isLoggedIn" />
    </div>
  </div>
</template>
<script setup>
import { ref, computed } from "vue";
import { useAuthStore } from "~/store/auth.js";

const SideMenu = defineAsyncComponent(() =>
  import("~/components/layout/side-menu/index.vue"),
);
const Navbar = defineAsyncComponent(() =>
  import("~/components/layout/navbar/index.vue"),
);
const Footer = defineAsyncComponent(() =>
  import("~/components/layout/footer/index.vue"),
);

const authStore = useAuthStore();
const isLoggedIn = computed(() => authStore.isLoggedIn);
const menuOpen = ref(false);
</script>