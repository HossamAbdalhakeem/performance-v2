<template>
  <div class="space-y-4 bg-[#0f172a] p-4 text-right text-slate-100" dir="rtl">
    <div class="relative w-full max-w-xl">
      <InputText
        v-model="search"
        placeholder="🔍 ابحث باسم الطالب أو رقم الموبايل أو رقم الحجز"
        class="w-full rounded-xl border border-slate-700 bg-slate-900 text-right text-slate-100 placeholder:text-slate-400"
      />
    </div>

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
      :style="{ width: '560px', maxWidth: '95vw' }"
      :pt="{
        root: { class: 'deliver-dialog' },
        header: { class: 'text-right' },
        content: { class: 'text-right' },
      }"
      @hide="closeDeliverDialog"
    >
      <div v-if="selectedReservation" class="flex flex-col gap-4">
        <div class="rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-3 text-sm text-slate-300">
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
          <div class="mt-3 grid gap-2 rounded-lg border border-slate-700/80 bg-slate-950/40 p-3 text-sm">
            <div class="flex items-center justify-between gap-2">
              <span class="text-slate-400">إجمالي المبلغ</span>
              <span class="font-semibold text-slate-100">
                {{ formatMoney(selectedReservation.totalAmount) }}
              </span>
            </div>
            <div class="flex items-center justify-between gap-2">
              <span class="text-slate-400">المدفوع مسبقاً</span>
              <span class="font-semibold text-emerald-300">
                {{ formatMoney(selectedReservation.paidAmount) }}
              </span>
            </div>
            <div class="flex items-center justify-between gap-2 border-t border-slate-700 pt-3">
              <span class="text-base font-bold text-slate-200">المتبقي</span>
              <span
                class="text-2xl font-extrabold tracking-tight"
                :class="
                  needsRemainingPayment ? 'text-orange-300' : 'text-emerald-300'
                "
              >
                {{ formatMoney(selectedReservation.remainingAmount) }}
              </span>
            </div>
          </div>
        </div>

        <div
          v-if="!needsRemainingPayment"
          class="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200"
        >
          تم سداد المبلغ بالكامل. يمكن إتمام التسليم مباشرة.
        </div>

        <template v-else>

          <PaymentFields
            ref="paymentFieldsRef"
            v-model:method="paymentMethod"
            v-model:image="proofFile"
            v-model:image-data-url="proofKey"
            v-model:image-preview-url="proofPreviewUrl"
            method-label="طريقة دفع المبلغ المتبقي"
            image-label="صورة إثبات دفع المتبقي"
            :method-invalid="!!methodError"
            :method-error="methodError"
            :image-invalid="proofRequiredError"
            show-image-when="non-cash"
            require-image-when="non-cash"
          />
        </template>

        <p v-if="dialogError" class="text-sm text-red-300">{{ dialogError }}</p>
      </div>

      <template #footer>
        <div class="flex w-full justify-start gap-2">
          <Button
            label="تأكيد التسليم"
            class="rounded-xl bg-[#f59e0b] px-5 py-2 font-bold text-white"
            :disabled="!canConfirmDeliver || delivering"
            :loading="delivering"
            @click="requestDeliverConfirmation"
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

    <Dialog
      v-model:visible="confirmVisible"
      modal
      dir="rtl"
      header="تأكيد التسليم"
      :closable="!delivering"
      :dismissableMask="!delivering"
      :closeOnEscape="!delivering"
      :style="{ width: '420px', maxWidth: '95vw' }"
      :pt="{
        header: { class: 'text-right' },
        content: { class: 'text-right' },
      }"
    >
      <div class="space-y-3 text-right text-slate-200">
        <p class="text-sm">
          هل أنت متأكد من تسليم الحجز
          <span class="font-bold text-white">
            {{ selectedReservation?.reservationNumber }}
          </span>
          ؟
        </p>

        <div
          v-if="needsRemainingPayment"
          class="rounded-xl border border-orange-500/40 bg-orange-500/10 px-4 py-3 text-center"
        >
          <p class="text-sm font-medium text-orange-200">
            تأكد من تحصيل المبلغ المتبقي من الطالب قبل التسليم
          </p>
          <p class="mt-2 text-3xl font-extrabold text-orange-300">
            {{ formatMoney(selectedReservation?.remainingAmount) }}
          </p>
          <p class="mt-2 text-xs text-slate-300">
            طريقة الدفع: {{ methodLabel }}
          </p>
        </div>

        <p v-else class="text-sm text-emerald-300">
          لا يوجد مبلغ متبقي. سيتم التسليم مباشرة.
        </p>
      </div>

      <template #footer>
        <div class="flex w-full justify-start gap-2">
          <Button
            :label="
              needsRemainingPayment
                ? 'نعم، تم التحصيل والتسليم'
                : 'نعم، تأكيد التسليم'
            "
            class="rounded-xl bg-[#f59e0b] px-5 py-2 font-bold text-white"
            :loading="delivering"
            :disabled="delivering"
            @click="deliverReservation"
          />
          <Button
            label="رجوع"
            text
            severity="secondary"
            :disabled="delivering"
            @click="confirmVisible = false"
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
import PaymentFields from "~/components/shared/payment-fields/index.vue";
import { reservationService } from "~/services/reservationService";
import { useAppToast } from "~/composables/useAppToast";

const STATUS_META = {
  PENDING: { label: "قيد الانتظار", class: "bg-amber-500/20 text-amber-300" },
  WAITING_FOR_STOCK: { label: "بانتظار المخزون", class: "bg-amber-500/20 text-amber-300" },
  READY: { label: "جاهز للتسليم", class: "bg-emerald-500/20 text-emerald-300" },
  DELIVERED: { label: "تم التسليم", class: "bg-slate-500/20 text-slate-300" },
  CANCELLED: { label: "ملغي", class: "bg-red-500/20 text-red-300" },
};

const METHOD_LABELS = {
  CASH: "كاش",
  INSTAPAY: "انستا باي",
  WALLET: "محفظة إلكترونية",
};

const { showError, showSuccess } = useAppToast();
const loading = ref(false);
const delivering = ref(false);
const search = ref("");
const paymentMethod = ref("CASH");
const proofFile = ref(null);
const proofKey = ref("");
const proofPreviewUrl = ref("");
const proofRequiredError = ref(false);
const paymentFieldsRef = ref(null);
const methodError = ref("");
const dialogVisible = ref(false);
const confirmVisible = ref(false);
const dialogError = ref("");
const selectedReservation = ref(null);
const reservations = ref([]);

const formatMoney = (value) => `${Number(value || 0).toFixed(2)} ج.م`;

const roundMoney = (value) => Math.round(Number(value || 0) * 100) / 100;

const methodLabel = computed(
  () => METHOD_LABELS[paymentMethod.value] || paymentMethod.value || "-",
);

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

  if (!needsRemainingPayment.value) {
    return true;
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
  return roundMoney(Math.max(total - paid, 0));
};

const normalizeReservation = (item) => {
  const remainingAmount = getRemainingAmount(item);
  const status = String(item.status || "").toUpperCase();
  const meta = STATUS_META[status] || { label: status || "-" };
  const paidAmount = Number(item.paidAmount ?? item.paid_amount ?? 0);
  const totalAmount = Number(item.totalAmount ?? item.total_amount ?? 0);

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
    totalAmount,
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

const resetPaymentFields = () => {
  paymentMethod.value = "CASH";
  proofFile.value = null;
  proofKey.value = "";
  proofPreviewUrl.value = "";
  proofRequiredError.value = false;
  methodError.value = "";
  paymentFieldsRef.value?.reset?.();
};

const openDeliverDialog = (item) => {
  if (!isDeliverable(item)) return;

  selectedReservation.value = item;
  resetPaymentFields();
  dialogError.value = "";
  dialogVisible.value = true;
};

const closeDeliverDialog = () => {
  dialogVisible.value = false;
  confirmVisible.value = false;
  selectedReservation.value = null;
  resetPaymentFields();
  dialogError.value = "";
};

const validateRemainingPayment = () => {
  methodError.value = "";
  proofRequiredError.value = false;

  if (!needsRemainingPayment.value) {
    return true;
  }

  if (!paymentMethod.value) {
    methodError.value = "اختر طريقة دفع المبلغ المتبقي.";
    return false;
  }

  if (paymentFieldsRef.value && !paymentFieldsRef.value.validate()) {
    proofRequiredError.value = true;
    return false;
  }

  const needsProof =
    paymentMethod.value === "WALLET" || paymentMethod.value === "INSTAPAY";
  if (needsProof && !proofKey.value) {
    proofRequiredError.value = true;
    return false;
  }

  return true;
};

const requestDeliverConfirmation = () => {
  if (!selectedReservation.value || !isDeliverable(selectedReservation.value)) {
    return;
  }

  if (!validateRemainingPayment()) {
    return;
  }

  dialogError.value = "";
  confirmVisible.value = true;
};

const loadReservations = async () => {
  loading.value = true;

  try {
    const items = await reservationService.getReservations();
    const list = Array.isArray(items) ? items : items?.data || [];
    reservations.value = list
      .map(normalizeReservation)
      .filter((item) => item.status !== "DELIVERED" && item.status !== "CANCELLED");
  } catch (error) {
    reservations.value = [];
    showError(error?.message || "تعذر تحميل الحجوزات.");
  } finally {
    loading.value = false;
  }
};

const deliverReservation = async () => {
  if (!selectedReservation.value || !isDeliverable(selectedReservation.value)) {
    return;
  }

  if (!validateRemainingPayment()) {
    confirmVisible.value = false;
    return;
  }

  delivering.value = true;
  dialogError.value = "";

  try {
    const payload = {};

    if (needsRemainingPayment.value) {
      const needsProof =
        paymentMethod.value === "WALLET" || paymentMethod.value === "INSTAPAY";

      payload.method = paymentMethod.value;
      payload.proofReference = needsProof
        ? proofKey.value || undefined
        : undefined;
    }

    await reservationService.deliverReservation(
      selectedReservation.value.id,
      payload,
    );

    const deliveredId = selectedReservation.value.id;
    confirmVisible.value = false;
    closeDeliverDialog();
    reservations.value = reservations.value.filter(
      (item) => item.id !== deliveredId,
    );
    showSuccess("تم تسليم الحجز بنجاح وتحصيل المبلغ المتبقي وخصم الكمية من المخزون.");
  } catch (error) {
    const message = error?.message || "تعذر تسليم الحجز.";
    confirmVisible.value = false;
    dialogError.value = message;
    showError(message);
  } finally {
    delivering.value = false;
  }
};

watch(paymentMethod, () => {
  if (methodError.value) methodError.value = "";
  proofRequiredError.value = false;
});

onMounted(loadReservations);
</script>
