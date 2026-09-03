<template>
  <header
    class="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-forest/40 bg-ink/95 px-5 backdrop-blur sm:px-8"
  >
    <div class="flex items-center gap-4">
      <button
        class="grid size-10 place-items-center rounded-lg text-muted hover:bg-forest/20 lg:hidden"
        type="button"
        aria-label="Open navigation"
        @click="$emit('toggle-menu')"
      >
        <span class="text-xl" aria-hidden="true">&#9776;</span>
      </button>
      <div>
        <p
          class="text-xs font-semibold uppercase tracking-[0.16em] text-forest"
        >
          GiveSpark
        </p>
        <h1 class="mt-1 text-lg font-semibold text-mint">
          {{ pageTitle }}
        </h1>
      </div>
    </div>

    <div class="flex items-center gap-2">
      <NotificationsDropdown />
      <user />
    </div>
  </header>
</template>

<script setup>
import user from "./user/index.vue";
import NotificationsDropdown from "./notifications-dropdown/index.vue";

defineEmits(["toggle-menu"]);
const route = useRoute();
const pageTitle = computed(() =>
  route.path === "/"
    ? "Overview"
    : route.path.split("/").filter(Boolean).at(-1)?.replace(/-/g, " ") ||
      "Overview"
);
</script>