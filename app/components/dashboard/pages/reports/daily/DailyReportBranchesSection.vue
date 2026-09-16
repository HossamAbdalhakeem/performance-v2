<template>
  <div
    v-if="branches.length"
    class="rounded-2xl border border-white/10 bg-slate-900/90 p-5"
  >
    <div class="mb-4">
      <p class="font-bold text-white">التوزيع حسب الفروع</p>
      <p class="mt-0.5 text-xs text-slate-400">
        حجوزاتك ومدفوعاتك عبر الفروع اليوم
      </p>
    </div>
    <div class="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
      <div
        v-for="branch in branches"
        :key="branch.branchId"
        class="rounded-xl border border-white/5 bg-slate-950/40 px-3 py-3"
      >
        <p class="font-semibold text-white">{{ branch.branchName }}</p>
        <div class="mt-2 flex items-center justify-between gap-2 text-sm">
          <span class="text-slate-400">حجوزات</span>
          <span class="font-bold text-amber-300">{{ branch.reservations }}</span>
        </div>
        <div class="mt-1 flex items-center justify-between gap-2 text-sm">
          <span class="text-slate-400">مدفوع</span>
          <span class="font-bold text-emerald-300">
            {{ formatMoney(branch.paidTotal, "rtl") }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { formatMoney } from "~/utils/format";

defineOptions({ name: "DailyReportBranchesSection" });

defineProps({
  branches: { type: Array, default: () => [] },
});
</script>
