<template>
  <RoleDashboardShell
    role="branch"
    title="لوحة فرع المكتبة"
    subtitle="إدارة العمليات اليومية"
  >
    <slot />
  </RoleDashboardShell>
</template>

<script setup>
import RoleDashboardShell from "~/components/dashboard/RoleDashboardShell.vue";
</script>
