<template>
  <div class="space-y-6 text-right" dir="rtl">
    <Card>
      <template #title>
        <span class="text-lg font-bold text-slate-900">استبدال واسترداد المبيعات</span>
      </template>
      <template #content>
        <div class="mb-5">
          <SearchInput
            placeholder="رقم العملية / طالب / منتج / موبايل"
            @search="onSearch"
          />
        </div>

        <SalesExchangeTable
          :sales="sales"
          :loading="loading"
          @exchange="openExchangeDialog"
          @refund="openRefundDialog"
        />
      </template>
    </Card>

    <!-- Refund detail -->
    <Dialog
      v-model:visible="refundDetailVisible"
      modal
      dir="rtl"
      header="تفاصيل البيع قبل الاسترداد"
      :style="{ width: '560px', maxWidth: '95vw' }"
      :pt="{ header: { class: 'text-right' }, content: { class: 'text-right' } }"
      @hide="closeRefundFlow"
    >
      <RefundDetailContent
        v-if="refundDetailVisible && selectedSale"
        :sale="selectedSale"
        :refund-method="refundMethod"
        :refund-image="refundImage"
        :refund-proof-key="refundProofKey"
        :refund-error="refundError"
        @update:refund-method="refundMethod = $event"
        @update:refund-image="refundImage = $event"
        @update:refund-proof-key="refundProofKey = $event"
      />

      <template #footer>
        <div class="flex w-full justify-start gap-2">
          <Button
            label="تأكيد الاسترداد"
            severity="danger"
            icon="pi pi-replay"
            :disabled="!selectedSale || busy"
            @click="requestRefundConfirm"
          />
          <Button
            label="رجوع"
            text
            severity="secondary"
            :disabled="busy"
            @click="closeRefundFlow"
          />
        </div>
      </template>
    </Dialog>

    <!-- Refund confirm -->
    <Dialog
      v-model:visible="refundConfirmVisible"
      modal
      dir="rtl"
      header="تأكيد الاسترداد"
      :closable="!busy"
      :dismissable-mask="!busy"
      :close-on-escape="!busy"
      :style="{ width: '420px', maxWidth: '95vw' }"
      :pt="{ header: { class: 'text-right' }, content: { class: 'text-right' } }"
    >
      <RefundConfirmContent
        v-if="refundConfirmVisible"
        :sale="selectedSale"
        :refund-method-label="refundMethodLabel"
      />

      <template #footer>
        <div class="flex w-full justify-start gap-2">
          <Button
            label="نعم، تأكيد الاسترداد"
            severity="danger"
            :loading="busy"
            :disabled="busy"
            @click="confirmRefund"
          />
          <Button
            label="رجوع"
            text
            severity="secondary"
            :disabled="busy"
            @click="refundConfirmVisible = false"
          />
        </div>
      </template>
    </Dialog>

    <!-- Exchange detail -->
    <Dialog
      v-model:visible="exchangeDetailVisible"
      modal
      dir="rtl"
      header="استبدال منتج البيع"
      :style="{ width: '760px', maxWidth: '95vw' }"
      :pt="{ header: { class: 'text-right' }, content: { class: 'text-right' } }"
      @hide="closeExchangeFlow"
    >
      <ExchangeDetailContent
        v-if="exchangeDetailVisible && selectedSale"
        :sale="selectedSale"
        :new-product-id="newProductId"
        :selected-new-product="selectedNewProduct"
        :price-comparison="priceComparison"
        :exchange-error="exchangeError"
        :exchange-payment-error="exchangePaymentError"
        :exchange-payment-method="exchangePaymentMethod"
        :exchange-refund-method="exchangeRefundMethod"
        :exchange-image="exchangeImage"
        :exchange-proof-key="exchangeProofKey"
        @update:new-product-id="newProductId = $event"
        @update:exchange-payment-method="exchangePaymentMethod = $event"
        @update:exchange-refund-method="exchangeRefundMethod = $event"
        @update:exchange-image="exchangeImage = $event"
        @update:exchange-proof-key="exchangeProofKey = $event"
        @products-loaded="onExchangeProductsLoaded"
        @products-loading="(value) => (loadingProducts = value)"
      />

      <template #footer>
        <div class="flex w-full justify-start gap-2">
          <Button
            label="تأكيد الاستبدال"
            severity="info"
            icon="pi pi-sync"
            :disabled="!selectedSale || busy"
            @click="requestExchangeConfirm"
          />
          <Button
            label="رجوع"
            text
            severity="secondary"
            :disabled="busy"
            @click="closeExchangeFlow"
          />
        </div>
      </template>
    </Dialog>

    <!-- Exchange confirm -->
    <Dialog
      v-model:visible="exchangeConfirmVisible"
      modal
      dir="rtl"
      header="تأكيد استبدال المنتج"
      :closable="!busy"
      :dismissable-mask="!busy"
      :close-on-escape="!busy"
      :style="{ width: '520px', maxWidth: '95vw' }"
      :pt="{ header: { class: 'text-right' }, content: { class: 'text-right' } }"
    >
      <ExchangeConfirmContent
        v-if="exchangeConfirmVisible"
        :sale="selectedSale"
        :selected-new-product="selectedNewProduct"
        :price-comparison="priceComparison"
      />

      <template #footer>
        <div class="flex w-full justify-start gap-2">
          <Button
            label="نعم، تأكيد الاستبدال"
            severity="info"
            :loading="busy"
            :disabled="busy"
            @click="confirmExchange"
          />
          <Button
            label="رجوع"
            text
            severity="secondary"
            :disabled="busy"
            @click="exchangeConfirmVisible = false"
          />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import Button from "primevue/button";
import Card from "primevue/card";
import Dialog from "primevue/dialog";
import SalesExchangeTable from "~/components/dashboard/pages/sales/exchange/SalesExchangeTable.vue";
import SearchInput from "~/components/shared/search-input/index.vue";
import { exchangeService } from "~/services/exchangeService";
import { returnService } from "~/services/returnService";
import { saleService } from "~/services/saleService";
import { useAppToast } from "~/composables/useAppToast";
import {
  PAYMENT_METHOD_LABELS,
  PaymentMethod,
  paymentMethodNeedsProof,
} from "~/utils/paymentMethods";
import { formatMoney, formatDateTime } from "~/utils/format";

defineOptions({ name: "SalesExchangePage" });

const RefundDetailContent = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/sales/exchange/manage/RefundDetailContent.vue"),
);
const RefundConfirmContent = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/sales/exchange/manage/RefundConfirmContent.vue"),
);
const ExchangeDetailContent = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/sales/exchange/manage/ExchangeDetailContent.vue"),
);
const ExchangeConfirmContent = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/sales/exchange/manage/ExchangeConfirmContent.vue"),
);

const STATUS_META = {
  COMPLETED: { label: "مكتمل", severity: "success" },
  PARTIALLY_RETURNED: { label: "مسترد جزئيًا", severity: "warn" },
  RETURNED: { label: "تم الاسترداد", severity: "danger" },
};

const { showError, showSuccess } = useAppToast();

const loading = ref(true);
const busy = ref(false);
const loadingProducts = ref(false);
const selectedSale = ref(null);
const sales = ref([]);
const productOptions = ref([]);
const newProductId = ref(null);
const exchangeError = ref("");
const exchangePaymentError = ref("");
const refundError = ref("");
const filters = reactive({
  search: "",
});

const refundMethod = ref(PaymentMethod.CASH);
const refundImage = ref(null);
const refundProofKey = ref("");

const exchangePaymentMethod = ref(PaymentMethod.CASH);
const exchangeRefundMethod = ref(PaymentMethod.CASH);
const exchangeImage = ref(null);
const exchangeProofKey = ref("");

const refundDetailVisible = ref(false);
const refundConfirmVisible = ref(false);
const exchangeDetailVisible = ref(false);
const exchangeConfirmVisible = ref(false);

const refundMethodLabel = computed(
  () => PAYMENT_METHOD_LABELS[refundMethod.value] || refundMethod.value || "-",
);

const roundMoney = (value) => Math.round(Number(value || 0) * 100) / 100;
const toMoneyNumber = (value) => {
  if (value == null || value === "") return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const normalizeSaleRow = (sale, item) => {
  const status = String(sale.status || "COMPLETED").toUpperCase();
  const meta = STATUS_META[status] || {
    label: status || "-",
    severity: "secondary",
  };
  const method = String(
    sale.payments?.[0]?.method || sale.paymentMethod || "",
  ).toUpperCase();
  const createdAt = sale.createdAt || sale.created_at;
  const quantity = Number(item?.quantity ?? 1);
  const returnedQuantity = Number(item?.returnedQuantity ?? 0);
  const remainingQuantity = Math.max(quantity - returnedQuantity, 0);
  const unitPrice = toMoneyNumber(item?.unitPrice ?? item?.unit_price);
  const lineTotal = roundMoney(unitPrice * remainingQuantity);
  const product = item?.product || sale.product || {};

  return {
    id: `${sale.id}:${item?.id || "sale"}`,
    saleId: sale.id,
    saleItemId: item?.id || null,
    productId: item?.productId || product.id || null,
    branchId: sale.branchId || sale.branch_id || sale.branch?.id || null,
    saleNumber:
      sale.saleNumber ||
      sale.sale_number ||
      sale.receiptNumber ||
      sale.code ||
      sale.id,
    studentName: sale.student?.name || "-",
    phone: sale.student?.phone || "",
    productName: product.name || "-",
    teacherName: product.teacher?.name || product.teacherName || "-",
    branchName: sale.branch?.name || "-",
    quantity,
    returnedQuantity,
    remainingQuantity,
    unitPrice,
    unitPriceLabel: formatMoney(unitPrice),
    amount: lineTotal,
    amountLabel: formatMoney(lineTotal),
    refundAmount: lineTotal,
    refundAmountLabel: formatMoney(lineTotal),
    paymentMethod: method,
    paymentMethodLabel: PAYMENT_METHOD_LABELS[method] || method || "—",
    createdAt,
    createdAtLabel: formatDateTime(createdAt, { empty: "—" }),
    status,
    statusLabel: meta.label,
    statusSeverity: meta.severity,
    canModify: status !== "RETURNED" && remainingQuantity > 0 && !!item?.id,
  };
};

const expandSales = (list) =>
  (list || []).flatMap((sale) => {
    const items = Array.isArray(sale.items) ? sale.items : [];
    if (!items.length) return [normalizeSaleRow(sale, null)];
    return items.map((item) => normalizeSaleRow(sale, item));
  });

const selectedNewProduct = computed(
  () =>
    productOptions.value.find((item) => item.value === newProductId.value) ||
    null,
);

const priceComparison = computed(() => {
  if (!selectedSale.value || !selectedNewProduct.value) return null;

  const qty = Number(selectedSale.value.remainingQuantity || 1);
  const oldTotal = roundMoney(selectedSale.value.unitPrice * qty);
  const newTotal = roundMoney(selectedNewProduct.value.unitPrice * qty);
  const difference = roundMoney(newTotal - oldTotal);

  if (difference > 0) {
    return {
      kind: "more",
      oldTotal,
      newTotal,
      difference,
      title: "الطالب سيدفع فرق سعر إضافي",
      titleClass: "text-amber-300",
      boxClass: "border-white/10 bg-slate-900",
      diffLabel: "المبلغ المطلوب تحصيله",
      diffClass: "text-amber-300",
      confirmText: `سيتم تحصيل فرق سعر قدره ${formatMoney(difference)} من الطالب.`,
    };
  }

  if (difference < 0) {
    return {
      kind: "less",
      oldTotal,
      newTotal,
      difference,
      title: "سيتم رد فرق السعر للطالب",
      titleClass: "text-emerald-300",
      boxClass: "border-white/10 bg-slate-900",
      diffLabel: "المبلغ الذي سيُرد للطالب",
      diffClass: "text-emerald-300",
      confirmText: `سيتم رد فرق سعر قدره ${formatMoney(Math.abs(difference))} للطالب.`,
    };
  }

  return {
    kind: "same",
    oldTotal,
    newTotal,
    difference: 0,
    title: "نفس السعر — لا يوجد فرق مالي",
    titleClass: "text-sky-300",
    boxClass: "border-white/10 bg-slate-900",
    diffLabel: "فرق السعر",
    diffClass: "text-sky-300",
    confirmText: "السعر متساوٍ ولن يتم تحصيل أو رد أي مبلغ.",
  };
});

const onExchangeProductsLoaded = (options) => {
  productOptions.value = options || [];
};

const buildQuery = () => {
  const params = {};
  if (filters.search?.trim()) params.search = filters.search.trim();
  return params;
};

const loadData = async () => {
  loading.value = true;
  try {
    const items = await saleService.getSales(buildQuery());
    sales.value = expandSales(items);
  } catch (error) {
    showError(error?.message || "تعذر تحميل المبيعات.");
    sales.value = [];
  } finally {
    loading.value = false;
  }
};

const onSearch = (value) => {
  filters.search = value;
  loadData();
};

const resetRefundFields = () => {
  refundMethod.value = PaymentMethod.CASH;
  refundImage.value = null;
  refundProofKey.value = "";
  refundError.value = "";
};

const resetExchangeFields = () => {
  newProductId.value = null;
  exchangeError.value = "";
  exchangePaymentError.value = "";
  exchangePaymentMethod.value = PaymentMethod.CASH;
  exchangeRefundMethod.value = PaymentMethod.CASH;
  exchangeImage.value = null;
  exchangeProofKey.value = "";
};

const openRefundDialog = (item) => {
  selectedSale.value = item;
  resetRefundFields();
  refundConfirmVisible.value = false;
  exchangeDetailVisible.value = false;
  exchangeConfirmVisible.value = false;
  refundDetailVisible.value = true;
};

const closeRefundFlow = () => {
  if (busy.value) return;
  refundDetailVisible.value = false;
  refundConfirmVisible.value = false;
  resetRefundFields();
  if (!exchangeDetailVisible.value) selectedSale.value = null;
};

const requestRefundConfirm = () => {
  refundError.value = "";
  if (!refundMethod.value) {
    refundError.value = "اختر طريقة الاسترداد.";
    return;
  }
  refundConfirmVisible.value = true;
};

const confirmRefund = async () => {
  if (!selectedSale.value?.saleId || !selectedSale.value?.saleItemId) return;
  busy.value = true;
  try {
    await returnService.createReturn({
      saleId: selectedSale.value.saleId,
      saleItemId: selectedSale.value.saleItemId,
      quantity: selectedSale.value.remainingQuantity,
      method: refundMethod.value,
    });
    refundConfirmVisible.value = false;
    refundDetailVisible.value = false;
    selectedSale.value = null;
    resetRefundFields();
    showSuccess("تم استرداد المنتج بنجاح.");
    await loadData();
  } catch (error) {
    showError(error?.message || "تعذر تنفيذ الاسترداد.");
  } finally {
    busy.value = false;
  }
};

const openExchangeDialog = (item) => {
  selectedSale.value = item;
  productOptions.value = [];
  resetExchangeFields();
  refundDetailVisible.value = false;
  refundConfirmVisible.value = false;
  exchangeConfirmVisible.value = false;
  exchangeDetailVisible.value = true;
};

const closeExchangeFlow = () => {
  if (busy.value) return;
  exchangeDetailVisible.value = false;
  exchangeConfirmVisible.value = false;
  resetExchangeFields();
  if (!refundDetailVisible.value) selectedSale.value = null;
};

const requestExchangeConfirm = () => {
  exchangeError.value = "";
  exchangePaymentError.value = "";

  if (!newProductId.value) {
    exchangeError.value = "اختر المنتج الجديد قبل التأكيد.";
    return;
  }
  if (newProductId.value === selectedSale.value?.productId) {
    exchangeError.value = "اختر منتجًا مختلفًا عن المنتج الحالي.";
    return;
  }
  if (!selectedNewProduct.value?.isAvailable) {
    exchangeError.value = "المنتج المختار غير متاح في مخزون الفرع.";
    return;
  }

  const comparison = priceComparison.value;
  if (comparison?.kind === "more") {
    if (!exchangePaymentMethod.value) {
      exchangePaymentError.value = "اختر طريقة تحصيل فرق السعر.";
      return;
    }
    if (
      paymentMethodNeedsProof(exchangePaymentMethod.value) &&
      !String(exchangeProofKey.value || "").trim()
    ) {
      exchangePaymentError.value = "صورة إثبات الدفع مطلوبة لطريقة الدفع المحددة.";
      return;
    }
  }

  if (comparison?.kind === "less") {
    if (!exchangeRefundMethod.value) {
      exchangePaymentError.value = "اختر طريقة رد فرق السعر.";
      return;
    }
    if (
      paymentMethodNeedsProof(exchangeRefundMethod.value) &&
      !String(exchangeProofKey.value || "").trim()
    ) {
      exchangePaymentError.value = "صورة إثبات الرد مطلوبة لطريقة الرد المحددة.";
      return;
    }
  }

  exchangeConfirmVisible.value = true;
};

const confirmExchange = async () => {
  if (
    !selectedSale.value?.saleId ||
    !selectedSale.value?.saleItemId ||
    !newProductId.value
  ) {
    return;
  }

  busy.value = true;
  try {
    const comparison = priceComparison.value;
    const payload = {
      saleId: selectedSale.value.saleId,
      saleItemId: selectedSale.value.saleItemId,
      newProductId: newProductId.value,
      quantity: selectedSale.value.remainingQuantity,
    };

    if (comparison?.kind === "more") {
      payload.paymentMethod = exchangePaymentMethod.value;
      if (exchangeProofKey.value) {
        payload.proofReference = exchangeProofKey.value;
      }
    } else if (comparison?.kind === "less") {
      payload.refundMethod = exchangeRefundMethod.value;
      if (exchangeProofKey.value) {
        payload.proofReference = exchangeProofKey.value;
      }
    }

    await exchangeService.createExchange(payload);
    exchangeConfirmVisible.value = false;
    exchangeDetailVisible.value = false;
    selectedSale.value = null;
    resetExchangeFields();
    showSuccess("تم استبدال المنتج بنجاح.");
    await loadData();
  } catch (error) {
    showError(error?.message || "تعذر تنفيذ الاستبدال.");
  } finally {
    busy.value = false;
  }
};

watch(newProductId, () => {
  if (exchangeError.value) exchangeError.value = "";
  if (exchangePaymentError.value) exchangePaymentError.value = "";
});

watch(refundMethod, () => {
  if (refundError.value) refundError.value = "";
});

onMounted(loadData);
</script>
