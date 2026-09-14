<template>
  <CancelReservationPage />
</template>

<script setup>
import CancelReservationPage from "~/components/dashboard/pages/reservations/cancel/CancelReservationPage.vue";

definePageMeta({ middleware: ["local-pages"] });
</script>
