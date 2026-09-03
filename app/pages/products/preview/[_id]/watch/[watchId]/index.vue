<template>
  <div>
    <watch />
  </div>
</template>
<script setup>
import watch from "~/components/products/watch/index.vue";
definePageMeta({
  middleware: ["local-pages"],
  layout: "inner-pages",
});
</script>

<style lang="scss" scoped>
</style>
