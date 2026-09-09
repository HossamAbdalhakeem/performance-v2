<template>
  <how />
</template>

<script setup>
import how from "~/components/non-loggedin/how/index.vue";

definePageMeta({
  layout: "non-loggedin",
});

// ---- SEO: how it works ----
useSeoMeta({
  title: "How It Works | Performance",
  description:
    "Learn how to create, publish and sell your video experiences step by step.",
  ogTitle: "How It Works | Performance",
  ogDescription:
    "Learn how to create, publish and sell your video experiences step by step.",
  ogType: "website",
  twitterCard: "summary_large_image",
});
</script>

<style lang="scss" scoped>
</style>