<template>
  <div class="overflow-hidden rounded-lg border border-forest/40 bg-black">
    <Skeleton v-if="loading" width="100%" height="100%" border-radius="0px" class="aspect-video w-full"/>
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