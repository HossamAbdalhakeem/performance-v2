<template>
  <NuxtRouteAnnouncer />
  <NuxtLayout :name="layoutName">
    <NuxtPage />
  </NuxtLayout>
</template>
<script setup>
const route = useRoute();
const layoutName = computed(() => {
  const metaLayout = route.meta?.layout;
  if (metaLayout) return metaLayout;
  return "default";
});
</script>

