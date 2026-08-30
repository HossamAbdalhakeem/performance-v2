<template>
  <div class="grid gap-6 sm:grid-cols-3 lg:grid-cols-4">
    <CreatorsSingleCard
      v-for="(card, idx) in cards"
      :key="idx"
      :card="card"
      :loading="loading"
    />
  </div>
</template>

<script setup>
import CreatorsSingleCard from "~/components/creators/single-card/index.vue";

defineProps({
  cards: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
});
</script>

<style lang="scss" scoped>
</style>