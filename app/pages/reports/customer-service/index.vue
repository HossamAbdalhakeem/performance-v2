<template>
  <CustomerServiceReportsPage />
</template>

<script setup>
import CustomerServiceReportsPage from "~/components/dashboard/pages/reports/CustomerServiceReportsPage.vue";

definePageMeta({ middleware: ["local-pages"] });
</script>
