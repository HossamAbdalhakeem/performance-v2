<template>
  <div>
    <!-- ======== Top navigation (public) ======== -->
    <header class="sticky top-0 z-40 border-b border-forest/20 bg-ink/90 backdrop-blur">
      <div class="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-5 sm:px-8">
        <NuxtLink to="/" class="flex items-center gap-3">
          <span class="grid size-9 place-items-center rounded-full border border-emerald-300/70 font-serif text-lg">F</span>
          <span class="font-serif text-lg"><strong>Fundraiser</strong> <small>Workspace</small></span>
        </NuxtLink>
        <nav class="hidden items-center gap-8 text-sm font-medium md:flex">
          <a href="#features" class="text-muted transition hover:text-mint">Features</a>
          <a href="#how" class="text-muted transition hover:text-mint">How it works</a>
          <a href="#products" class="text-muted transition hover:text-mint">Products</a>
        </nav>
        <NuxtLink to="/login" class="rounded-lg bg-emerald-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-950">Sign in</NuxtLink>
      </div>
    </header>

    <!-- ======== Hero ======== -->
    <section class="relative isolate overflow-hidden">
      <div class="pointer-events-none absolute -right-24 -top-24 -z-10 h-96 w-96 rounded-full border border-emerald-300/10 shadow-[0_0_0_3rem_rgba(167,243,208,0.04)]" />
      <div class="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:items-center lg:py-28">
        <div>
          <p class="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">Fundraiser workspace</p>
          <h1 class="font-serif text-5xl font-normal leading-[1.02] sm:text-6xl">Make every contribution <span class="text-emerald-300">count.</span></h1>
          <p class="mt-6 max-w-md text-lg leading-7 text-muted">Bring your campaigns, creators, and community together in one clear view — then turn attention into lasting support.</p>
          <div class="mt-8 flex flex-wrap items-center gap-4">
            <NuxtLink to="/login" class="rounded-lg bg-emerald-800 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-950">Get started</NuxtLink>
            <a href="#how" class="text-sm font-semibold text-mint underline-offset-4 hover:underline">See how it works</a>
          </div>
        </div>
        <div class="relative rounded-2xl border border-emerald-400/10 bg-gradient-to-br from-emerald-900/30 to-ink p-8">
          <div class="flex flex-wrap gap-3">
            <span v-for="chip in heroChips" :key="chip" class="rounded-full border border-emerald-300/20 bg-ink/40 px-3 py-1 text-xs text-emerald-100">{{ chip }}</span>
          </div>
          <p class="mt-6 font-serif text-2xl leading-relaxed text-emerald-50/90">"We turned one weekend of fans into a community that gives all year."</p>
          <div class="mt-6 flex items-center gap-3">
            <span class="grid size-10 place-items-center rounded-full bg-emerald-700 text-sm font-bold">MJ</span>
            <div><p class="text-sm font-semibold">Maya Jameson</p><p class="text-xs text-muted">Creator, Music Show</p></div>
          </div>
        </div>
      </div>
    </section>

    <!-- ======== Trust bar ======== -->
    <section class="border-y border-forest/20 bg-forest/5">
      <div class="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-10 gap-y-4 px-5 py-8 sm:px-8">
        <p class="text-xs uppercase tracking-widest text-muted">Trusted by</p>
        <span v-for="brand in brands" :key="brand" class="font-serif text-lg text-muted/70">{{ brand }}</span>
      </div>
    </section>

    <!-- ======== Features ======== -->
    <section id="features" class="mx-auto max-w-7xl px-5 py-20 sm:px-8">
      <div class="mb-14 max-w-2xl">
        <p class="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">Features</p>
        <h2 class="font-serif text-4xl font-normal sm:text-5xl">Everything you need to grow.</h2>
        <p class="mt-4 text-muted">From publishing experiences to tracking every contribution, one workspace keeps your whole story in sync.</p>
      </div>
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div v-for="feature in features" :key="feature.title" class="rounded-2xl border border-forest/20 bg-forest/5 p-6 transition hover:-translate-y-1 hover:border-emerald-300/30">
          <span class="grid size-12 place-items-center rounded-xl bg-emerald-800/40 text-2xl">{{ feature.icon }}</span>
          <h3 class="mt-5 text-lg font-semibold text-mint">{{ feature.title }}</h3>
          <p class="mt-2 text-sm leading-6 text-muted">{{ feature.text }}</p>
        </div>
      </div>
    </section>

    <!-- ======== How it works ======== -->
    <section id="how" class="border-y border-forest/20 bg-forest/5">
      <div class="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <div class="mb-14 text-center">
          <p class="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">How it works</p>
          <h2 class="font-serif text-4xl font-normal sm:text-5xl">Three steps from idea to impact.</h2>
        </div>
        <div class="grid gap-8 md:grid-cols-3">
          <div v-for="(step, idx) in steps" :key="idx" class="relative rounded-2xl border border-forest/20 bg-ink/40 p-8">
            <span class="font-serif text-6xl font-normal text-emerald-300/20">{{ step.num }}</span>
            <h3 class="mt-6 text-xl font-semibold text-mint">{{ step.title }}</h3>
            <p class="mt-3 text-sm leading-6 text-muted">{{ step.text }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ======== Stats ======== -->
    <section class="mx-auto max-w-7xl px-5 py-20 sm:px-8">
      <div class="grid gap-8 rounded-2xl border border-forest/20 bg-forest/5 p-8 sm:grid-cols-3 sm:p-12">
        <div v-for="stat in stats" :key="stat.label" class="text-center">
          <p class="font-serif text-5xl text-emerald-300">{{ stat.value }}</p>
          <p class="mt-2 text-sm text-muted">{{ stat.label }}</p>
        </div>
      </div>
    </section>

    <!-- ======== Products highlight ======== -->
    <section id="products" class="border-y border-forest/20 bg-forest/5">
      <div class="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <div class="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div class="max-w-xl">
            <p class="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">Products</p>
            <h2 class="font-serif text-4xl font-normal sm:text-5xl">Experiences your fans will love.</h2>
          </div>
          <NuxtLink to="/login" class="rounded-lg border border-emerald-300/30 px-5 py-2.5 text-sm font-semibold text-mint transition hover:bg-emerald-800/30">Browse products</NuxtLink>
        </div>
        <div class="grid gap-6 md:grid-cols-3">
          <div v-for="product in products" :key="product.title" class="group overflow-hidden rounded-2xl border border-forest/20 bg-ink transition hover:border-emerald-300/30">
            <div class="aspect-video w-full bg-gradient-to-br from-emerald-900/40 to-ink" />
            <div class="p-6">
              <span class="text-xs font-semibold uppercase tracking-wider text-emerald-300">{{ product.type }}</span>
              <h3 class="mt-2 font-serif text-2xl font-normal text-mint">{{ product.title }}</h3>
              <p class="mt-2 text-sm leading-6 text-muted">{{ product.text }}</p>
              <p class="mt-4 text-sm font-bold text-emerald-300">from {{ product.price }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ======== Testimonial ======== -->
    <section class="mx-auto max-w-4xl px-5 py-20 text-center sm:px-8">
      <p class="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">Loved by creators</p>
      <blockquote class="mt-6 font-serif text-3xl leading-snug text-mint sm:text-4xl">"Fundraiser gave us the clarity to turn casual listeners into lifelong supporters — and the numbers show it."</blockquote>
      <p class="mt-8 text-sm text-muted">Isaac Chen · Producer, Camp Scampi</p>
      <div class="mx-auto mt-6 flex items-center justify-center gap-1 text-emerald-300">
        <span v-for="n in 5" :key="n" aria-hidden="true">★</span>
      </div>
    </section>

    <!-- ======== Final CTA ======== -->
    <section class="mx-auto max-w-7xl px-5 pb-20 sm:px-8">
      <div class="relative isolate overflow-hidden rounded-3xl border border-emerald-300/20 px-8 py-16 text-center sm:px-12">
        <div class="pointer-events-none absolute -left-20 -top-20 -z-10 h-64 w-64 rounded-full border border-emerald-300/10" />
        <h2 class="font-serif text-4xl font-normal sm:text-5xl">Ready to reach your people?</h2>
        <p class="mx-auto mt-4 max-w-md text-muted">Join the workspace and start building experiences that fund your mission.</p>
        <NuxtLink to="/login" class="mt-8 inline-block rounded-lg bg-emerald-800 px-8 py-3 text-sm font-semibold text-white transition hover:bg-emerald-950">Sign in to get started</NuxtLink>
      </div>
    </section>

    <!-- ======== Footer ======== -->
    <footer class="border-t border-forest/20">
      <div class="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 py-8 text-sm text-muted sm:flex-row sm:px-8">
        <p>© {{ year }} Fundraiser Workspace. All rights reserved.</p>
        <div class="flex items-center gap-6">
          <NuxtLink to="/privacy" class="transition hover:text-mint">Privacy</NuxtLink>
          <NuxtLink to="/privacy" class="transition hover:text-mint">Terms</NuxtLink>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
const year = new Date().getFullYear();

const heroChips = [
  "Music", "Digital products", "Memberships", "Live experiences",
];

const brands = [
  "Atlas Records", "Northside", "Folkworks", "The Loop", "Kessa",
];

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

const stats = [
  { value: "25K+", label: "Experiences published" },
  { value: "$1.2M", label: "Raised by creators" },
  { value: "98%", label: "Creator satisfaction" },
];

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