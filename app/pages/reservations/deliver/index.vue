<template>
  <div class="space-y-4 bg-[#0f172a] p-4 text-right text-slate-100" dir="rtl">
    <div class="flex items-center justify-between gap-3 rounded-xl border border-slate-700 bg-[#111827] p-2 shadow-sm">
      <div class="relative flex-1">
        <span class="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">⌕</span>
        <InputText
          v-model="search"
          placeholder="ابحث باسم الطالب أو رقم الموبايل أو رقم الحجز"
          class="w-full rounded-xl border border-slate-700 bg-slate-900 pr-10 text-right text-slate-100 placeholder:text-slate-400"
        />
      </div>

      <Button
        label="بحث"
        class="rounded-xl bg-[#1d4ed8] px-6 py-3 text-white shadow-sm"
        @click="searchReservations"
      />
    </div>

    <div class="grid gap-4 xl:grid-cols-[minmax(0,1.8fr)_minmax(260px,0.7fr)]">
      <div class="space-y-3">
        <div v-if="pending" class="grid gap-4">
          <Skeleton width="100%" height="4rem" border-radius="12px" />
          <Skeleton width="100%" height="4rem" border-radius="12px" />
        </div>

        <div v-else class="overflow-hidden rounded-xl border border-slate-700 bg-slate-900">
          <table class="w-full border-collapse text-sm">
            <thead class="bg-slate-800 text-right text-slate-200">
              <tr>
                <th class="px-3 py-3 text-center">الحالة</th>
                <th class="px-3 py-3 text-center">المبلغ</th>
                <th class="px-3 py-3 text-center">الفرع</th>
                <th class="px-3 py-3 text-center">المدرس</th>
                <th class="px-3 py-3 text-center">اسم الطالب</th>
                <th class="px-3 py-3 text-center">رقم الحجز</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in filteredReservations" :key="item.id" class="border-t border-slate-700 bg-slate-900 text-slate-200">
                <td class="px-3 py-3 text-center">
                  <span class="rounded-md bg-[#fef3c7] px-2 py-1 text-xs font-bold text-[#b45309]">
                    {{ item.status || "قيد الحجز" }}
                  </span>
                </td>
                <td class="px-3 py-3 text-center">{{ item.amount || 0 }}</td>
                <td class="px-3 py-3 text-center">{{ item.branch || item.branch_name || "-" }}</td>
                <td class="px-3 py-3 text-center">{{ item.teacher || item.teacher_name || "-" }}</td>
                <td class="px-3 py-3 text-center">{{ item.student || item.student_name || "-" }}</td>
                <td class="px-3 py-3 text-center">{{ item.id }}</td>
              </tr>
              <tr v-if="!filteredReservations.length">
                <td colspan="6" class="px-3 py-8 text-center text-slate-400">لا توجد حجوزات مطابقة</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex items-center justify-end gap-3">
          <InputText
            v-model="deliveryRef"
            placeholder="رقم الحجز / ملاحظة"
            class="w-52 rounded-xl border border-slate-700 bg-slate-900 text-right text-slate-100 placeholder:text-slate-400"
          />

          <Button
            label="تسليم الحجز"
            class="rounded-xl bg-[#f59e0b] px-8 py-3 text-xl font-bold text-white shadow-md"
            :disabled="!selectedId"
            :loading="loadingId === selectedId"
            @click="deliverReservation"
          />
        </div>
      </div>

      <div v-if="deliveryCompleted" class="flex min-h-[220px] items-center justify-center rounded-xl border border-slate-700 bg-[#111827] p-4">
        <div class="text-center">
          <div class="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#22c55e] text-4xl font-bold text-white shadow-md">
            ✓
          </div>
          <p class="text-xl font-bold text-[#34d399]">تم تسليم الحجز بنجاح</p>
          <p class="mt-2 text-sm text-slate-300">تم خصم الكمية من المخزون</p>
        </div>
      </div>
    </div>
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
const deliveryRef = ref("");
const selectedId = ref("");
const deliveryCompleted = ref(false);
const reservations = ref([]);

const filteredReservations = computed(() => {
  const term = search.value.trim().toLowerCase();
  const list = reservations.value.filter((item) => item.status !== "delivered" && item.status !== "cancelled");

  if (!term) return list;

  return list.filter((item) =>
    `${item.student || item.student_name || ""} ${item.phone || ""} ${item.book || item.product || ""} ${item.id || ""} ${item.code || ""}`
      .toLowerCase()
      .includes(term)
  );
});

const searchReservations = () => {
  if (!search.value.trim()) {
    selectedId.value = filteredReservations.value[0]?.id || "";
  }
};

const loadReservations = async () => {
  try {
    const items = await reservationService.getReservations();
    reservations.value = Array.isArray(items) ? items : items?.data || [];
    if (filteredReservations.value[0]) selectedId.value = filteredReservations.value[0].id;
  } catch (error) {
    console.error("Failed to load reservations for delivery", error);
    reservations.value = [];
  } finally {
    pending.value = false;
  }
};

const deliverReservation = async () => {
  if (!selectedId.value) return;
  loadingId.value = selectedId.value;

  try {
    await reservationService.deliverReservation(selectedId.value, deliveryRef.value);
    reservations.value = reservations.value.filter((reservation) => reservation.id !== selectedId.value);
    deliveryCompleted.value = true;
    deliveryRef.value = "";
    selectedId.value = filteredReservations.value[0]?.id || "";
  } finally {
    loadingId.value = null;
  }
};

onMounted(() => {
  loadReservations();
});

definePageMeta({ middleware: ["local-pages"] });
</script>
