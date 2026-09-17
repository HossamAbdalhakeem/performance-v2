<template>
  <section class="space-y-3">
    <div>
      <p class="font-bold text-white">أحدث العمليات</p>
      <p class="mt-0.5 text-xs text-slate-400">
        آخر 5 عمليات عبر النظام
      </p>
    </div>

    <div class="rounded-2xl border border-white/10 bg-slate-900/90 p-4">
      <AppDataTable
        :value="displayRows"
        :columns="columns"
        :loading="loading"
        :empty-message="emptyMessage"
        :skeleton-rows="5"
      >
        <template #type="{ data }">
          <AppStatusTag
            :kind="resolveTypeKind(data.typeKey)"
            :code="data.typeKey"
            :label="data.typeLabel"
          />
        </template>
        <template #amount="{ data }">
          <span class="text-sm font-semibold" :class="data.amountClass">
            {{ data.amountLabel }}
          </span>
        </template>
        <template #branch="{ data }">
          <span
            class="inline-flex max-w-full truncate rounded-lg bg-sky-500/10 px-2 py-1 text-xs font-medium text-sky-300"
          >
            {{ data.branch }}
          </span>
        </template>
      </AppDataTable>
    </div>
  </section>
</template>

<script setup>
import AppDataTable from "~/components/shared/app-data-table/index.vue";
import AppStatusTag from "~/components/shared/app-status-tag/index.vue";
import { formatMoney, formatDateTime } from "~/utils/format";
import {
  getTransactionTypeLabel,
  getReservationStatusLabel,
} from "~/utils/domainLabels";

defineOptions({ name: "AdminHomeRecentOperationsSection" });

const props = defineProps({
  rows: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  emptyMessage: {
    type: String,
    default: "لا توجد عمليات حديثة.",
  },
});

const RESERVATION_TYPE_KEYS = new Set([
  "DELIVERED",
  "CANCELLED",
  "READY",
  "PENDING",
  "WAITING_FOR_STOCK",
]);

const OUTFLOW_TYPES = new Set(["RETURN", "CANCELLED", "REFUND"]);

const columns = [
  { field: "id", header: "#" },
  { field: "time", header: "الوقت" },
  { field: "type", header: "النوع", slot: "type" },
  { field: "student", header: "اسم الطالب" },
  { field: "product", header: "المنتج" },
  { field: "amount", header: "المبلغ", slot: "amount" },
  { field: "branch", header: "الفرع", slot: "branch" },
];

const resolveTypeKind = (type) => {
  const key = String(type || "").toUpperCase();
  return RESERVATION_TYPE_KEYS.has(key) ? "reservation" : "transaction";
};

const resolveTypeLabel = (type) => {
  const key = String(type || "").toUpperCase();
  if (!key) return "—";
  if (RESERVATION_TYPE_KEYS.has(key)) return getReservationStatusLabel(key);
  return getTransactionTypeLabel(key);
};

const resolveAmount = (row) => {
  if (row.amountRaw != null && Number.isFinite(Number(row.amountRaw))) {
    return Number(row.amountRaw);
  }
  if (typeof row.amount === "number" && Number.isFinite(row.amount)) {
    return row.amount;
  }
  if (row.amount != null && row.amount !== "" && row.amount !== "—") {
    const parsed = Number(row.amount);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
};

const resolveAmountClass = (typeKey, amount) => {
  if (amount == null) return "text-slate-500";
  if (OUTFLOW_TYPES.has(typeKey) || amount < 0) return "text-rose-400";
  if (amount === 0) return "text-slate-400";
  return "text-emerald-400";
};

const displayRows = computed(() =>
  (Array.isArray(props.rows) ? props.rows : []).map((row, index) => {
    const typeKey = String(row.typeKey || row.type || "").toUpperCase();
    const amount = resolveAmount(row);
    const branch = row.branch || "—";

    return {
      id: row.id ?? index + 1,
      time: formatDateTime(row.timeRaw || row.time, "datetime"),
      typeKey,
      typeLabel: row.typeLabel || resolveTypeLabel(typeKey),
      student: row.student || "—",
      product: row.product || "—",
      amountLabel: amount == null ? "—" : formatMoney(amount, "rtl"),
      amountClass: resolveAmountClass(typeKey, amount),
      branch,
    };
  }),
);
</script>
