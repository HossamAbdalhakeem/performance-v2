<template>
  <SalesPage />
</template>

<script setup>
import SalesPage from "~/components/dashboard/pages/sales/SalesPage.vue";

definePageMeta({ middleware: ["local-pages"] });
</script>
