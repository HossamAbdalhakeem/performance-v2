<template>
  <BranchDailyReportPage />
</template>

<script setup>
import BranchDailyReportPage from "~/components/dashboard/pages/reports/BranchDailyReportPage.vue";

definePageMeta({ middleware: ["local-pages"] });
</script>
