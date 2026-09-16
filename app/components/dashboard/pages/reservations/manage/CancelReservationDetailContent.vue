<template>
  <div v-if="reservation" class="flex flex-col gap-4">
    <div class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
      <div class="grid gap-2">
        <div class="flex items-center justify-between gap-2">
          <span class="text-slate-500">رقم الحجز</span>
          <span class="font-semibold text-slate-900">
            {{ reservation.reservationNumber }}
          </span>
        </div>
        <div class="flex items-center justify-between gap-2">
          <span class="text-slate-500">الطالب</span>
          <span class="font-medium">{{ reservation.studentName }}</span>
        </div>
        <div class="flex items-center justify-between gap-2">
          <span class="text-slate-500">الموبايل</span>
          <span class="font-medium">{{ reservation.phone || "—" }}</span>
        </div>
        <div class="flex items-center justify-between gap-2">
          <span class="text-slate-500">المنتج</span>
          <span class="font-medium">{{ reservation.productName }}</span>
        </div>
        <div class="flex items-center justify-between gap-2">
          <span class="text-slate-500">الفرع</span>
          <span class="font-medium">{{ reservation.branchName }}</span>
        </div>
        <div class="flex items-center justify-between gap-2">
          <span class="text-slate-500">الكمية</span>
          <span class="font-medium">{{ reservation.quantity }}</span>
        </div>
        <div class="flex items-center justify-between gap-2">
          <span class="text-slate-500">الحالة</span>
          <span class="font-medium">{{ reservation.statusLabel }}</span>
        </div>
      </div>

      <div class="mt-3 grid gap-2 rounded-lg border border-slate-200 bg-white p-3">
        <div class="flex items-center justify-between gap-2">
          <span class="text-slate-500">إجمالي المبلغ</span>
          <span class="font-semibold">
            {{ formatMoney(reservation.totalAmount) }}
          </span>
        </div>
        <div class="flex items-center justify-between gap-2">
          <span class="text-slate-500">المدفوع (مقدم)</span>
          <span class="font-semibold text-emerald-700">
            {{ reservation.paidAmountLabel }}
          </span>
        </div>
        <div class="flex items-center justify-between gap-2 border-t border-slate-100 pt-2">
          <span class="text-slate-500">المتبقي</span>
          <span class="font-semibold text-orange-600">
            {{ reservation.remainingAmountLabel }}
          </span>
        </div>
      </div>
    </div>

    <div class="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <p class="font-semibold">عند الإلغاء سيتم:</p>
      <ul class="mt-2 list-disc space-y-1 pr-5">
        <li>إرجاع المبلغ المدفوع للطالب (إن وجد)</li>
        <li>تحرير الكمية المحجوزة من المخزون</li>
        <li>جعل المنتج متاحًا للبيع مرة أخرى</li>
      </ul>
    </div>

    <div
      v-if="hasPaidDeposit"
      class="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
    >
      <p class="mb-3 font-semibold">
        مبلغ الرد للطالب: {{ reservation.paidAmountLabel }}
      </p>
      <PaymentFields
        :method="refundMethod"
        :image="refundImage"
        :image-data-url="refundProofKey"
        method-label="طريقة رد المبلغ"
        :method-invalid="!!refundError"
        :method-error="refundError"
        @update:method="$emit('update:refundMethod', $event)"
        @update:image="$emit('update:refundImage', $event)"
        @update:image-data-url="$emit('update:refundProofKey', $event)"
      />
      <p v-if="refundError" class="mt-2 text-xs text-red-500">{{ refundError }}</p>
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
