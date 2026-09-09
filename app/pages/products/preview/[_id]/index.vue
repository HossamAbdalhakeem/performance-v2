<template>
  <div>
    <index />
  </div>
</template>
<script setup>
import index from "~/components/products/preview/index.vue";
definePageMeta({
  // middleware: ["local-pages"],
  layout: "inner-pages",
});
</script>

<style lang="scss" scoped>
</style>