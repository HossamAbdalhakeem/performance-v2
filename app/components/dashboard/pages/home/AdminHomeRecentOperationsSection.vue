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
        :value="rows"
        :columns="columns"
        :loading="loading"
        :empty-message="emptyMessage"
        :skeleton-rows="5"
      >
        <template #type="{ data }">
          <span
            class="text-sm font-medium"
            :class="typeClass(data.typeKey || data.type)"
          >
            {{ data.typeLabel || data.type || "—" }}
          </span>
        </template>
        <template #amount="{ data }">
          <span class="text-sm text-slate-200">
            {{ data.amountLabel || data.amount || "—" }}
          </span>
        </template>
      </AppDataTable>
    </div>
  </section>
</template>

<script setup>
import AppDataTable from "~/components/shared/app-data-table/index.vue";

defineOptions({ name: "AdminHomeRecentOperationsSection" });

defineProps({
  rows: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  emptyMessage: {
    type: String,
    default: "لا توجد عمليات حديثة.",
  },
});

const columns = [
  { field: "id", header: "#" },
  { field: "time", header: "الوقت" },
  { field: "type", header: "النوع", slot: "type" },
  { field: "student", header: "اسم الطالب" },
  { field: "product", header: "المنتج" },
  { field: "amount", header: "المبلغ", slot: "amount" },
  { field: "branch", header: "الفرع" },
];

const typeClass = (type) => {
  const key = String(type || "").toUpperCase();
  if (key === "DELIVERED" || key === "DELIVERY" || key === "تسليم") {
    return "text-emerald-400";
  }
  if (key === "SALE" || key === "بيع") return "text-sky-300";
  if (key === "RESERVATION" || key === "حجز") return "text-amber-300";
  return "text-slate-200";
};
</script>
