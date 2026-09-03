<template>
  <div>
    <div class="mx-auto max-w-7xl px-5 py-20 sm:px-8">
      <div class="mb-14 text-center">
        <p class="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">How it works</p>
        <h1 class="font-serif text-4xl font-normal sm:text-5xl">Three steps from idea to impact.</h1>
      </div>

      <div class="grid gap-8 md:grid-cols-3">
        <div
          v-for="(step, idx) in steps"
          :key="idx"
          class="relative rounded-2xl border border-forest/20 bg-ink/40 p-8"
        >
          <span class="font-serif text-6xl font-normal text-emerald-300/20">{{ step.num }}</span>
          <h3 class="mt-6 text-xl font-semibold text-mint">{{ step.title }}</h3>
          <p class="mt-3 text-sm leading-6 text-muted">{{ step.text }}</p>
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


const steps = [
  {
    num: "01",
    title: "Create your experience",
    text: "Set up a product, show, or campaign and upload your best work.",
  },
  {
    num: "02",
    title: "Share it with your world",
    text: "Send your page to fans and communities — let the story spread.",
  },
  {
    num: "03",
    title: "Grow with every contribution",
    text: "Watch support come in and nurture a community that sticks around.",
  },
];
</script>

<style lang="scss" scoped>
</style>