<template>
  <div class="rounded-lg border border-forest/40 bg-forest/10 p-6">
    <Skeleton v-if="loading" width="8rem" height="2.5rem" border-radius="8px"/>
    <slot v-else />
  </div>
</template>

<script setup>

defineProps({
  loading: { type: Boolean, default: false },
});
</script>

<style lang="scss" scoped>
</style>