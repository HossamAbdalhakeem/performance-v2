<template>
  <div>
    <index />
  </div>
</template>
<script setup>
import index from "~/components/products/index.vue";
definePageMeta({
  middleware: ["local-pages"],
});
</script>

<style lang="scss" scoped>
</style>