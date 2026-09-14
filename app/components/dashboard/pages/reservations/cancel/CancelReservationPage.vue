<template>
  <div class="space-y-6">
    <Card>
      <template #title>
        <span class="text-lg font-bold">إلغاء حجز</span>
      </template>
      <template #content>
        <div class="space-y-5">
          <div class="rounded-2xl border border-white/10 bg-slate-950/50 p-4 text-right">
            <label class="text-sm text-slate-300">بحث: اسم الطالب / رقم الموبايل / رقم الحجز</label>
            <InputText
              v-model="search"
              placeholder="🔍 اسم الطالب / رقم الموبايل / رقم الحجز"
              class="mt-2 w-full"
            />
          </div>

          <div v-if="pending" class="grid gap-4">
            <Skeleton width="100%" height="4rem" border-radius="12px" />
            <Skeleton width="100%" height="4rem" border-radius="12px" />
          </div>

          <div v-else class="space-y-3">
            <button
              v-for="item in filteredReservations"
              :key="item.id"
              type="button"
              class="w-full rounded-2xl border p-4 text-right transition"
              :class="selectedId === item.id ? 'border-sky-400 bg-sky-500/10' : 'border-white/10 hover:bg-white/5'"
              @click="selectedId = item.id"
            >
              <p class="font-bold text-white">حجز #{{ item.id }}</p>
              <p class="mt-1 text-sm text-slate-300">
                طالب: {{ item.student || item.student_name }} | كتاب: {{ item.book || item.product }} | فرع: {{ item.branch || item.branch_name }} | مبلغ: {{ item.amount }}
              </p>
            </button>

            <p v-if="!filteredReservations.length" class="py-8 text-center text-sm text-slate-400">
              لا يوجد حجز مطابق
            </p>
          </div>

          <div class="rounded-2xl border border-dashed border-white/20 bg-slate-950/60 p-4 text-right text-sm leading-7 text-slate-300">
            عند الإلغاء:
            <div>- يرجع الفلوس للطالب</div>
            <div>- يتخصم من عدد الكتب المحجوزة</div>
            <div>- الكتاب يرجع متاح للبيع المباشر</div>
          </div>

          <div class="flex justify-center">
            <Button
              label="تأكيد الغاء الحجز"
              severity="danger"
              :disabled="!selectedReservation"
              :loading="loadingId === selectedId"
              class="min-w-[180px]"
              @click="cancelReservation"
            />
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
const selectedId = ref("");
const reservations = ref([]);

const filteredReservations = computed(() => {
  const term = search.value.trim().toLowerCase();
  if (!term) return reservations.value;

  return reservations.value.filter((item) =>
    `${item.id || ""} ${item.code || ""} ${item.student || item.student_name || ""} ${item.phone || ""} ${item.book || item.product || ""}`
      .toLowerCase()
      .includes(term)
  );
});

const selectedReservation = computed(() =>
  reservations.value.find((item) => item.id === selectedId.value)
);

const loadReservations = async () => {
  try {
    const items = await reservationService.getReservations();
    reservations.value = Array.isArray(items) ? items : items?.data || [];
    if (reservations.value[0]) selectedId.value = reservations.value[0].id;
  } catch (error) {
    console.error("Failed to load reservations for cancel", error);
    reservations.value = [];
  } finally {
    pending.value = false;
  }
};

const cancelReservation = async () => {
  if (!selectedReservation.value) return;
  loadingId.value = selectedId.value;

  try {
    await reservationService.cancelReservation(selectedId.value, { reason: "cancelled_by_admin" });
    reservations.value = reservations.value.filter((reservation) => reservation.id !== selectedId.value);
    selectedId.value = reservations.value[0]?.id || "";
  } finally {
    loadingId.value = null;
  }
};

onMounted(() => {
  loadReservations();
});
</script>
