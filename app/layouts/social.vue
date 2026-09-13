<template>
  <RoleDashboardShell
    role="social"
    title="لوحة التواصل الاجتماعي"
    subtitle="متابعة الطلبة والحجوزات"
    :stats="stats"
  >
    <slot />
  </RoleDashboardShell>
</template>

<script setup>
import RoleDashboardShell from "~/components/dashboard/RoleDashboardShell.vue";

const stats = [
  { label: "الحجوزات", value: "42", tag: "جديدة", note: "7 تحتاج مراجعة" },
  { label: "الطلاب", value: "220", tag: "متابع", note: "18 معروضون" },
  { label: "التواصل", value: "94", tag: "رسائل", note: "قيد المتابعة" },
  { label: "المبيعات", value: "2,140", tag: "هذا الأسبوع", note: "+5%" },
];
</script>
