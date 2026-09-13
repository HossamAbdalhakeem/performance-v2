<template>
  <RoleDashboardShell
    role="branch"
    title="لوحة فرع المكتبة"
    subtitle="إدارة العمليات اليومية"
    :stats="stats"
  >
    <slot />
  </RoleDashboardShell>
</template>

<script setup>
import RoleDashboardShell from "~/components/dashboard/RoleDashboardShell.vue";

const stats = [
  { label: "المبيعات", value: "3,960", tag: "اليوم", note: "+12%" },
  { label: "الحجوزات", value: "21", tag: "قيد التنفيذ", note: "5 تستحق التسليم" },
  { label: "الطلاب", value: "178", tag: "نشط", note: "13 جدد" },
  { label: "المخزون", value: "540", tag: "متوفر", note: "8 مخصصين" },
];
</script>
