<template>
  <div>
    <div class="mx-auto max-w-7xl px-5 py-20 sm:px-8">
      <div class="mb-14 max-w-2xl">
        <p
          class="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-emerald-300"
        >
          Featuresssss
        </p>
        <h1 class="font-serif text-4xl font-normal sm:text-5xl">
          Everything you need to grow.
        </h1>
        <p class="mt-4 text-muted">
          From publishing experiences to tracking every contribution, one
          workspace keeps your whole story in sync.
        </p>
      </div>

      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div
          v-for="feature in features"
          :key="feature.title"
          class="rounded-2xl border border-forest/20 bg-forest/5 p-6 transition hover:-translate-y-1 hover:border-emerald-300/30"
        >
          <span
            class="grid size-12 place-items-center rounded-xl bg-emerald-800/40 text-2xl"
            >{{ feature.icon }}</span
          >
          <h3 class="mt-5 text-lg font-semibold text-mint">
            {{ feature.title }}
          </h3>
          <p class="mt-2 text-sm leading-6 text-muted">{{ feature.text }}</p>
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
const features = [
  {
    icon: "⚡",
    title: "Launch in minutes",
    text: "Publish an experience with a few taps — no code, no fuss.",
  },
  {
    icon: "🎁",
    title: "Flexible packages",
    text: "Offer pay-what-you-want, bundles, and memberships that fit your fans.",
  },
  {
    icon: "📈",
    title: "See what works",
    text: "Real-time views and contributions show you where energy is building.",
  },
  {
    icon: "🤝",
    title: "Keep it personal",
    text: "Story-driven pages that turn casual fans into lifelong supporters.",
  },
];
</script>

<style lang="scss" scoped>
</style>