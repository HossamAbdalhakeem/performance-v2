<template>
  <InventoryPage />
</template>

<script setup>
import InventoryPage from "~/components/dashboard/pages/inventory/InventoryPage.vue";

definePageMeta({ middleware: ["local-pages"] });
</script>
