<template>
  <p v-if="loading" class="text-sm">
    <Skeleton width="50%" height="1rem" border-radius="4px" />
  </p>
  <p v-else class="text-sm text-muted">{{ subtitle }}</p>
</template>

<script setup>

defineProps({
  subtitle: { type: String, default: "" },
  loading: { type: Boolean, default: false },
});
</script>

<style lang="scss" scoped>
</style>