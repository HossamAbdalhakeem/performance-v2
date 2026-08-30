<template>
  <div>
    <index />
  </div>
</template>
<script setup>
import index from "~/components/home/index.vue";
definePageMeta({
  middleware: ["local-pages"],
});
</script>

<style lang="scss" scoped>
</style>