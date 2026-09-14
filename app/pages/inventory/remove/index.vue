<template>
  <RemoveInventoryPage />
</template>

<script setup>
import RemoveInventoryPage from "~/components/dashboard/pages/inventory/remove/RemoveInventoryPage.vue";

definePageMeta({ middleware: ["local-pages"] });
</script>
