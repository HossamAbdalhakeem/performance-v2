<template>
  <div class="space-y-4 bg-[#0f172a] p-4 text-right text-slate-100" dir="rtl">
    <div class="relative w-full max-w-xl">
      <InputText
        v-model="search"
        placeholder="🔍 ابحث باسم الطالب أو رقم الموبايل أو رقم الحجز"
        class="w-full rounded-xl border border-slate-700 bg-slate-900 text-right text-slate-100 placeholder:text-slate-400"
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
      :value="filteredReservations"
      :columns="tableColumns"
      :loading="loading"
      :empty-message="emptyMessage"
      :skeleton-rows="4"
    >
      <template #status="{ data }">
        <span
          class="rounded-md px-2 py-1 text-xs font-bold"
          :class="statusClass(data)"
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
          <p class="mt-1">
            <span class="text-slate-400">المنتج:</span>
            {{ selectedReservation.productName }}
          </p>
          <p class="mt-1">
            <span class="text-slate-400">المدفوع:</span>
            {{ formatMoney(selectedReservation.paidAmount) }}
          </p>
          <p v-if="needsRemainingPayment" class="mt-1 text-orange-300">
            <span class="text-slate-400">المتبقي:</span>
            {{ formatMoney(selectedReservation.remainingAmount) }}
          </p>
        </div>

        <div class="flex flex-col gap-2 text-right">
          <label class="text-xs text-slate-300">
            طريقة الدفع
            <span v-if="needsRemainingPayment" class="text-orange-300">(مطلوبة للمبلغ المتبقي)</span>
          </label>
          <Select
            v-model="paymentMethod"
            :options="paymentOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="اختر طريقة الدفع"
            class="w-full"
          />
        </div>

        <div class="flex flex-col gap-2 text-right">
          <label class="text-xs text-slate-300">مرجع الإثبات (اختياري)</label>
          <InputText
            v-model="proofReference"
            placeholder="رقم العملية / مرجع التحويل"
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
import Select from "primevue/select";
import AppDataTable from "~/components/shared/app-data-table/index.vue";
import { reservationService } from "~/services/reservationService";

const STATUS_META = {
  PENDING: { label: "قيد الانتظار", class: "bg-amber-500/20 text-amber-300" },
  WAITING_FOR_STOCK: { label: "بانتظار المخزون", class: "bg-amber-500/20 text-amber-300" },
  READY: { label: "جاهز للتسليم", class: "bg-emerald-500/20 text-emerald-300" },
  DELIVERED: { label: "تم التسليم", class: "bg-slate-500/20 text-slate-300" },
  CANCELLED: { label: "ملغي", class: "bg-red-500/20 text-red-300" },
};

const paymentOptions = [
  { label: "كاش", value: "CASH" },
  { label: "انستا باي", value: "INSTAPAY" },
  { label: "محفظة إلكترونية", value: "WALLET" },
];

const loading = ref(false);
const delivering = ref(false);
const search = ref("");
const paymentMethod = ref("CASH");
const proofReference = ref("");
const dialogVisible = ref(false);
const dialogError = ref("");
const selectedReservation = ref(null);
const reservations = ref([]);
const feedback = reactive({ type: "success", message: "" });

const formatMoney = (value) => `${Number(value || 0).toFixed(2)} ج.م`;

const emptyMessage = computed(() =>
  search.value.trim()
    ? "لا توجد حجوزات مطابقة"
    : "لا توجد حجوزات قابلة للعرض",
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
  return Boolean(paymentMethod.value);
});

const filteredReservations = computed(() => {
  const q = search.value.trim().toLowerCase();
  if (!q) return reservations.value;

  return reservations.value.filter((item) => {
    return (
      String(item.reservationNumber || "").toLowerCase().includes(q) ||
      String(item.studentName || "").toLowerCase().includes(q) ||
      String(item.phone || "").toLowerCase().includes(q) ||
      String(item.productName || "").toLowerCase().includes(q)
    );
  });
});

const isDeliverable = (item) => item?.status === "READY";

const statusClass = (item) =>
  STATUS_META[item?.status]?.class || "bg-slate-500/20 text-slate-300";

const getRemainingAmount = (item) => {
  const total = Number(item.totalAmount ?? item.total_amount ?? 0);
  const paid = Number(item.paidAmount ?? item.paid_amount ?? 0);
  return Math.max(total - paid, 0);
};

const normalizeReservation = (item) => {
  const remainingAmount = getRemainingAmount(item);
  const status = String(item.status || "").toUpperCase();
  const meta = STATUS_META[status] || { label: status || "-" };
  const paidAmount = Number(item.paidAmount ?? item.paid_amount ?? 0);

  return {
    ...item,
    id: item.id,
    reservationNumber:
      item.reservationNumber || item.reservation_number || item.code || item.id,
    studentName: item.student?.name || item.student_name || "-",
    phone: item.student?.phone || item.phone || "",
    teacherName:
      item.product?.teacher?.fullName ||
      item.product?.teacher?.name ||
      item.teacher_name ||
      "-",
    productName: item.product?.name || item.product_name || "-",
    paidAmount,
    remainingAmount,
    hasRemaining: remainingAmount > 0,
    status,
    statusLabel:
      remainingAmount > 0 && status === "READY"
        ? "جاهز · متبقي مبلغ"
        : meta.label,
  };
};

const openDeliverDialog = (item) => {
  if (!isDeliverable(item)) return;

  selectedReservation.value = item;
  paymentMethod.value = "CASH";
  proofReference.value = "";
  dialogError.value = "";
  dialogVisible.value = true;
  feedback.message = "";
};

const closeDeliverDialog = () => {
  dialogVisible.value = false;
  selectedReservation.value = null;
  paymentMethod.value = "CASH";
  proofReference.value = "";
  dialogError.value = "";
};

const loadReservations = async () => {
  loading.value = true;
  feedback.message = "";

  try {
    const items = await reservationService.getReservations();
    const list = Array.isArray(items) ? items : items?.data || [];
    reservations.value = list
      .map(normalizeReservation)
      .filter((item) => item.status !== "DELIVERED" && item.status !== "CANCELLED");
  } catch (error) {
    reservations.value = [];
    feedback.type = "error";
    feedback.message = error?.message || "تعذر تحميل الحجوزات.";
  } finally {
    loading.value = false;
  }
};

const deliverReservation = async () => {
  if (!canConfirmDeliver.value || !selectedReservation.value) return;

  delivering.value = true;
  dialogError.value = "";
  feedback.message = "";

  try {
    await reservationService.deliverReservation(selectedReservation.value.id, {
      method: paymentMethod.value,
      proofReference: proofReference.value.trim() || undefined,
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

onMounted(loadReservations);
</script>
