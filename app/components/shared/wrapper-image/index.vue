<template>
  <div class="overflow-hidden rounded-lg border border-forest/40 bg-forest/10">
    <Skeleton
      v-if="loading"
      width="100%"
      height="100%"
      border-radius="0px"
      class="aspect-video w-full"
    />
    <img
      v-else-if="src"
      :src="src"
      :alt="alt"
      class="aspect-video h-full w-full object-cover"
    >
  </div>
</template>

<script setup>
import Skeleton from "primevue/skeleton";

defineProps({
  src: { type: String, default: "" },
  alt: { type: String, default: "" },
  loading: { type: Boolean, default: false },
});
</script>

<style lang="scss" scoped>
</style>