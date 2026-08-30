<template>
  <div v-if="loading" class="space-y-2">
    <Skeleton width="100%" height="0.75rem" border-radius="4px" />
    <Skeleton width="100%" height="0.75rem" border-radius="4px" />
    <!-- <Skeleton width="66%" height="0.75rem" border-radius="4px" /> -->
  </div>
  <p v-else class="leading-relaxed text-muted">{{ description }}</p>
</template>

<script setup>

defineProps({
  description: { type: String, default: "" },
  loading: { type: Boolean, default: false },
});
</script>

<style lang="scss" scoped>
</style>