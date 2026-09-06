<template>
  <h3 v-if="loading" class="font-semibold">
    <Skeleton width="66%" height="1.25rem" border-radius="4px" />
  </h3>
  <h3 v-else class="font-semibold line-clamp-1 text-mint">{{ title }}</h3>
</template>

<script setup>

defineProps({
  title: { type: String, default: "" },
  loading: { type: Boolean, default: false },
});
</script>

<style lang="scss" scoped>
</style>