<template>
  <div class="rounded-lg border border-forest/40 bg-forest/10 p-6">
    <Skeleton v-if="loading" width="6rem" height="2rem" border-radius="4px"/>
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