<template>
  <div class="space-y-4 bg-[#0f172a] p-4 text-right text-slate-100" dir="rtl">
    <div class="relative w-full max-w-xl">
      <span class="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">⌕</span>
      <InputText
        v-model="search"
        placeholder="ابحث باسم الطالب أو رقم الموبايل أو رقم الحجز"
        class="w-full rounded-xl border border-slate-700 bg-slate-900 pr-10 text-right text-slate-100 placeholder:text-slate-400"
        @update:modelValue="onSearchInput"
      />
    </div>

    <p
      v-if="feedback.message"
      class="rounded-xl px-3 py-2 text-sm"
      :class="
        feedback.type === 'error'
          ? 'bg-red-500/15 text-red-300'
          : 'bg-emerald-500/15 text-emerald-300'
      "
    >
      {{ feedback.message }}
    </p>

    <div class="grid gap-4 xl:grid-cols-[minmax(0,1.8fr)_minmax(260px,0.7fr)]">
      <div class="space-y-3">
        <AppDataTable
          :value="reservations"
          :columns="tableColumns"
          :loading="loading"
          :empty-message="emptyMessage"
          :row-class="getRowClass"
          :skeleton-rows="2"
        >
          <template #status="{ data }">
            <span
              class="rounded-md px-2 py-1 text-xs font-bold"
              :class="
                data.hasRemaining
                  ? 'bg-orange-500/20 text-orange-300'
                  : 'bg-[#fef3c7] text-[#b45309]'
              "
            >
              {{ data.statusLabel }}
            </span>
          </template>
        </AppDataTable>

        <div
          class="flex flex-col gap-3 rounded-xl border border-slate-700 bg-[#111827] p-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div
            v-if="needsRemainingPayment"
            class="flex min-w-[30%] flex-col gap-2 text-right"
          >
            <label class="text-xs text-slate-300">سداد المبلغ المتبقي</label>
            <AppInputNumber
              v-model="remainingPaidAmount"
              mode="currency"
              currency="EGP"
              :min="0"
              :min-fraction-digits="2"
              :use-grouping="true"
            />
            <p class="text-[11px] leading-[1] text-orange-300">
              المتبقي: {{ formatMoney(matchedReservation?.remainingAmount) }}
            </p>
          </div>

          <div class="flex min-w-[30%] flex-col gap-2 text-right">
            <label class="text-xs text-slate-300">ملاحظة (اختياري)</label>
            <InputText
              v-model="note"
              placeholder="سجّل ملاحظة إن وجدت"
              class="w-full rounded-xl border border-slate-700 bg-slate-900 text-right text-slate-100 placeholder:text-slate-400"
            />
          </div>

          <Button
            label="تسليم الحجز"
            class="rounded-xl bg-[#f59e0b] px-8 py-3 text-xl font-bold text-white shadow-md"
            :disabled="!canDeliver"
            :loading="delivering"
            @click="deliverReservation"
          />
        </div>

        <p
          v-if="search.trim() && reservations.length > 1"
          class="text-xs text-slate-400"
        >
          ضيّق البحث حتى تظهر نتيجة واحدة فقط لتفعيل التسليم.
        </p>
      </div>

      <div
        v-if="deliveryCompleted"
        class="flex min-h-[220px] items-center justify-center rounded-xl border border-slate-700 bg-[#111827] p-4"
      >
        <div class="text-center">
          <div
            class="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#22c55e] text-4xl font-bold text-white shadow-md"
          >
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
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import AppDataTable from "~/components/shared/app-data-table/index.vue";
import AppInputNumber from "~/components/dashboard/AppInputNumber.vue";
import { reservationService } from "~/services/reservationService";
import { useThrottledCallback } from "~/composables/useThrottledCallback";

const DELIVERABLE_STATUSES = new Set([
  "PENDING",
  "READY",
  "WAITING_FOR_STOCK",
  "pending",
  "ready",
]);

const loading = ref(false);
const delivering = ref(false);
const search = ref("");
const note = ref("");
const remainingPaidAmount = ref(null);
const deliveryCompleted = ref(false);
const reservations = ref([]);
const feedback = reactive({ type: "success", message: "" });

const formatMoney = (value) => `${Number(value || 0).toFixed(2)} ج.م`;

const emptyMessage = computed(() =>
  search.value.trim()
    ? "لا توجد حجوزات مطابقة"
    : "ابدأ بالبحث لعرض الحجوزات",
);

const tableColumns = [
  { field: "reservationNumber", header: "رقم الحجز" },
  { field: "studentName", header: "اسم الطالب" },
  { field: "phone", header: "الموبايل", fallback: "-" },
  { field: "productName", header: "المنتج" },
  { field: "teacherName", header: "المدرس" },
  { field: "paidAmount", header: "المبلغ المدفوع", format: formatMoney },
  { field: "remainingAmount", header: "المبلغ المتبقي", format: formatMoney },
  { field: "statusLabel", header: "الحالة", slot: "status" },
];

const getRemainingAmount = (item) => {
  if (item.remainingAmount != null) return Number(item.remainingAmount);
  if (item.remaining_amount != null) return Number(item.remaining_amount);

  const total = Number(item.totalAmount ?? item.total_amount ?? 0);
  const paid = Number(item.paidAmount ?? item.paid_amount ?? item.deposit ?? 0);
  return Math.max(total - paid, 0);
};

const normalizeReservation = (item) => {
  const remainingAmount = getRemainingAmount(item);
  const status = String(item.status || "PENDING").toUpperCase();
  const hasRemaining = remainingAmount > 0;
  const paidAmount = Number(
    item.paidAmount ?? item.paid_amount ?? item.deposit ?? 0,
  );

  return {
    ...item,
    id: item.id,
    reservationNumber:
      item.reservationNumber || item.reservation_number || item.code || item.id,
    studentName: item.student?.name || item.student_name || item.student || "-",
    phone: item.student?.phone || item.phone || "",
    teacherName:
      item.product?.teacher?.name ||
      item.teacher?.name ||
      item.teacher_name ||
      item.teacher ||
      "-",
    productName: item.product?.name || item.product_name || item.product || "-",
    paidAmount,
    remainingAmount,
    hasRemaining,
    status,
    statusLabel: hasRemaining ? "متبقي مبلغ" : "قيد الحجز",
  };
};

const matchedReservation = computed(() =>
  search.value.trim() && reservations.value.length === 1
    ? reservations.value[0]
    : null,
);

const getRowClass = (data) =>
  matchedReservation.value?.id === data.id ? "app-row-matched" : "";

const needsRemainingPayment = computed(() =>
  Boolean(matchedReservation.value?.hasRemaining),
);

const isDeliverableStatus = computed(() => {
  const item = matchedReservation.value;
  if (!item) return false;
  return (
    DELIVERABLE_STATUSES.has(item.status) ||
    item.statusLabel === "قيد الحجز" ||
    item.hasRemaining
  );
});

const canDeliver = computed(() => {
  if (!matchedReservation.value || !isDeliverableStatus.value) return false;

  if (needsRemainingPayment.value) {
    return Number(remainingPaidAmount.value || 0) > 0;
  }

  return true;
});

const searchReservations = async (term = "") => {
  const query = String(term || "").trim();
  feedback.message = "";

  if (!query) {
    reservations.value = [];
    loading.value = false;
    return;
  }

  loading.value = true;

  try {
    const items = await reservationService.getReservations({ search: query });
    const list = Array.isArray(items) ? items : items?.data || [];
    reservations.value = list
      .map(normalizeReservation)
      .filter((item) => item.status !== "DELIVERED" && item.status !== "CANCELLED");
  } catch (error) {
    reservations.value = [];
    feedback.type = "error";
    feedback.message = error?.message || "تعذر البحث في الحجوزات.";
  } finally {
    loading.value = false;
  }
};

const { run: runSearch } = useThrottledCallback((term) => {
  searchReservations(term);
}, 350);

const onSearchInput = (value) => {
  runSearch(value || "");
};

const deliverReservation = async () => {
  if (!canDeliver.value || !matchedReservation.value) return;

  delivering.value = true;
  feedback.message = "";
  deliveryCompleted.value = false;

  try {
    await reservationService.deliverReservation(matchedReservation.value.id, {
      note: note.value || undefined,
      remainingAmount: needsRemainingPayment.value
        ? Number(remainingPaidAmount.value || 0)
        : undefined,
      paidAmount: needsRemainingPayment.value
        ? Number(remainingPaidAmount.value || 0)
        : undefined,
      method: "CASH",
    });

    deliveryCompleted.value = true;
    note.value = "";
    remainingPaidAmount.value = null;
    search.value = "";
    reservations.value = [];
    feedback.type = "success";
    feedback.message = "تم تسليم الحجز بنجاح.";
  } catch (error) {
    feedback.type = "error";
    feedback.message = error?.message || "تعذر تسليم الحجز.";
  } finally {
    delivering.value = false;
  }
};

watch(matchedReservation, (item) => {
  remainingPaidAmount.value = null;
  if (item?.hasRemaining) {
    remainingPaidAmount.value = Number(item.remainingAmount || 0);
  }
});
</script>
