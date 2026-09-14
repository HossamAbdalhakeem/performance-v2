<template>
  <AddInventoryPage />
</template>

<script setup>
import AddInventoryPage from "~/components/dashboard/pages/inventory/add/AddInventoryPage.vue";

definePageMeta({ middleware: ["local-pages"] });
</script>
