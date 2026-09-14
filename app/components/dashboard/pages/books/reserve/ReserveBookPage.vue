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

const route = useRoute();
const authStore = useAuthStore();
const selectedBook = computed(() => route.query.book || "");

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
