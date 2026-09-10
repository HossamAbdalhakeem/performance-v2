<template>
  <div>
    <index />
  </div>
</template>
<script setup>
import index from "~/components/products/index.vue";
// definePageMeta({
//   middleware: ["local-pages"],
// });

// ---- SEO: products list ----
useSeoMeta({
  title: "Products | Performance",
  description:
    "Browse all products and video experiences. Watch exclusive content from your favorite creators.",
  ogTitle: "Products | Performance",
  ogDescription:
    "Browse all products and video experiences. Watch exclusive content from your favorite creators.",
  ogType: "website",
  twitterCard: "summary_large_image",
});
</script>

<style lang="scss" scoped>
</style>