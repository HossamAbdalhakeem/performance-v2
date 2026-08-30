<template>
  <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
    <SingleCard
      v-for="(card, idx) in cards"
      :key="idx"
      :card="card"
      :loading="loading"
    />
  </div>
</template>

<script setup>
import SingleCard from "~/components/shared/single-card/index.vue";

defineProps({
  cards: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
});
</script>

<style lang="scss" scoped>
</style>