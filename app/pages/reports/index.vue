<template>
  <AdminReportsPage />
</template>

<script setup>
import AdminReportsPage from "~/components/dashboard/pages/reports/AdminReportsPage.vue";

definePageMeta({ middleware: ["local-pages"] });
</script>
