<template>
  <div class="overflow-hidden rounded-lg border border-forest/40 bg-forest/10">
    <Skeleton
      v-if="loading"
      width="100%"
      height="100%"
      border-radius="0px"
      class="w-full"
      :class="aspectClass"
    />
    <img
      v-else-if="src"
      :src="src"
      :alt="alt"
      class="h-full w-full object-cover"
      :class="aspectClass"
    >
  </div>
</template>

<script setup>
import Skeleton from "primevue/skeleton";

const props = defineProps({
  // { file_url: String, location: "landscape" | "portrait" }
  image: { type: Object, default: () => ({}) },
  alt: { type: String, default: "" },
  loading: { type: Boolean, default: false },
});

const src = computed(() => props.image?.file_url || "");

const aspectClass = computed(() =>
  props.image?.location === "portrait" ? "aspect-[3/4]" : "aspect-video"
);
</script>

<style lang="scss" scoped>
</style>