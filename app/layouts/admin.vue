<template>
  <RoleDashboardShell
    role="admin"
    title="لوحة مدير النظام"
    subtitle="نظرة عامة على العمليات"
    :stats="stats"
  >
    <slot />
  </RoleDashboardShell>
</template>

<script setup>
import RoleDashboardShell from "~/components/dashboard/RoleDashboardShell.vue";

const stats = [
  { label: "إجمالي المبيعات", value: "12,450", tag: "اليوم", note: "+18% مقارنة بالأمس" },
  { label: "الحجوزات", value: "86", tag: "نشطة", note: "12 تحتاج متابعة" },
  { label: "المخزون", value: "1,240", tag: "العناصر", note: "34 منخفضة" },
  { label: "الطلاب", value: "430", tag: "مسجلين", note: "+9 هذا الأسبوع" },
];
</script>
