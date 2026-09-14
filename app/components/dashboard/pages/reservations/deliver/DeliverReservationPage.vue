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

    <AppDataTable
      :value="reservations"
      :columns="tableColumns"
      :loading="loading"
      :empty-message="emptyMessage"
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

      <template #actions="{ data }">
        <Button
          label="تسليم"
          size="small"
          class="rounded-lg bg-[#f59e0b] px-4 py-2 text-sm font-bold text-white"
          :disabled="!isDeliverable(data)"
          @click="openDeliverDialog(data)"
        />
      </template>
    </AppDataTable>

    <Dialog
      v-model:visible="dialogVisible"
      modal
      dir="rtl"
      :header="dialogTitle"
      :style="{ width: '420px', maxWidth: '95vw' }"
      :pt="{
        root: { class: 'deliver-dialog' },
        header: { class: 'text-right' },
        content: { class: 'text-right' },
      }"
      @hide="closeDeliverDialog"
    >
      <div v-if="selectedReservation" class="flex flex-col gap-4">
        <div class="rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-300">
          <p>
            <span class="text-slate-400">رقم الحجز:</span>
            {{ selectedReservation.reservationNumber }}
          </p>
          <p class="mt-1">
            <span class="text-slate-400">الطالب:</span>
            {{ selectedReservation.studentName }}
          </p>
        </div>

        <div
          v-if="needsRemainingPayment"
          class="flex flex-col gap-2 text-right"
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
            المتبقي: {{ formatMoney(selectedReservation.remainingAmount) }}
          </p>
        </div>

        <div class="flex flex-col gap-2 text-right">
          <label class="text-xs text-slate-300">ملاحظة (اختياري)</label>
          <InputText
            v-model="note"
            placeholder="سجّل ملاحظة إن وجدت"
            class="w-full rounded-xl border border-slate-700 bg-slate-900 text-right text-slate-100 placeholder:text-slate-400"
          />
        </div>

        <p v-if="dialogError" class="text-sm text-red-300">{{ dialogError }}</p>
      </div>

      <template #footer>
        <div class="flex w-full justify-start gap-2">
          <Button
            label="تأكيد التسليم"
            class="rounded-xl bg-[#f59e0b] px-5 py-2 font-bold text-white"
            :disabled="!canConfirmDeliver"
            :loading="delivering"
            @click="deliverReservation"
          />
          <Button
            label="إلغاء"
            text
            severity="secondary"
            @click="closeDeliverDialog"
          />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import Button from "primevue/button";
import Dialog from "primevue/dialog";
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
const dialogVisible = ref(false);
const dialogError = ref("");
const selectedReservation = ref(null);
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
  { field: "actions", header: "إجراء", slot: "actions", style: "width: 7rem" },
];

const dialogTitle = computed(() =>
  selectedReservation.value
    ? `تسليم الحجز ${selectedReservation.value.reservationNumber}`
    : "تسليم الحجز",
);

const needsRemainingPayment = computed(() =>
  Boolean(selectedReservation.value?.hasRemaining),
);

const canConfirmDeliver = computed(() => {
  if (!selectedReservation.value || !isDeliverable(selectedReservation.value)) {
    return false;
  }

  if (needsRemainingPayment.value) {
    return Number(remainingPaidAmount.value || 0) > 0;
  }

  return true;
});

const isDeliverable = (item) => {
  if (!item) return false;
  return (
    DELIVERABLE_STATUSES.has(item.status) ||
    item.statusLabel === "قيد الحجز" ||
    item.hasRemaining
  );
};

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

const openDeliverDialog = (item) => {
  if (!isDeliverable(item)) return;

  selectedReservation.value = item;
  note.value = "";
  dialogError.value = "";
  remainingPaidAmount.value = item.hasRemaining
    ? Number(item.remainingAmount || 0)
    : null;
  dialogVisible.value = true;
  feedback.message = "";
};

const closeDeliverDialog = () => {
  dialogVisible.value = false;
  selectedReservation.value = null;
  note.value = "";
  remainingPaidAmount.value = null;
  dialogError.value = "";
};

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
  if (!canConfirmDeliver.value || !selectedReservation.value) return;

  delivering.value = true;
  dialogError.value = "";
  feedback.message = "";

  try {
    await reservationService.deliverReservation(selectedReservation.value.id, {
      note: note.value || undefined,
      remainingAmount: needsRemainingPayment.value
        ? Number(remainingPaidAmount.value || 0)
        : undefined,
      paidAmount: needsRemainingPayment.value
        ? Number(remainingPaidAmount.value || 0)
        : undefined,
      method: "CASH",
    });

    const deliveredId = selectedReservation.value.id;
    closeDeliverDialog();
    reservations.value = reservations.value.filter((item) => item.id !== deliveredId);
    feedback.type = "success";
    feedback.message = "تم تسليم الحجز بنجاح وتم خصم الكمية من المخزون.";
  } catch (error) {
    dialogError.value = error?.message || "تعذر تسليم الحجز.";
  } finally {
    delivering.value = false;
  }
};
</script>
