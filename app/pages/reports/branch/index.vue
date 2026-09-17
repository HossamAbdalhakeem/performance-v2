<template>
  <BranchEmployeeReportsPage />
</template>

<script setup>
import BranchEmployeeReportsPage from "~/components/dashboard/pages/reports/BranchEmployeeReportsPage.vue";

definePageMeta({ middleware: ["local-pages"] });
</script>
