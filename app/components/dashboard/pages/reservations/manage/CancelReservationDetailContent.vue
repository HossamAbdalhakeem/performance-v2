<template>
  <div v-if="reservation" class="flex flex-col gap-4">
    <div
      class="rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-slate-200"
    >
      <div class="grid gap-2">
        <div class="flex items-center justify-between gap-2">
          <span class="text-slate-400">رقم الحجز</span>
          <span class="font-semibold text-white">
            {{ reservation.reservationNumber }}
          </span>
        </div>
        <div class="flex items-center justify-between gap-2">
          <span class="text-slate-400">الطالب</span>
          <span class="font-medium text-slate-100">{{ reservation.studentName }}</span>
        </div>
        <div class="flex items-center justify-between gap-2">
          <span class="text-slate-400">الموبايل</span>
          <span class="font-medium text-slate-100">{{ reservation.phone || "—" }}</span>
        </div>
        <div class="flex items-center justify-between gap-2">
          <span class="text-slate-400">المنتج</span>
          <span class="font-medium text-slate-100">{{ reservation.productName }}</span>
        </div>
        <div class="flex items-center justify-between gap-2">
          <span class="text-slate-400">الفرع</span>
          <span class="font-medium text-slate-100">{{ reservation.branchName }}</span>
        </div>
        <div class="flex items-center justify-between gap-2">
          <span class="text-slate-400">الكمية</span>
          <span class="font-medium text-slate-100">{{ reservation.quantity }}</span>
        </div>
        <div class="flex items-center justify-between gap-2">
          <span class="text-slate-400">الحالة</span>
          <span class="font-medium text-slate-100">{{ reservation.statusLabel }}</span>
        </div>
      </div>

      <div class="mt-3 grid gap-2 rounded-lg border border-white/10 bg-slate-950/70 p-3">
        <div class="flex items-center justify-between gap-2">
          <span class="text-slate-400">إجمالي المبلغ</span>
          <span class="font-semibold text-slate-100">
            {{ formatMoney(reservation.totalAmount) }}
          </span>
        </div>
        <div class="flex items-center justify-between gap-2">
          <span class="text-slate-400">المدفوع (مقدم)</span>
          <span class="font-semibold text-emerald-300">
            {{ reservation.paidAmountLabel }}
          </span>
        </div>
        <div class="flex items-center justify-between gap-2 border-t border-white/10 pt-2">
          <span class="text-slate-400">المتبقي</span>
          <span class="font-semibold text-amber-300">
            {{ reservation.remainingAmountLabel }}
          </span>
        </div>
      </div>
    </div>

    <div
      v-if="hasPaidDeposit"
      class="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100"
    >
      <p class="mb-3 font-semibold text-emerald-200">
        مبلغ الرد للطالب: {{ reservation.paidAmountLabel }}
      </p>
      <PaymentFields
        :method="refundMethod"
        :image="refundImage"
        :image-data-url="refundProofKey"
        method-label="طريقة رد المبلغ"
        image-label="صورة إثبات الاسترداد (اختياري)"
        :show-image-when="'never'"
        :require-image-when="'never'"
        :method-invalid="!!refundError"
        :method-error="refundError"
        @update:method="$emit('update:refundMethod', $event)"
        @update:image="$emit('update:refundImage', $event)"
        @update:image-data-url="$emit('update:refundProofKey', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import PaymentFields from "~/components/shared/payment-fields/index.vue";
import { PaymentMethod } from "~/utils/paymentMethods";
import { formatMoney } from "~/utils/format";

const props = defineProps({
  reservation: { type: Object, default: null },
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

const hasPaidDeposit = computed(
  () => Number(props.reservation?.paidAmount || 0) > 0,
);
</script>
