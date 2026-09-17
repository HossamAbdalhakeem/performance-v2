<template>
  <div class="space-y-4 bg-[#0f172a] p-4 text-right text-slate-100" dir="rtl">
    <div class="relative w-full max-w-xl">
      <SearchInput
        label=""
        variant="dark"
        placeholder="ابحث باسم الطالب أو رقم الموبايل أو رقم الحجز"
        @search="onSearch"
      />
    </div>

    <AppDataTable
      :value="reservations"
      :columns="tableColumns"
      :loading="loading"
      :empty-message="emptyMessage"
      :skeleton-rows="4"
    >
      <template #createdBy="{ data }">
        <div class="flex flex-col items-center gap-0.5">
          <span class="text-sm font-medium text-slate-100">
            {{ data.createdByName }}
          </span>
          <span class="rounded-md bg-slate-700/80 px-2 py-0.5 text-[11px] text-slate-300">
            {{ data.createdByRoleLabel }}
          </span>
        </div>
      </template>

      <template #sellingPrice="{ data }">
        <span
          class="rounded-md px-2 py-1 text-xs font-bold bg-sky-500/20 text-sky-300"
        >
          {{ data.sellingPriceLabel }}
        </span>
      </template>

      <template #paidAmount="{ data }">
        <span
          class="rounded-md px-2 py-1 text-xs font-bold bg-emerald-500/20 text-emerald-300"
        >
          {{ formatMoney(data.paidAmount) }}
        </span>
      </template>

      <template #paymentMethod="{ data }">
        <PaymentProofThumb
          :method="data.paymentMethod"
          :method-label="data.paymentMethodLabel"
          :payment-id="data.paymentId"
          :proof-url="data.proofUrl"
          :has-proof="data.hasProof"
        />
      </template>

      <template #remainingAmount="{ data }">
        <span
          class="rounded-md px-2 py-1 text-xs font-bold"
          :class="
            data.remainingAmount > 0
              ? 'bg-orange-500/20 text-orange-300'
              : 'bg-emerald-500/20 text-emerald-300'
          "
        >
          {{ formatMoney(data.remainingAmount) }}
        </span>
      </template>

      <template #status="{ data }">
        <AppStatusTag kind="reservation" :code="data.status" :label="data.statusLabel" />
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
      <DeliverReservationDetailContent
        v-if="dialogVisible && selectedReservation"
        ref="deliverDetailContentRef"
        :reservation="selectedReservation"
        :needs-remaining-payment="needsRemainingPayment"
        :payment-method="paymentMethod"
        :proof-file="proofFile"
        :proof-key="proofKey"
        :proof-preview-url="proofPreviewUrl"
        :method-error="methodError"
        :proof-required-error="proofRequiredError"
        :dialog-error="dialogError"
        @update:payment-method="paymentMethod = $event"
        @update:proof-file="proofFile = $event"
        @update:proof-key="proofKey = $event"
        @update:proof-preview-url="proofPreviewUrl = $event"
      />

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
      <DeliverReservationConfirmContent
        v-if="confirmVisible"
        :reservation="selectedReservation"
        :needs-remaining-payment="needsRemainingPayment"
        :method-label="methodLabel"
      />

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
import AppDataTable from "~/components/shared/app-data-table/index.vue";
import SearchInput from "~/components/shared/search-input/index.vue";
import { reservationService } from "~/services/reservationService";
import { useAppToast } from "~/composables/useAppToast";
import {
  PAYMENT_METHOD_LABELS,
  PaymentMethod,
  paymentMethodNeedsProof,
} from "~/utils/paymentMethods";
import { formatMoney, formatDateTime } from "~/utils/format";
import { getUserRoleLabel } from "~/enums/userRole";
import PaymentProofThumb from "~/components/shared/payment-proof-thumb/index.vue";
import AppStatusTag from "~/components/shared/app-status-tag/index.vue";
import { getStatusTagMeta } from "~/utils/statusTags";

const DeliverReservationDetailContent = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/reservations/deliver/manage/DeliverReservationDetailContent.vue"),
);
const DeliverReservationConfirmContent = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/reservations/deliver/manage/DeliverReservationConfirmContent.vue"),
);

const { showError, showSuccess } = useAppToast();
const loading = ref(false);
const delivering = ref(false);
const search = ref("");
const paymentMethod = ref(PaymentMethod.CASH);
const proofFile = ref(null);
const proofKey = ref("");
const proofPreviewUrl = ref("");
const proofRequiredError = ref(false);
const deliverDetailContentRef = ref(null);
const methodError = ref("");
const dialogVisible = ref(false);
const confirmVisible = ref(false);
const dialogError = ref("");
const selectedReservation = ref(null);
const reservations = ref([]);

const roundMoney = (value) => Math.round(Number(value || 0) * 100) / 100;

const methodLabel = computed(
  () => PAYMENT_METHOD_LABELS[paymentMethod.value] || paymentMethod.value || "-",
);

const emptyMessage = computed(() =>
  search.value.trim()
    ? "لا توجد حجوزات مطابقة"
    : "لا توجد حجوزات قابلة للعرض",
);

const tableColumns = [
  { field: "reservationNumber", header: "رقم الحجز" },
  { field: "createdAtLabel", header: "التاريخ والوقت" },
  { field: "studentName", header: "اسم الطالب" },
  { field: "phone", header: "الموبايل", fallback: "-" },
  { field: "productName", header: "المنتج" },
  { field: "teacherName", header: "المدرس" },
  { field: "createdByLabel", header: "أنشئ بواسطة", slot: "createdBy" },
  { field: "sellingPriceLabel", header: "سعر البيع", slot: "sellingPrice" },
  { field: "paidAmount", header: "المقدم", slot: "paidAmount" },
  { field: "paymentMethodLabel", header: "طريقة الدفع", slot: "paymentMethod" },
  { field: "remainingAmount", header: "المتبقي", slot: "remainingAmount" },
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

const isDeliverable = (item) => item?.status === "READY";

const buildQuery = () => {
  const params = { per_page: 20 };
  if (search.value.trim()) params.search = search.value.trim();
  return params;
};

const onSearch = (value) => {
  search.value = value;
  loadReservations();
};

const getRemainingAmount = (item) => {
  const total = Number(item.totalAmount ?? item.total_amount ?? 0);
  const paid = Number(item.paidAmount ?? item.paid_amount ?? 0);
  return roundMoney(Math.max(total - paid, 0));
};

const normalizeReservation = (item) => {
  const remainingAmount = getRemainingAmount(item);
  const status = String(item.status || "").toUpperCase();
  const meta = getStatusTagMeta("reservation", status);
  const paidAmount = Number(item.paidAmount ?? item.paid_amount ?? 0);
  const totalAmount = Number(item.totalAmount ?? item.total_amount ?? 0);
  const sellingPrice = Number(
    item.product?.sellingPrice ??
      item.product?.selling_price ??
      item.reservationPrice ??
      item.reservation_price ??
      totalAmount ??
      0,
  );

  const createdBy = item.createdBy || item.created_by || {};
  const createdByName =
    createdBy.fullName ||
    createdBy.full_name ||
    createdBy.name ||
    item.createdByName ||
    "-";
  const createdByRole = createdBy.role || item.createdByRole || "";
  const paymentMethodValue = String(
    item.paymentMethod || item.payments?.[0]?.method || "CASH",
  ).toUpperCase();
  const createdAt = item.createdAt || item.created_at || null;

  return {
    ...item,
    id: item.id,
    reservationNumber:
      item.reservationNumber || item.reservation_number || item.code || item.id,
    createdAt,
    createdAtLabel: formatDateTime(createdAt),
    studentName: item.student?.name || item.student_name || "-",
    phone: item.student?.phone || item.phone || "",
    teacherName:
      item.product?.teacher?.fullName ||
      item.product?.teacher?.name ||
      item.teacher_name ||
      "-",
    productName: item.product?.name || item.product_name || "-",
    createdByName,
    createdByRole,
    createdByRoleLabel: getUserRoleLabel(createdByRole),
    createdByLabel: createdByName,
    totalAmount,
    paidAmount,
    remainingAmount,
    sellingPrice,
    sellingPriceLabel: sellingPrice > 0 ? formatMoney(sellingPrice) : "—",
    paymentId: item.paymentId || item.payments?.[0]?.id || null,
    paymentMethod: paymentMethodValue,
    paymentMethodLabel:
      item.paymentMethodLabel ||
      PAYMENT_METHOD_LABELS[paymentMethodValue] ||
      paymentMethodValue ||
      "—",
    proofUrl: item.proofUrl || item.payments?.[0]?.proofUrl || null,
    hasProof: Boolean(
      item.hasProof ??
        item.payments?.[0]?.hasProof ??
        (paymentMethodValue !== "CASH" &&
          (item.proofReference || item.payments?.[0]?.proofReference)),
    ),
    hasRemaining: remainingAmount > 0,
    status,
    statusLabel:
      remainingAmount > 0 && status === "READY"
        ? "جاهز · متبقي مبلغ"
        : meta.label,
  };
};

const resetPaymentFields = () => {
  paymentMethod.value = PaymentMethod.CASH;
  proofFile.value = null;
  proofKey.value = "";
  proofPreviewUrl.value = "";
  proofRequiredError.value = false;
  methodError.value = "";
  deliverDetailContentRef.value?.resetPayment?.();
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

  if (deliverDetailContentRef.value && !deliverDetailContentRef.value.validatePayment()) {
    proofRequiredError.value = true;
    return false;
  }

  const needsProof = paymentMethodNeedsProof(paymentMethod.value);
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
    const result = await reservationService.getReservations(buildQuery());
    const list = result.data || [];
    reservations.value = list
      .map(normalizeReservation)
      // .filter((item) => item.status !== "DELIVERED" && item.status !== "CANCELLED");
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
      const needsProof = paymentMethodNeedsProof(paymentMethod.value);

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
