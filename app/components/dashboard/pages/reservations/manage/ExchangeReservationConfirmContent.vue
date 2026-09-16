<template>
  <div class="space-y-3 text-sm text-slate-700">
    <p>
      هل أنت متأكد من استبدال منتج الحجز
      <span class="font-bold text-slate-900">
        {{ reservation?.reservationNumber }}
      </span>
      ؟
    </p>
    <div class="grid gap-3 sm:grid-cols-2">
      <div class="rounded-lg border border-white/10 bg-slate-900 px-3 py-2">
        <p class="text-xs text-rose-300">من</p>
        <p class="mt-1 font-semibold text-white">
          {{ reservation?.productName }}
        </p>
        <p class="mt-0.5 text-xs text-slate-400">
          أ/ {{ reservation?.teacherName || "—" }}
        </p>
      </div>
      <div class="rounded-lg border border-white/10 bg-slate-900 px-3 py-2">
        <p class="text-xs text-emerald-300">إلى</p>
        <p class="mt-1 font-semibold text-white">
          {{ selectedNewProduct?.name || "—" }}
        </p>
        <p class="mt-0.5 text-xs text-slate-400">
          أ/ {{ selectedNewProduct?.teacherName || "—" }}
          <span v-if="selectedNewProduct?.priceLabel">
            · {{ selectedNewProduct.priceKindLabel }}
            {{ selectedNewProduct.priceLabel }}
          </span>
        </p>
      </div>
    </div>
    <p
      v-if="priceComparison?.kind === 'less'"
      class="rounded-lg border px-3 py-2 text-slate-200"
      :class="priceComparison.boxClass"
    >
      {{ priceComparison.confirmText }}
    </p>
  </div>
</template>

<script setup>
defineProps({
  reservation: { type: Object, default: null },
  selectedNewProduct: { type: Object, default: null },
  priceComparison: { type: Object, default: null },
});
</script>
