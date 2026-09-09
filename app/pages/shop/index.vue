<template>
  <shop />
</template>

<script setup>
import shop from "~/components/non-loggedin/shop/index.vue";

definePageMeta({
  layout: "non-loggedin",
});

// ---- SEO: shop ----
useSeoMeta({
  title: "Shop | Performance",
  description:
    "Shop exclusive products and video experiences from independent creators.",
  ogTitle: "Shop | Performance",
  ogDescription:
    "Shop exclusive products and video experiences from independent creators.",
  ogType: "website",
  twitterCard: "summary_large_image",
});
</script>

<style lang="scss" scoped>
</style>