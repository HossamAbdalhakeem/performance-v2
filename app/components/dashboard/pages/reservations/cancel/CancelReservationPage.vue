<template>
  <div class="p-6 text-right" dir="rtl">
    <p class="text-slate-600">تم نقل إدارة إلغاء الحجوزات إلى صفحة الحجوزات.</p>
    <NuxtLink
      to="/reservations/manage"
      class="mt-3 inline-block text-sky-600 underline"
    >
      الذهاب إلى الحجوزات
    </NuxtLink>
  </div>
</template>

<script setup>
defineOptions({ name: "CancelReservationPage" });

await navigateTo("/reservations/manage");
</script>
