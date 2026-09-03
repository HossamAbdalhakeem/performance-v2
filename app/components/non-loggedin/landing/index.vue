<template>
  <div>
    <!-- ======== Hero ======== -->
    <section class="relative isolate overflow-hidden">
      <div
        class="pointer-events-none absolute -right-24 -top-24 -z-10 h-96 w-96 rounded-full border border-emerald-300/10 shadow-[0_0_0_3rem_rgba(167,243,208,0.04)]"
      />
      <div
        class="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:items-center lg:py-28"
      >
        <div>
          <p
            class="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-emerald-300"
          >
            GiveSpark
          </p>
          <h1
            class="font-serif text-5xl font-normal leading-[1.02] sm:text-6xl"
          >
            Make every contribution <span class="text-emerald-300">count.</span>
          </h1>
          <p class="mt-6 max-w-md text-lg leading-7 text-muted">
            Bring your campaigns, creators, and community together in one clear
            view — then turn attention into lasting support.
          </p>
          <div class="mt-8 flex flex-wrap items-center gap-4">
            <NuxtLink
              to="/login"
              class="rounded-lg bg-emerald-800 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-950"
              >Get started</NuxtLink
            >
            <a
              href="#how"
              class="text-sm font-semibold text-mint underline-offset-4 hover:underline"
              >See how it works</a
            >
          </div>
        </div>
        <div
          class="relative rounded-2xl border border-emerald-400/10 bg-gradient-to-br from-emerald-900/30 to-ink p-8"
        >
          <div class="flex flex-wrap gap-3">
            <span
              v-for="chip in heroChips"
              :key="chip"
              class="rounded-full border border-emerald-300/20 bg-ink/40 px-3 py-1 text-xs text-emerald-100"
              >{{ chip }}</span
            >
          </div>
          <p
            class="mt-6 font-serif text-2xl leading-relaxed text-emerald-50/90"
          >
            "We turned one weekend of fans into a community that gives all
            year."
          </p>
          <div class="mt-6 flex items-center gap-3">
            <span
              class="grid size-10 place-items-center rounded-full bg-emerald-700 text-sm font-bold"
              >MJ</span
            >
            <div>
              <p class="text-sm font-semibold">Maya Jameson</p>
              <p class="text-xs text-muted">Creator, Music Show</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ======== Trust bar ======== -->
    <section class="border-y border-forest/20 bg-forest/5">
      <div
        class="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-10 gap-y-4 px-5 py-8 sm:px-8"
      >
        <p class="text-xs uppercase tracking-widest text-muted">Trusted by</p>
        <span
          v-for="brand in brands"
          :key="brand"
          class="font-serif text-lg text-muted/70"
          >{{ brand }}</span
        >
      </div>
    </section>

    <!-- ======== Features ======== -->
    <features />

    <!-- ======== How it works ======== -->
    <how />

    <!-- ======== Stats ======== -->
    <section class="mx-auto max-w-7xl px-5 py-20 sm:px-8">
      <div
        class="grid gap-8 rounded-2xl border border-forest/20 bg-forest/5 p-8 sm:grid-cols-3 sm:p-12"
      >
        <div v-for="stat in stats" :key="stat.label" class="text-center">
          <p class="font-serif text-5xl text-emerald-300">{{ stat.value }}</p>
          <p class="mt-2 text-sm text-muted">{{ stat.label }}</p>
        </div>
      </div>
    </section>

    <!-- ======== Products highlight ======== -->
    <shop />

    <!-- ======== Testimonial ======== -->
    <section class="mx-auto max-w-4xl px-5 py-20 text-center sm:px-8">
      <p class="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
        Loved by creators
      </p>
      <blockquote
        class="mt-6 font-serif text-3xl leading-snug text-mint sm:text-4xl"
      >
        "Fundraiser gave us the clarity to turn casual listeners into lifelong
        supporters — and the numbers show it."
      </blockquote>
      <p class="mt-8 text-sm text-muted">Isaac Chen · Producer, Camp Scampi</p>
      <div
        class="mx-auto mt-6 flex items-center justify-center gap-1 text-emerald-300"
      >
        <span v-for="n in 5" :key="n" aria-hidden="true">★</span>
      </div>
    </section>

    <!-- ======== Final CTA ======== -->
    <section class="mx-auto max-w-7xl px-5 pb-20 sm:px-8">
      <div
        class="relative isolate overflow-hidden rounded-3xl border border-emerald-300/20 px-8 py-16 text-center sm:px-12"
      >
        <div
          class="pointer-events-none absolute -left-20 -top-20 -z-10 h-64 w-64 rounded-full border border-emerald-300/10"
        />
        <h2 class="font-serif text-4xl font-normal sm:text-5xl">
          Ready to reach your people?
        </h2>
        <p class="mx-auto mt-4 max-w-md text-muted">
          Join the workspace and start building experiences that fund your
          mission.
        </p>
        <NuxtLink
          to="/login"
          class="mt-8 inline-block rounded-lg bg-emerald-800 px-8 py-3 text-sm font-semibold text-white transition hover:bg-emerald-950"
          >Sign in to get started</NuxtLink
        >
      </div>
    </section>
  </div>
</template>

<script setup>
import features from "../features/index.vue";
import how from "../how/index.vue";
import shop from "../shop/index.vue";

const heroChips = [
  "Music",
  "Digital products",
  "Memberships",
  "Live experiences",
];

const brands = ["Atlas Records", "Northside", "Folkworks", "The Loop", "Kessa"];

const stats = [
  { value: "25K+", label: "Experiences published" },
  { value: "$1.2M", label: "Raised by creators" },
  { value: "98%", label: "Creator satisfaction" },
];
</script>

<style lang="scss" scoped>
</style>