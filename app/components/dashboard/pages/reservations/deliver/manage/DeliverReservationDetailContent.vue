<template>
  <div v-if="reservation" class="flex flex-col gap-4">
    <div class="rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-3 text-sm text-slate-300">
      <p>
        <span class="text-slate-400">رقم الحجز:</span>
        {{ reservation.reservationNumber }}
      </p>
      <p class="mt-1">
        <span class="text-slate-400">الطالب:</span>
        {{ reservation.studentName }}
      </p>
      <p class="mt-1">
        <span class="text-slate-400">المنتج:</span>
        {{ reservation.productName }}
      </p>
      <div class="mt-3 grid gap-2 rounded-lg border border-slate-700/80 bg-slate-950/40 p-3 text-sm">
        <div class="flex items-center justify-between gap-2">
          <span class="text-slate-400">إجمالي المبلغ</span>
          <span class="font-semibold text-slate-100">
            {{ formatMoney(reservation.totalAmount) }}
          </span>
        </div>
        <div class="flex items-center justify-between gap-2">
          <span class="text-slate-400">المدفوع مسبقاً</span>
          <span class="font-semibold text-emerald-300">
            {{ formatMoney(reservation.paidAmount) }}
          </span>
        </div>
        <div class="flex items-center justify-between gap-2 border-t border-slate-700 pt-3">
          <span class="text-base font-bold text-slate-200">المتبقي</span>
          <span
            class="text-2xl font-extrabold tracking-tight"
            :class="needsRemainingPayment ? 'text-orange-300' : 'text-emerald-300'"
          >
            {{ formatMoney(reservation.remainingAmount) }}
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
        :method="paymentMethod"
        :image="proofFile"
        :image-data-url="proofKey"
        :image-preview-url="proofPreviewUrl"
        method-label="طريقة دفع المبلغ المتبقي"
        image-label="صورة إثبات دفع المتبقي"
        :method-invalid="!!methodError"
        :method-error="methodError"
        :image-invalid="proofRequiredError"
        show-image-when="non-cash"
        require-image-when="non-cash"
        @update:method="$emit('update:paymentMethod', $event)"
        @update:image="$emit('update:proofFile', $event)"
        @update:image-data-url="$emit('update:proofKey', $event)"
        @update:image-preview-url="$emit('update:proofPreviewUrl', $event)"
      />
    </template>

    <p v-if="dialogError" class="text-sm text-red-300">{{ dialogError }}</p>
  </div>
</template>

<script setup>
import PaymentFields from "~/components/shared/payment-fields/index.vue";
import { PaymentMethod } from "~/utils/paymentMethods";
import { formatMoney } from "~/utils/format";

defineProps({
  reservation: { type: Object, default: null },
  needsRemainingPayment: { type: Boolean, default: false },
  paymentMethod: { type: String, default: PaymentMethod.CASH },
  proofFile: { type: [Object, File], default: null },
  proofKey: { type: String, default: "" },
  proofPreviewUrl: { type: String, default: "" },
  methodError: { type: String, default: "" },
  proofRequiredError: { type: Boolean, default: false },
  dialogError: { type: String, default: "" },
});

defineEmits([
  "update:paymentMethod",
  "update:proofFile",
  "update:proofKey",
  "update:proofPreviewUrl",
]);

const paymentFieldsRef = ref(null);

defineExpose({
  validatePayment: () => paymentFieldsRef.value?.validate?.() ?? true,
  resetPayment: () => paymentFieldsRef.value?.reset?.(),
});
</script>
