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
const SideMenu = defineAsyncComponent(() =>
  import("~/components/layout/side-menu/index.vue")
);
// import SideMenu from "~/components/layout/side-menu/index.vue";
import Navbar from "~/components/layout/navbar/index.vue";
import Footer from "~/components/layout/footer/index.vue";
import { useAuthStore } from "~/store/auth.js";

const authStore = useAuthStore();
const isLoggedIn = computed(() => authStore.isLoggedIn);
const menuOpen = ref(false);
</script>