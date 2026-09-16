<template>
  <div>
    <Dialog
      :visible="detailVisible"
      modal
      dir="rtl"
      header="تفاصيل البيع قبل الاسترداد"
      :style="{ width: '560px', maxWidth: '95vw' }"
      :pt="{ header: { class: 'text-right' }, content: { class: 'text-right' } }"
      @update:visible="onDetailVisible"
    >
      <RefundDetailContent
        v-if="detailVisible && sale"
        :sale="sale"
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
            :disabled="!sale || busy"
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
      header="تأكيد الاسترداد"
      :closable="!busy"
      :dismissable-mask="!busy"
      :close-on-escape="!busy"
      :style="{ width: '420px', maxWidth: '95vw' }"
      :pt="{ header: { class: 'text-right' }, content: { class: 'text-right' } }"
      @update:visible="(v) => (confirmVisible = v)"
    >
      <RefundConfirmContent
        v-if="confirmVisible"
        :sale="sale"
        :refund-method-label="refundMethodLabel"
      />

      <template #footer>
        <div class="flex w-full justify-start gap-2">
          <Button
            label="نعم، تأكيد الاسترداد"
            severity="danger"
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
import { returnService } from "~/services/returnService";
import { useAppToast } from "~/composables/useAppToast";
import {
  PAYMENT_METHOD_LABELS,
  PaymentMethod,
} from "~/utils/paymentMethods";

const RefundDetailContent = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/sales/exchange/manage/RefundDetailContent.vue"),
);
const RefundConfirmContent = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/sales/exchange/manage/RefundConfirmContent.vue"),
);

defineOptions({ name: "SalesExchangeRefundFlow" });

const props = defineProps({
  sale: { type: Object, default: null },
  open: { type: Boolean, default: false },
});

const emit = defineEmits(["update:open", "done", "close"]);

const { showError, showSuccess } = useAppToast();

const busy = ref(false);
const confirmVisible = ref(false);
const refundMethod = ref(PaymentMethod.CASH);
const refundImage = ref(null);
const refundProofKey = ref("");
const refundError = ref("");

const detailVisible = computed({
  get: () => props.open,
  set: (value) => emit("update:open", value),
});

const refundMethodLabel = computed(
  () => PAYMENT_METHOD_LABELS[refundMethod.value] || refundMethod.value || "-",
);

const resetFields = () => {
  refundMethod.value = PaymentMethod.CASH;
  refundImage.value = null;
  refundProofKey.value = "";
  refundError.value = "";
  confirmVisible.value = false;
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

const requestConfirm = () => {
  refundError.value = "";
  if (!refundMethod.value) {
    refundError.value = "اختر طريقة الاسترداد.";
    return;
  }
  confirmVisible.value = true;
};

const confirm = async () => {
  if (!props.sale?.saleId || !props.sale?.saleItemId) return;
  busy.value = true;
  try {
    await returnService.createReturn({
      saleId: props.sale.saleId,
      saleItemId: props.sale.saleItemId,
      quantity: props.sale.remainingQuantity,
      method: refundMethod.value,
    });
    confirmVisible.value = false;
    detailVisible.value = false;
    resetFields();
    showSuccess("تم استرداد المنتج بنجاح.");
    emit("done");
  } catch (error) {
    showError(error?.message || "تعذر تنفيذ الاسترداد.");
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
