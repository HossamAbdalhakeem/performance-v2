<template>
  <header class="sticky top-0 z-40 border-b border-forest/20 bg-ink/90 backdrop-blur">
    <div class="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-5 sm:px-8">
      <Logo />
      <nav class="hidden items-center gap-8 text-sm font-medium md:flex">
        <NuxtLink to="/features" class="text-muted transition hover:text-mint">Features</NuxtLink>
        <NuxtLink to="/how" class="text-muted transition hover:text-mint">How it works</NuxtLink>
        <NuxtLink to="/shop" class="text-muted transition hover:text-mint">Products</NuxtLink>
      </nav>
      <NuxtLink
        to="/login"
        class="rounded-lg bg-emerald-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-950"
      >
        Sign in
      </NuxtLink>
    </div>
  </header>
</template>

<script setup>
import Logo from "~/components/layout/logo/index.vue";
</script>