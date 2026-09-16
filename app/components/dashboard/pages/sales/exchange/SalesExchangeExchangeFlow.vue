<template>
  <div>
    <Dialog
      :visible="detailVisible"
      modal
      dir="rtl"
      header="استبدال منتج البيع"
      :style="{ width: '760px', maxWidth: '95vw' }"
      :pt="{ header: { class: 'text-right' }, content: { class: 'text-right' } }"
      @update:visible="onDetailVisible"
    >
      <ExchangeDetailContent
        v-if="detailVisible && sale"
        :sale="sale"
        :new-product-id="newProductId"
        :selected-new-product="selectedNewProduct"
        :price-comparison="priceComparisonUi"
        :preview-loading="previewLoading"
        :exchange-error="exchangeError"
        :exchange-payment-error="exchangePaymentError"
        :exchange-payment-method="exchangePaymentMethod"
        :exchange-refund-method="exchangeRefundMethod"
        :exchange-image="exchangeImage"
        :exchange-proof-key="exchangeProofKey"
        @update:new-product-id="onNewProductId"
        @update:exchange-payment-method="exchangePaymentMethod = $event"
        @update:exchange-refund-method="exchangeRefundMethod = $event"
        @update:exchange-image="exchangeImage = $event"
        @update:exchange-proof-key="exchangeProofKey = $event"
      />

      <template #footer>
        <div class="flex w-full justify-start gap-2">
          <Button
            label="تأكيد الاستبدال"
            severity="info"
            icon="pi pi-sync"
            :disabled="!sale || busy || previewLoading"
            @click="requestConfirm"
          />
          <Button
            label="رجوع"
            text
            severity="secondary"
            :disabled="busy"
            @click="close"
          />
        </div>
      </template>
    </Dialog>

    <Dialog
      :visible="confirmVisible"
      modal
      dir="rtl"
      header="تأكيد استبدال المنتج"
      :closable="!busy"
      :dismissable-mask="!busy"
      :close-on-escape="!busy"
      :style="{ width: '520px', maxWidth: '95vw' }"
      :pt="{ header: { class: 'text-right' }, content: { class: 'text-right' } }"
      @update:visible="(v) => (confirmVisible = v)"
    >
      <ExchangeConfirmContent
        v-if="confirmVisible"
        :sale="sale"
        :selected-new-product="selectedNewProduct"
        :price-comparison="priceComparisonUi"
      />

      <template #footer>
        <div class="flex w-full justify-start gap-2">
          <Button
            label="نعم، تأكيد الاستبدال"
            severity="info"
            :loading="busy"
            :disabled="busy"
            @click="confirm"
          />
          <Button
            label="رجوع"
            text
            severity="secondary"
            :disabled="busy"
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
import ExchangeDetailContent from "~/components/dashboard/pages/sales/exchange/manage/ExchangeDetailContent.vue";
import ExchangeConfirmContent from "~/components/dashboard/pages/sales/exchange/manage/ExchangeConfirmContent.vue";
import { exchangeService } from "~/services/exchangeService";
import { useAppToast } from "~/composables/useAppToast";
import {
  PaymentMethod,
  paymentMethodNeedsProof,
} from "~/utils/paymentMethods";

defineOptions({ name: "SalesExchangeExchangeFlow" });

const COMPARISON_UI = {
  more: {
    titleClass: "text-amber-300",
    boxClass: "border-white/10 bg-slate-900",
    diffClass: "text-amber-300",
  },
  less: {
    titleClass: "text-emerald-300",
    boxClass: "border-white/10 bg-slate-900",
    diffClass: "text-emerald-300",
  },
  same: {
    titleClass: "text-sky-300",
    boxClass: "border-white/10 bg-slate-900",
    diffClass: "text-sky-300",
  },
};

const props = defineProps({
  sale: { type: Object, default: null },
  open: { type: Boolean, default: false },
});

const emit = defineEmits(["update:open", "done", "close"]);

const { showError, showSuccess } = useAppToast();

const busy = ref(false);
const previewLoading = ref(false);
const confirmVisible = ref(false);
const newProductId = ref(null);
const preview = ref(null);
const exchangeError = ref("");
const exchangePaymentError = ref("");
const exchangePaymentMethod = ref(PaymentMethod.CASH);
const exchangeRefundMethod = ref(PaymentMethod.CASH);
const exchangeImage = ref(null);
const exchangeProofKey = ref("");

let previewRequestId = 0;

const detailVisible = computed({
  get: () => props.open,
  set: (value) => emit("update:open", value),
});

const selectedNewProduct = computed(() => preview.value?.newProduct || null);

const priceComparisonUi = computed(() => {
  if (!preview.value?.kind) return null;
  const ui = COMPARISON_UI[preview.value.kind] || COMPARISON_UI.same;
  return {
    ...preview.value,
    ...ui,
  };
});

const resetFields = () => {
  newProductId.value = null;
  preview.value = null;
  exchangeError.value = "";
  exchangePaymentError.value = "";
  exchangePaymentMethod.value = PaymentMethod.CASH;
  exchangeRefundMethod.value = PaymentMethod.CASH;
  exchangeImage.value = null;
  exchangeProofKey.value = "";
  confirmVisible.value = false;
  previewLoading.value = false;
};

const close = () => {
  if (busy.value) return;
  detailVisible.value = false;
  resetFields();
  emit("close");
};

const onDetailVisible = (value) => {
  if (!value) close();
  else detailVisible.value = true;
};

const loadPreview = async (productId) => {
  if (!props.sale?.saleId || !props.sale?.saleItemId || !productId) {
    preview.value = null;
    return;
  }

  const requestId = ++previewRequestId;
  previewLoading.value = true;
  exchangeError.value = "";
  try {
    const result = await exchangeService.previewExchange({
      saleId: props.sale.saleId,
      saleItemId: props.sale.saleItemId,
      newProductId: productId,
      quantity: props.sale.remainingQuantity,
    });
    if (requestId !== previewRequestId) return;
    preview.value = result;
  } catch (error) {
    if (requestId !== previewRequestId) return;
    preview.value = null;
    exchangeError.value = error?.message || "تعذر حساب فرق السعر.";
  } finally {
    if (requestId === previewRequestId) previewLoading.value = false;
  }
};

const onNewProductId = (value) => {
  newProductId.value = value;
  exchangePaymentError.value = "";
  if (!value) {
    preview.value = null;
    exchangeError.value = "";
    return;
  }
  loadPreview(value);
};

const requestConfirm = () => {
  exchangeError.value = "";
  exchangePaymentError.value = "";

  if (!newProductId.value) {
    exchangeError.value = "اختر المنتج الجديد قبل التأكيد.";
    return;
  }
  if (newProductId.value === props.sale?.productId) {
    exchangeError.value = "اختر منتجًا مختلفًا عن المنتج الحالي.";
    return;
  }
  if (!preview.value) {
    exchangeError.value = "انتظر حساب فرق السعر أو أعد اختيار المنتج.";
    return;
  }
  if (!preview.value?.newProduct?.isAvailable) {
    exchangeError.value = "المنتج المختار غير متاح في مخزون الفرع.";
    return;
  }

  if (preview.value.kind === "more") {
    if (!exchangePaymentMethod.value) {
      exchangePaymentError.value = "اختر طريقة تحصيل فرق السعر.";
      return;
    }
    if (
      paymentMethodNeedsProof(exchangePaymentMethod.value) &&
      !String(exchangeProofKey.value || "").trim()
    ) {
      exchangePaymentError.value =
        "صورة إثبات الدفع مطلوبة لطريقة الدفع المحددة.";
      return;
    }
  }

  if (preview.value.kind === "less") {
    if (!exchangeRefundMethod.value) {
      exchangePaymentError.value = "اختر طريقة رد فرق السعر.";
      return;
    }
    if (
      paymentMethodNeedsProof(exchangeRefundMethod.value) &&
      !String(exchangeProofKey.value || "").trim()
    ) {
      exchangePaymentError.value =
        "صورة إثبات الرد مطلوبة لطريقة الرد المحددة.";
      return;
    }
  }

  confirmVisible.value = true;
};

const confirm = async () => {
  if (!props.sale?.saleId || !props.sale?.saleItemId || !newProductId.value) {
    return;
  }

  busy.value = true;
  try {
    const payload = {
      saleId: props.sale.saleId,
      saleItemId: props.sale.saleItemId,
      newProductId: newProductId.value,
      quantity: props.sale.remainingQuantity,
    };

    if (preview.value?.kind === "more") {
      payload.paymentMethod = exchangePaymentMethod.value;
      if (exchangeProofKey.value) {
        payload.proofReference = exchangeProofKey.value;
      }
    } else if (preview.value?.kind === "less") {
      payload.refundMethod = exchangeRefundMethod.value;
      if (exchangeProofKey.value) {
        payload.proofReference = exchangeProofKey.value;
      }
    }

    await exchangeService.createExchange(payload);
    confirmVisible.value = false;
    detailVisible.value = false;
    resetFields();
    showSuccess("تم استبدال المنتج بنجاح.");
    emit("done");
  } catch (error) {
    showError(error?.message || "تعذر تنفيذ الاستبدال.");
  } finally {
    busy.value = false;
  }
};

watch(
  () => props.open,
  (open) => {
    if (open) resetFields();
  },
);
</script>
