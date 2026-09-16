<template>
  <BookReservationPage
    title="احجز كتاب"
    show-header
    show-receipt
    back-to="/books"
    :initial-product="selectedBook"
  />
</template>

<script setup>
import BookReservationPage from "~/components/dashboard/pages/reservations/BookReservationPage.vue";

const route = useRoute();
const selectedBook = computed(() => route.query.book || "");
</script>
