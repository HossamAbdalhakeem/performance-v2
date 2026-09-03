<template>
  <div class="min-h-screen bg-ink text-mint">
    <PublicNavbar />
    <slot />
    <PublicFooter />
  </div>
</template>

<script setup>
import PublicNavbar from "~/components/layout/public-navbar/index.vue";
import PublicFooter from "~/components/layout/public-footer/index.vue";

// Public / landing shell - clean full-screen without the authenticated
// navbar, side menu, or footer. Shown to logged-out visitors on "/".
</script>