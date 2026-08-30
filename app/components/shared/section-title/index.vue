<template>
  <div class="mb-8">
    <h2 v-if="loading" class="font-serif text-3xl font-normal">
      <Skeleton width="12rem" height="2rem" border-radius="4px" />
    </h2>
    <h2 v-else class="font-serif text-3xl font-normal text-mint">{{ title }}</h2>

    <p v-if="loading || subtitle" class="mt-2">
      <Skeleton v-if="loading" width="18rem" height="1rem" border-radius="4px" />
      <span v-else class="text-muted">{{ subtitle }}</span>
    </p>
  </div>
</template>

<script setup>

defineProps({
  title: { type: String, default: "" },
  subtitle: { type: String, default: "" },
  loading: { type: Boolean, default: false },
});
</script>

<style lang="scss" scoped>
</style>