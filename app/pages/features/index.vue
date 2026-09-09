<template>
  <features />
</template>

<script setup>
import features from "~/components/non-loggedin/features/index.vue";


definePageMeta({
  layout: "non-loggedin",
});

// ---- SEO: features ----
useSeoMeta({
  title: "Features | Performance",
  description:
    "Everything you need to publish, stream and monetize your video content.",
  ogTitle: "Features | Performance",
  ogDescription:
    "Everything you need to publish, stream and monetize your video content.",
  ogType: "website",
  twitterCard: "summary_large_image",
});
</script>

<style lang="scss" scoped>
</style>