<template>
  <div v-if="sale" class="flex flex-col gap-4">
    <div
      class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
    >
      <div class="grid gap-2">
        <div class="flex items-center justify-between gap-2">
          <span class="text-slate-500">رقم العملية</span>
          <span class="font-semibold text-slate-900">
            {{ sale.saleNumber }}
          </span>
        </div>
        <div class="flex items-center justify-between gap-2">
          <span class="text-slate-500">الطالب</span>
          <span class="font-medium">{{ sale.studentName }}</span>
        </div>
        <div class="flex items-center justify-between gap-2">
          <span class="text-slate-500">الموبايل</span>
          <span class="font-medium">{{ sale.phone || "—" }}</span>
        </div>
        <div class="flex items-center justify-between gap-2">
          <span class="text-slate-500">المنتج</span>
          <span class="font-medium">{{ sale.productName }}</span>
        </div>
        <div class="flex items-center justify-between gap-2">
          <span class="text-slate-500">الفرع</span>
          <span class="font-medium">{{ sale.branchName }}</span>
        </div>
        <div class="flex items-center justify-between gap-2">
          <span class="text-slate-500">الكمية القابلة للاسترداد</span>
          <span class="font-medium">{{ maxQuantity }}</span>
        </div>
        <div class="flex items-center justify-between gap-2">
          <span class="text-slate-500">طريقة الدفع الأصلية</span>
          <span class="font-medium">{{ sale.paymentMethodLabel }}</span>
        </div>
        <div class="flex items-center justify-between gap-2">
          <span class="text-slate-500">سعر الوحدة</span>
          <span class="font-medium">{{ sale.unitPriceLabel }}</span>
        </div>
        <div class="flex items-center justify-between gap-2">
          <span class="text-slate-500">مبلغ الاسترداد</span>
          <span class="font-semibold text-emerald-700">
            {{ refundAmountLabel }}
          </span>
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-2 text-right">
      <div class="flex items-center justify-between gap-2">
        <label class="text-sm font-medium text-slate-700">
          كمية الاسترداد
        </label>
        <span class="text-xs text-slate-500">
          من 1 إلى {{ maxQuantity }}
        </span>
      </div>
      <AppInputNumber
        :model-value="refundQuantity"
        :min="1"
        :max="maxQuantity"
        :max-fraction-digits="0"
        :invalid="!!quantityError"
        @update:model-value="$emit('update:refundQuantity', $event)"
      />
      <p v-if="quantityError" class="text-xs text-red-500">{{ quantityError }}</p>
      <p v-else class="text-xs text-slate-500">
        سيتم استرداد {{ refundQuantity || 0 }} من أصل {{ maxQuantity }}
      </p>
    </div>

    <PaymentFields
      :method="refundMethod"
      :image="refundImage"
      :image-data-url="refundProofKey"
      method-label="طريقة الاسترداد"
      image-label="صورة إثبات الاسترداد"
      :method-invalid="!!refundError"
      :method-error="refundError"
      @update:method="$emit('update:refundMethod', $event)"
      @update:image="$emit('update:refundImage', $event)"
      @update:image-data-url="$emit('update:refundProofKey', $event)"
    />
  </div>
</template>

<script setup>
import AppInputNumber from "~/components/dashboard/AppInputNumber.vue";
import PaymentFields from "~/components/shared/payment-fields/index.vue";
import { formatMoney } from "~/utils/format";
import { PaymentMethod } from "~/utils/paymentMethods";

const props = defineProps({
  sale: { type: Object, default: null },
  refundQuantity: { type: Number, default: 1 },
  refundMethod: { type: String, default: PaymentMethod.CASH },
  refundImage: { type: [Object, File], default: null },
  refundProofKey: { type: String, default: "" },
  refundError: { type: String, default: "" },
  quantityError: { type: String, default: "" },
});

defineEmits([
  "update:refundQuantity",
  "update:refundMethod",
  "update:refundImage",
  "update:refundProofKey",
]);

const maxQuantity = computed(() =>
  Math.max(1, Number(props.sale?.remainingQuantity || 1)),
);

const refundAmountLabel = computed(() => {
  const qty = Number(props.refundQuantity || 0);
  const unitPrice = Number(props.sale?.unitPrice || 0);
  if (qty > 0 && unitPrice > 0) {
    return formatMoney(unitPrice * qty);
  }
  return props.sale?.refundAmountLabel || formatMoney(0);
});
</script>
