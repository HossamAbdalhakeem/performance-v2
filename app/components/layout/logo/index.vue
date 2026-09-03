<template>
  <NuxtLink to="/" class="group inline-flex items-center gap-3" @click="$emit('close')">
    <!-- Logo mark: gradient rounded square + sprout/heart icon -->
    <span
      class="relative grid size-10 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-lime-300 via-emerald-500 to-teal-700 shadow-lg shadow-emerald-900/30 ring-1 ring-white/20 transition-transform duration-300 ease-out group-hover:-rotate-3 group-hover:scale-105"
    >
      <!-- decorative highlight -->
      <span
        class="pointer-events-none absolute -top-2 -right-2 size-8 rounded-full bg-white/25 blur-md"
        aria-hidden="true"
      ></span>

      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="size-5 text-white drop-shadow"
        aria-hidden="true"
      >
        <!-- heart with pulse -->
        <path
          d="M12 20s-7-4.35-9.33-8.11C.9 8.94 2.5 5 6.15 5c2.06 0 3.44 1.06 4.35 2.35h3c.91-1.29 2.29-2.35 4.35-2.35 3.65 0 5.25 3.94 3.48 6.89C19 15.65 12 20 12 20Z"
        />
        <path d="M8 12h2l1.5-2.5L13 14l1.5-2H17" />
      </svg>
    </span>

    <!-- Wordmark -->
    <span
      class="font-serif text-lg font-semibold tracking-tight text-mint transition-colors duration-300 group-hover:text-white"
    >
      GiveSpark
    </span>
  </NuxtLink>
</template>

<script setup>
defineEmits(["close"]);
</script>