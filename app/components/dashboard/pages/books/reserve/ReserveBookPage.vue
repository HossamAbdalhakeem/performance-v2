<template>
  <div class="space-y-6">
    <Card>
      <template #content>
        <BookingForm
          title="احجز كتاب"
          submit-label="تأكيد الحجز"
          show-header
          show-hint
          show-receipt
          back-to="/books"
          :initial-product="selectedBook"
          :submit-fn="submitReservation"
        />
      </template>
    </Card>
  </div>
</template>

<script setup>
import Card from "primevue/card";
import BookingForm from "~/components/dashboard/BookingForm.vue";
import { reservationService } from "~/services/reservationService";

const route = useRoute();
const selectedBook = computed(() => route.query.book || "");

const submitReservation = async (payload) => {
  return await reservationService.createReservation({
    ...payload,
    status: "pending",
  });
};
</script>
