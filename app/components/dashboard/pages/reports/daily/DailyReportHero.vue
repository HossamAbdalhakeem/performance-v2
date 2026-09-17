<template>
  <div
    class="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/80 via-slate-900 to-slate-900 p-5"
  >
    <div
      class="pointer-events-none absolute -left-8 -top-8 h-28 w-28 rounded-full bg-emerald-400/10 blur-2xl"
    />
    <div class="flex items-start justify-between gap-3">
      <div>
        <p class="text-sm text-emerald-200/80">{{ title }}</p>
        <p class="mt-2 text-3xl font-extrabold tracking-tight text-white">
          {{ formatMoney(paymentsTotal, "rtl") }}
        </p>
        <p v-if="refundsTotal > 0" class="mt-2 text-xs text-rose-300">
          بعد خصم الاسترداد {{ formatMoney(refundsTotal, "rtl") }}
        </p>
      </div>
      <span
        class="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-300"
      >
        <i class="pi pi-wallet text-lg" />
      </span>
    </div>
    <div
      class="mt-5 grid gap-3 text-sm"
      :class="showExpenses ? 'grid-cols-3' : 'grid-cols-2'"
    >
      <div class="rounded-xl border border-white/5 bg-black/20 px-3 py-2">
        <p class="text-xs text-slate-400">المحصل</p>
        <p class="mt-1 font-bold text-sky-300">
          {{ formatMoney(paymentsCollected, "rtl") }}
        </p>
      </div>
      <div
        v-if="showExpenses"
        class="rounded-xl border border-white/5 bg-black/20 px-3 py-2"
      >
        <p class="text-xs text-slate-400">المصروفات</p>
        <p class="mt-1 font-bold text-amber-300">
          {{ formatMoney(expenses, "rtl") }}
        </p>
      </div>
      <div class="rounded-xl border border-white/5 bg-black/20 px-3 py-2">
        <p class="text-xs text-slate-400">{{ secondaryLabel }}</p>
        <p class="mt-1 font-bold" :class="secondaryValueClass">
          {{ secondaryValue }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { formatMoney } from "~/utils/format";

defineOptions({ name: "DailyReportHero" });

const props = defineProps({
  isCustomerService: { type: Boolean, default: false },
  paymentsTotal: { type: [Number, String], default: 0 },
  paymentsCollected: { type: [Number, String], default: 0 },
  refundsTotal: { type: [Number, String], default: 0 },
  expenses: { type: [Number, String], default: 0 },
  cancelledReservations: { type: [Number, String], default: 0 },
  readyReservations: { type: [Number, String], default: 0 },
});

const showExpenses = computed(() => !props.isCustomerService);

const title = computed(() =>
  props.isCustomerService ? "مدفوعات حجوزاتك" : "صافي المدفوعات",
);

const secondaryLabel = computed(() =>
  props.isCustomerService ? "جاهزة للتسليم" : "حجوزات ملغاة",
);

const secondaryValue = computed(() =>
  props.isCustomerService
    ? Number(props.readyReservations || 0)
    : Number(props.cancelledReservations || 0),
);

const secondaryValueClass = computed(() =>
  props.isCustomerService ? "text-emerald-300" : "text-rose-300",
);
</script>
