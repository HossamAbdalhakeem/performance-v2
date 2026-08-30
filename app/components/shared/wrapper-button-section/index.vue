<template>
  <div class="">
    <Skeleton v-if="loading" width="5rem" height="2.5rem" border-radius="8px"/>
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