<template>
  <div>
    <index />
  </div>
</template>
<script setup>
import index from "~/components/creators/index.vue";
definePageMeta({
  middleware: ["local-pages"],
});

// ---- SEO: creators list ----
useSeoMeta({
  title: "Creators | Performance",
  description:
    "Meet the creators behind the content. Explore creator profiles and their exclusive video experiences.",
  ogTitle: "Creators | Performance",
  ogDescription:
    "Meet the creators behind the content. Explore creator profiles and their exclusive video experiences.",
  ogType: "website",
  twitterCard: "summary_large_image",
});
</script>

<style lang="scss" scoped>
</style>