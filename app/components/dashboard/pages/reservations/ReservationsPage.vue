<template>
  <div class="space-y-6">
    <Card>
      <template #content>
        <BookingForm
          title="حجز الكتب"
          submit-label="تأكيد الحجز"
          show-header
          show-hint
          show-receipt
          require-branch
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

const submitReservation = async (payload) => {
  return await reservationService.createReservation(payload);
};
</script>
