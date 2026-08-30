<template>
  <div class="overflow-hidden rounded-lg border border-forest/40 bg-black">
    <Skeleton
      v-if="loading"
      width="100%"
      height="100%"
      border-radius="0px"
      class="aspect-video w-full"
    />
    <video
      v-else-if="src"
      :src="src"
      controls
      class="aspect-video h-full w-full"
    />
  </div>
</template>

<script setup>
import Skeleton from "primevue/skeleton";

defineProps({
  src: { type: String, default: "" },
  loading: { type: Boolean, default: false },
});
</script>

<style lang="scss" scoped>
</style>