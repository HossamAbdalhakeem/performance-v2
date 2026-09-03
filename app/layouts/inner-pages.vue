<template>
  <div class="min-h-screen bg-ink text-mint">
    <!-- Floating close (X) button: routes back to the page the user came from -->

    <div :class="['min-h-screen transition-[padding] duration-200']">
      <Navbar v-if="isLoggedIn" @toggle-menu="menuOpen = !menuOpen" />

      <main class="min-h-[calc(100vh-5rem)] relative pt-8">
        <button
          type="button"
          aria-label="Close and go back"
          class="fixed right-4 top-20 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-forest-800/90 text-forest-100 transition shadow-lg hover:bg-forest-700"
          @click="goBack"
        >
          
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="24"
            height="24"
            fill="none"
            stroke="#FFFFFF"
            stroke-width="2"
            stroke-linecap="round"
          >
            <path d="M6 6L18 18" />
            <path d="M18 6L6 18" />
          </svg>
        </button>

        <slot />
      </main>
      <Footer v-if="isLoggedIn" />
    </div>
  </div>
</template>
<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";

// import SideMenu from "~/components/layout/side-menu/index.vue";
import Navbar from "~/components/layout/navbar/index.vue";
import Footer from "~/components/layout/footer/index.vue";
import { useAuthStore } from "~/store/auth.js";

const authStore = useAuthStore();
const isLoggedIn = computed(() => authStore.isLoggedIn);
const menuOpen = ref(false);

// Route back to the origin page:
//   from=home  ->  /
//   from=products ->  /products
//   anything else  ->  native history.back() with a /products fallback
const router = useRouter();
const route = useRoute();

const goBack = () => {
  const from = route.query?.from;

  if (from === "home" || from === "products") {
    const destination = from === "home" ? "/" : "/products";
    router.push(destination);
    return;
  }

  // Opened directly / from another page: native browser / app history,
  // falling back to the products page if there is nothing to go back to.
  if (typeof window !== "undefined" && window.history.length > 1) {
    router.back();
  } else {
    router.push("/products");
  }
};
</script>