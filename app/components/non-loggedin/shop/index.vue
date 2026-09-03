<template>
  <div>
    <div class="mx-auto max-w-7xl px-5 py-20 sm:px-8">
      <div class="mb-12 flex flex-wrap items-end justify-between gap-6">
        <div class="max-w-xl">
          <p class="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">Products</p>
          <h1 class="font-serif text-4xl font-normal sm:text-5xl">Experiences your fans will love.</h1>
        </div>
      </div>

      <div class="grid gap-6 md:grid-cols-3">
        <div
          v-for="product in products"
          :key="product.title"
          class="group overflow-hidden rounded-2xl border border-forest/20 bg-ink transition hover:border-emerald-300/30"
        >
          <div class="aspect-video w-full bg-gradient-to-br from-emerald-900/40 to-ink" />
          <div class="p-6">
            <span class="text-xs font-semibold uppercase tracking-wider text-emerald-300">{{ product.type }}</span>
            <h3 class="mt-2 font-serif text-2xl font-normal text-mint">{{ product.title }}</h3>
            <p class="mt-2 text-sm leading-6 text-muted">{{ product.text }}</p>
            <p class="mt-4 text-sm font-bold text-emerald-300">from {{ product.price }}</p>
          </div>
        </div>
      </div>

      <div class="mt-16 text-center">
        <NuxtLink
          to="/"
          class="rounded-lg border border-emerald-300/30 px-5 py-2.5 text-sm font-semibold text-mint transition hover:bg-emerald-800/30"
        >
          &larr; Back to home
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>


const products = [
  {
    type: "Music Show",
    title: "Camp Scampi",
    text: "A live show with tracks, notes, and behind-the-scenes stories.",
    price: "$9.95",
  },
  {
    type: "Bundle",
    title: "Game Day Shoutout",
    text: "A digital product that puts fans on the big screen.",
    price: "$19",
  },
  {
    type: "Membership",
    title: "The Inner Circle",
    text: "Monthly perks, early access, and direct access to the creator.",
    price: "$5",
  },
];
</script>

<style lang="scss" scoped>
</style>