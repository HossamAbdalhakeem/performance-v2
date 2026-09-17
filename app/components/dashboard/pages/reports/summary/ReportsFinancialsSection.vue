<template>
  <div class="w-full min-w-0 overflow-hidden rounded-xl border border-white/10 bg-slate-900 p-4">
    <div class="mb-4 flex flex-wrap items-start justify-between gap-2">
      <div class="min-w-0">
        <p class="font-bold text-white">الأرباح والخسائر</p>
        <p class="mt-1 text-xs text-slate-400">
          الإيرادات − تكلفة البضاعة = إجمالي الربح، ثم خصم المصروفات التشغيلية
        </p>
      </div>
      <p
        v-if="isBranchScoped"
        class="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-[11px] text-amber-200"
      >
        صافي ربح الفرع لا يشمل المصروفات العامة
      </p>
    </div>

    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <div class="min-w-0 rounded-lg border border-white/5 bg-slate-950/60 p-3">
        <p class="truncate text-xs text-slate-400">الإيرادات (صافي المبيعات)</p>
        <p class="mt-1 break-words text-xl font-bold text-emerald-300">
          {{ formatMoney(financials.revenue, "locale") }}
        </p>
      </div>
      <div class="min-w-0 rounded-lg border border-white/5 bg-slate-950/60 p-3">
        <p class="truncate text-xs text-slate-400">تكلفة البضاعة (COGS)</p>
        <p class="mt-1 break-words text-xl font-bold text-rose-300">
          {{ formatMoney(financials.cogs, "locale") }}
        </p>
      </div>
      <div class="min-w-0 rounded-lg border border-white/5 bg-slate-950/60 p-3">
        <p class="truncate text-xs text-slate-400">إجمالي الربح</p>
        <p class="mt-1 break-words text-xl font-bold text-sky-300">
          {{ formatMoney(financials.grossProfit, "locale") }}
        </p>
      </div>
      <div class="min-w-0 rounded-lg border border-white/5 bg-slate-950/60 p-3">
        <p class="truncate text-xs text-slate-400">صافي الربح</p>
        <p class="mt-1 break-words text-xl font-bold text-white">
          {{ formatMoney(financials.netProfit, "locale") }}
        </p>
      </div>
    </div>

    <div class="mt-4 grid grid-cols-1 gap-2 text-sm text-slate-200 sm:grid-cols-2 lg:grid-cols-3">
      <p class="min-w-0 break-words">
        مصروفات الفروع:
        <strong class="text-white">
          {{ formatMoney(financials.branchExpenses, "locale") }}
        </strong>
      </p>
      <p class="min-w-0 break-words">
        مصروفات عامة:
        <strong class="text-white">
          {{ formatMoney(financials.generalExpenses, "locale") }}
        </strong>
        <span v-if="isBranchScoped" class="text-xs text-slate-500">
          (غير مخصومة من صافي الفرع)
        </span>
      </p>
      <p class="min-w-0 break-words">
        إجمالي المصروفات التشغيلية:
        <strong class="text-white">
          {{ formatMoney(financials.operatingExpenses, "locale") }}
        </strong>
      </p>
      <p class="min-w-0 break-words">
        عربونات الحجوزات (منفصلة عن الإيرادات):
        <strong class="text-amber-200">
          {{ formatMoney(reservationDeposits, "locale") }}
        </strong>
      </p>
    </div>
  </div>
</template>

<script setup>
import { formatMoney } from "~/utils/format";

defineOptions({ name: "ReportsFinancialsSection" });

defineProps({
  financials: { type: Object, default: () => ({}) },
  reservationDeposits: { type: [Number, String], default: 0 },
  isBranchScoped: { type: Boolean, default: false },
});
</script>
