<template>
  <BranchEmployeeReportsPage />
</template>

<script setup>
/** @deprecated Prefer BranchEmployeeReportsPage / CustomerServiceReportsPage */
import BranchEmployeeReportsPage from "~/components/dashboard/pages/reports/branch/BranchEmployeeReportsPage.vue";

defineOptions({ name: "BranchDailyReportPage" });
</script>
