<template>
  <NuxtRouteAnnouncer />
  <NuxtLayout :name="layoutName">
    <NuxtPage />
  </NuxtLayout>
</template>
<script setup>
const layoutName = "default";
</script>

