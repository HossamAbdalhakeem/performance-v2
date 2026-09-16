<template>
  <div class="space-y-3 text-sm text-slate-700">
    <p>
      هل أنت متأكد من إلغاء الحجز
      <span class="font-bold text-slate-900">
        {{ reservation?.reservationNumber }}
      </span>
      ؟
    </p>
    <p class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-700">
      لا يمكن التراجع عن هذا الإجراء بعد التأكيد.
    </p>
    <p v-if="Number(reservation?.paidAmount) > 0" class="text-slate-600">
      سيتم تسجيل استرداد بمبلغ
      <span class="font-semibold text-emerald-700">
        {{ reservation?.paidAmountLabel }}
      </span>
    </p>
  </div>
</template>

<script setup>
defineProps({
  reservation: { type: Object, default: null },
});
</script>
