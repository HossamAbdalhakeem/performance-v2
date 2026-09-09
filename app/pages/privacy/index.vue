<template>
  <div>
    <index />
  </div>
</template>
<script setup>
import index from "~/components/privacy/index.vue";
definePageMeta({
  middleware: ["local-pages"],
});

// ---- SEO: privacy policy ----
useSeoMeta({
  title: "Privacy Policy | Performance",
  description:
    "Read our privacy policy to understand how we collect, use and protect your data.",
  ogTitle: "Privacy Policy | Performance",
  ogDescription:
    "Read our privacy policy to understand how we collect, use and protect your data.",
  ogType: "website",
  twitterCard: "summary",
});
</script>

<style lang="scss" scoped>
</style>
