<template>
  <div class="space-y-6">
    <Card>
      <template #title>
        <span class="text-lg font-bold text-slate-900">تسليم الحجز</span>
      </template>

      <template #content>
        <div class="space-y-5">
          <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-right">
            <p class="text-sm text-slate-500">بحث</p>
            <InputText v-model="search" placeholder="اسم الطالب أو رقم الحجز" class="mt-2 w-full max-w-md" />
          </div>

          <div v-if="pending" class="grid gap-4">
            <Skeleton width="100%" height="4rem" border-radius="12px" />
            <Skeleton width="100%" height="4rem" border-radius="12px" />
          </div>

          <div v-else class="space-y-3">
            <div v-for="item in filteredReservations" :key="item.id" class="rounded-2xl border border-slate-200 p-4">
              <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div class="text-right">
                  <p class="font-bold text-slate-900">حجز #{{ item.id }}</p>
                  <p class="mt-1 text-sm text-slate-600">طالب: {{ item.student }} | كتاب: {{ item.book }} | فرع: {{ item.branch }} | الحالة: {{ item.status }}</p>
                </div>
                <Button
                  label="تسليم الحجز"
                  severity="success"
                  :loading="loadingId === item.id"
                  @click="deliverReservation(item)"
                />
              </div>
            </div>
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
import Card from "primevue/card";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Skeleton from "primevue/skeleton";
import { reservationService } from "~/services/reservationService";

const pending = ref(true);
const loadingId = ref(null);
const search = ref("");
const reservations = ref([]);

const filteredReservations = computed(() => {
  const term = search.value.trim().toLowerCase();

  if (!term) return reservations.value;

  return reservations.value.filter((item) =>
    `${item.student || ""} ${item.book || ""} ${item.branch || ""} ${item.id || ""}`
      .toLowerCase()
      .includes(term)
  );
});

const loadReservations = async () => {
  try {
    const items = await reservationService.getReservations();
    reservations.value = Array.isArray(items) ? items : items?.data || [];
  } catch (error) {
    console.error("Failed to load reservations for delivery", error);
    reservations.value = [];
  } finally {
    pending.value = false;
  }
};

const deliverReservation = async (item) => {
  loadingId.value = item.id;

  try {
    await reservationService.deliverReservation(item.id);
    reservations.value = reservations.value.filter((reservation) => reservation.id !== item.id);
  } finally {
    loadingId.value = null;
  }
};

onMounted(() => {
  loadReservations();
});

definePageMeta({ middleware: ["local-pages"] });
</script>
