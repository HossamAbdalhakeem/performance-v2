<template>
  <div>
    <CreatorsProfile :alias="route.params.creatorId" />
  </div>
</template>
<script setup>
import CreatorsProfile from "~/components/creators/profile/index.vue";
definePageMeta({
  middleware: ["local-pages"],
  layout: "inner-pages",
});
const route = useRoute();
</script>

<style lang="scss" scoped>
</style>