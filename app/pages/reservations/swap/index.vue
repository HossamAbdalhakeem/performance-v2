<template>
  <SwapReservationPage />
</template>

<script setup>
import SwapReservationPage from "~/components/dashboard/pages/reservations/swap/SwapReservationPage.vue";

definePageMeta({ middleware: ["local-pages"] });
</script>
