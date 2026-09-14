<template>
  <ReportsPage />
</template>

<script setup>
import ReportsPage from "~/components/dashboard/pages/reports/ReportsPage.vue";

definePageMeta({ middleware: ["local-pages"] });
</script>
