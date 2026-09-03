<template>
  <footer class="border-t border-forest/20">
    <div
      class="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 py-8 text-sm text-muted sm:flex-row sm:px-8"
    >
      <p>© {{ year }} GiveSpark. All rights reserved.</p>
      <div class="flex items-center gap-6">
        <NuxtLink to="/privacy" class="transition hover:text-mint"
          >Privacy</NuxtLink
        >
        <NuxtLink to="/privacy" class="transition hover:text-mint"
          >Terms</NuxtLink
        >
      </div>
    </div>
  </footer>
</template>

<script setup>
const year = new Date().getFullYear();
</script>

<style lang="scss" scoped>
</style>