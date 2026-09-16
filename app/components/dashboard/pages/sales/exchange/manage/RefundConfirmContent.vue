<template>
  <div class="space-y-3 text-sm text-slate-700">
    <p>
      هل أنت متأكد من استرداد
      <span class="font-bold text-slate-900">
        {{ sale?.productName }}
      </span>
      من العملية
      <span class="font-bold text-slate-900">
        {{ sale?.saleNumber }}
      </span>
      ؟
    </p>
    <p
      class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-700"
    >
      لا يمكن التراجع عن هذا الإجراء بعد التأكيد.
    </p>
    <p class="text-slate-600">
      سيتم تسجيل استرداد بمبلغ
      <span class="font-semibold text-emerald-700">
        {{ sale?.refundAmountLabel }}
      </span>
      عبر
      <span class="font-semibold">{{ refundMethodLabel }}</span>
    </p>
  </div>
</template>

<script setup>
defineProps({
  sale: { type: Object, default: null },
  refundMethodLabel: { type: String, default: "-" },
});
</script>
