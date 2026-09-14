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
          :role="bookingRole"
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
import { useAuthStore } from "~/store/auth";

const authStore = useAuthStore();

const bookingRole = computed(() => {
  const roles = authStore.getRoles || authStore.user?.roles || [];
  const list = Array.isArray(roles) ? roles : [roles];
  if (list.some((role) => String(role).toUpperCase() === "CUSTOMER_SERVICE")) {
    return "CUSTOMER_SERVICE";
  }
  return authStore.user?.role || authStore.getRole || "";
});

const submitReservation = async (payload) => {
  return await reservationService.createReservation(payload);
};
</script>
