<template>
  <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
    <ProductsSingleCard
      v-for="(card, idx) in cards"
      :key="idx"
      :card="card"
      :loading="loading"
      @view="emit('view', $event)"
    />
  </div>
</template>

<script setup>
import ProductsSingleCard from "~/components/products/single-card/index.vue";

defineProps({
  cards: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
});

// Re-emit the "view" event so parents (home/products) can navigate
const emit = defineEmits(["view"]);
</script>

<style lang="scss" scoped>
</style>