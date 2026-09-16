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
          <span class="font-medium">{{ sale.remainingQuantity }}</span>
        </div>
        <div class="flex items-center justify-between gap-2">
          <span class="text-slate-500">طريقة الدفع الأصلية</span>
          <span class="font-medium">{{ sale.paymentMethodLabel }}</span>
        </div>
        <div class="flex items-center justify-between gap-2">
          <span class="text-slate-500">مبلغ الاسترداد</span>
          <span class="font-semibold text-emerald-700">
            {{ sale.refundAmountLabel }}
          </span>
        </div>
      </div>
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
import PaymentFields from "~/components/shared/payment-fields/index.vue";
import { PaymentMethod } from "~/utils/paymentMethods";

defineProps({
  sale: { type: Object, default: null },
  refundMethod: { type: String, default: PaymentMethod.CASH },
  refundImage: { type: [Object, File], default: null },
  refundProofKey: { type: String, default: "" },
  refundError: { type: String, default: "" },
});

defineEmits([
  "update:refundMethod",
  "update:refundImage",
  "update:refundProofKey",
]);
</script>
